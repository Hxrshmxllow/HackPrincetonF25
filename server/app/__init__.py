from flask import Flask, request
from flask_cors import CORS
from .routes.recommendation import recommendations_bp
from .routes.listings import listings_bp
from .routes.ai_analysis import ai_bp
import os
from dotenv import load_dotenv

def create_app():
    app = Flask(__name__)

    load_dotenv()

    CORS(
        app,
        origins=[
            "http://localhost:5173", 
            "http://localhost:4173",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:4173"
        ], #add frontend url once hosted
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        expose_headers=["Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    )
    
    app.secret_key = os.getenv("SECRET_KEY")

    app.register_blueprint(recommendations_bp, url_prefix="/recommendations")
    app.register_blueprint(listings_bp, url_prefix="/listings")
    app.register_blueprint(ai_bp, url_prefix="/ai")
    @app.route("/")
    def root():
        return {"message": "HackPrincetonF25 backend running on AWS-ready Flask app"}
    
    

    return app