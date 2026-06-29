"""Flask application factory."""
from flask import Flask
from flask_cors import CORS

from config import Config
from routes import register_blueprints


def create_app(config: type[Config] = Config) -> Flask:
    app = Flask(__name__)
    app.config.from_object(config)

    CORS(app, resources={r"/*": {"origins": app.config["CORS_ORIGINS"]}})

    register_blueprints(app)
    return app
