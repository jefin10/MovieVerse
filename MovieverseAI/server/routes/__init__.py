"""Blueprint registration."""
from flask import Flask

from .health import health_bp
from .mood import mood_bp
from .recommend import recommend_bp


def register_blueprints(app: Flask) -> None:
    app.register_blueprint(health_bp)
    app.register_blueprint(mood_bp)
    app.register_blueprint(recommend_bp)
