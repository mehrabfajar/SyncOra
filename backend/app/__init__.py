from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from config import Config

db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)

    from app.routes.events import events_bp
    from app.routes.slots import slots_bp
    from app.routes.responses import responses_bp

    app.register_blueprint(events_bp, url_prefix="/api/events")
    app.register_blueprint(slots_bp, url_prefix="/api/slots")
    app.register_blueprint(responses_bp, url_prefix="/api/responses")

    @app.route("/api/health")
    def health():
        return {"status": "ok"}

    return app
