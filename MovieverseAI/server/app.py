"""Flask application factory."""
import hmac

from flask import Flask, jsonify, request
from flask_cors import CORS

from config import Config
from routes import register_blueprints


def create_app(config: type[Config] = Config) -> Flask:
    app = Flask(__name__)
    app.config.from_object(config)

    CORS(app, resources={r"/*": {"origins": app.config["CORS_ORIGINS"]}})

    @app.before_request
    def require_service_token():
        # Only the Node backend may call this service; /health stays open for probes.
        token = app.config["SERVICE_TOKEN"]
        if not token or request.path == "/health":
            return None
        if not hmac.compare_digest(request.headers.get("x-service-token", ""), token):
            return jsonify({"error": "Unauthorized"}), 401
        return None

    register_blueprints(app)
    return app
