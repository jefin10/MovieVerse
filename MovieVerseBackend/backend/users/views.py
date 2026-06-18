import logging
import secrets
from datetime import timedelta

from django.contrib.auth import authenticate, get_user_model, login, logout
from django.contrib.auth.hashers import check_password, make_password
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.db import IntegrityError, transaction
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from users.models import CustomUser, PasswordResetOTP

logger = logging.getLogger(__name__)
User = get_user_model()

OTP_LENGTH = 6
OTP_EXPIRY_MINUTES = 10
OTP_MAX_ATTEMPTS = 5
OTP_COOLDOWN_SECONDS = 60
OTP_MAX_REQUESTS_PER_HOUR = 5


def _generate_numeric_otp(length: int = OTP_LENGTH) -> str:
    return ''.join(str(secrets.randbelow(10)) for _ in range(length))


def _generic_forgot_password_response() -> Response:
    return Response(
        {"message": "If the account exists, a one-time code has been sent to the registered email."},
        status=status.HTTP_200_OK,
    )


def _get_client_ip(request) -> str:
    forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR', '')
    if forwarded_for:
        return forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR', '')


@ensure_csrf_cookie
def get_csrf_token(request):
    return JsonResponse({"message": "CSRF cookie set"})


@api_view(['POST'])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def register_user(request):
    username = (request.data.get('username') or '').strip()
    email = (request.data.get('email') or '').strip()
    password = request.data.get('password') or ''

    if not username or not email or not password:
        return Response(
            {"error": "Username, email, and password are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        validate_password(password)
    except ValidationError as exc:
        return Response({"error": list(exc.messages)}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = CustomUser.objects.create_user(username=username, email=email, password=password)
        user.save()
    except IntegrityError:
        return Response(
            {"error": "Username or email already exists."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response({"message": "User created successfully!"}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@authentication_classes([SessionAuthentication])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    logger.info("Attempting to authenticate user '%s'", username)

    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        return Response({"message": "Login successful"}, status=status.HTTP_200_OK)

    logger.warning("Failed login attempt for '%s'", username)
    return Response({"error": "Invalid credentials!"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def logout_user(request):
    logout(request)
    response = Response({"message": "Logout successful!"}, status=status.HTTP_200_OK)
    response.delete_cookie('sessionid')
    response.delete_cookie('csrftoken')
    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def test(request):
    return Response({"message": "This is a protected resource"})


@api_view(['GET'])
@permission_classes([AllowAny])
def check_username_availability(request):
    username = request.GET.get('username')
    if not username:
        return JsonResponse({'error': 'Username not provided'}, status=400)

    exists = User.objects.filter(username=username).exists()
    return JsonResponse({'available': not exists})


@api_view(['GET'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def validate_session(request):
    return JsonResponse({'valid': True})


@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    username = (request.data.get('username') or '').strip()
    if not username:
        return _generic_forgot_password_response()

    user = User.objects.filter(username=username).first()
    if not user:
        return _generic_forgot_password_response()

    now = timezone.now()
    hourly_window_start = now - timedelta(hours=1)
    recent_request_count = PasswordResetOTP.objects.filter(
        user=user,
        created_at__gte=hourly_window_start,
    ).count()
    if recent_request_count >= OTP_MAX_REQUESTS_PER_HOUR:
        logger.warning("Password reset hourly limit reached for '%s'", username)
        return _generic_forgot_password_response()

    latest_request = PasswordResetOTP.objects.filter(
        user=user,
        used_at__isnull=True,
    ).order_by('-created_at').first()
    if latest_request and (now - latest_request.created_at).total_seconds() < OTP_COOLDOWN_SECONDS:
        return _generic_forgot_password_response()

    otp = _generate_numeric_otp()
    expires_at = now + timedelta(minutes=OTP_EXPIRY_MINUTES)
    reset_request = PasswordResetOTP.objects.create(
        user=user,
        otp_hash=make_password(otp),
        expires_at=expires_at,
        request_ip=_get_client_ip(request),
    )

    try:
        send_mail(
            'Your OTP for Password Reset',
            (
                f'Your one-time password is: {otp}\n'
                f'It expires in {OTP_EXPIRY_MINUTES} minutes.'
            ),
            'no-reply@movieverse.app',
            [user.email],
            fail_silently=False,
        )
    except Exception:
        logger.exception("Failed to send password reset OTP for '%s'", username)
        reset_request.delete()

    return _generic_forgot_password_response()


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    username = (request.data.get('username') or '').strip()
    otp = (request.data.get('otp') or '').strip()
    if not username or not otp:
        return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.filter(username=username).first()
    if not user:
        return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)

    now = timezone.now()
    reset_request = PasswordResetOTP.objects.filter(
        user=user,
        used_at__isnull=True,
    ).order_by('-created_at').first()

    if not reset_request or reset_request.is_expired():
        return Response({"error": "Invalid or expired OTP"}, status=status.HTTP_400_BAD_REQUEST)

    if reset_request.failed_attempts >= OTP_MAX_ATTEMPTS:
        return Response(
            {"error": "Too many invalid attempts. Please request a new OTP."},
            status=status.HTTP_429_TOO_MANY_REQUESTS,
        )

    if not check_password(otp, reset_request.otp_hash):
        reset_request.failed_attempts += 1
        reset_request.save(update_fields=['failed_attempts'])
        if reset_request.failed_attempts >= OTP_MAX_ATTEMPTS:
            return Response(
                {"error": "Too many invalid attempts. Please request a new OTP."},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )
        return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)

    reset_token = secrets.token_urlsafe(32)
    reset_request.verified_at = now
    reset_request.reset_token_hash = make_password(reset_token)
    reset_request.failed_attempts = 0
    reset_request.save(update_fields=['verified_at', 'reset_token_hash', 'failed_attempts'])

    # Keep only one active verified flow.
    PasswordResetOTP.objects.filter(
        user=user,
        used_at__isnull=True,
    ).exclude(pk=reset_request.pk).update(used_at=now)

    return Response(
        {"message": "OTP verified", "reset_token": reset_token},
        status=status.HTTP_200_OK,
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    username = (request.data.get('username') or '').strip()
    new_password = request.data.get('password') or ''
    reset_token = (request.data.get('reset_token') or '').strip()

    if not username or not new_password or not reset_token:
        return Response(
            {"error": "Username, reset token, and password are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = User.objects.filter(username=username).first()
    if not user:
        return Response({"error": "Invalid reset session"}, status=status.HTTP_400_BAD_REQUEST)

    now = timezone.now()
    reset_request = PasswordResetOTP.objects.filter(
        user=user,
        verified_at__isnull=False,
        used_at__isnull=True,
    ).order_by('-verified_at').first()
    if not reset_request or reset_request.is_expired():
        return Response({"error": "Invalid or expired reset session"}, status=status.HTTP_400_BAD_REQUEST)

    if not reset_request.reset_token_hash or not check_password(reset_token, reset_request.reset_token_hash):
        return Response({"error": "Invalid reset session"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        validate_password(new_password, user=user)
    except ValidationError as exc:
        return Response({"error": list(exc.messages)}, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        user.set_password(new_password)
        user.save(update_fields=['password'])
        reset_request.used_at = now
        reset_request.save(update_fields=['used_at'])
        PasswordResetOTP.objects.filter(
            user=user,
            used_at__isnull=True,
        ).exclude(pk=reset_request.pk).update(used_at=now)

    return Response({'message': 'Password updated'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def get_email(request):
    return JsonResponse({'email': request.user.email, 'username': request.user.username})
