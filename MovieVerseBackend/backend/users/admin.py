from django.contrib import admin
from .models import CustomUser, PasswordResetOTP


@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'email', 'is_staff', 'is_active')
    search_fields = ('username', 'email')
    list_filter = ('is_staff', 'is_active')


@admin.register(PasswordResetOTP)
class PasswordResetOTPAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'user',
        'created_at',
        'expires_at',
        'verified_at',
        'used_at',
        'failed_attempts',
    )
    search_fields = ('user__username', 'user__email')
    list_filter = ('verified_at', 'used_at')
