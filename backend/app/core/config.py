import os
from pydantic import BaseSettings

class Settings(BaseSettings):
    app_name: str = "Qualiopi FastAPI App"
    admin_email: str = "admin@example.com"
    secret_key: str = "supersecret"
    database_url: str = "sqlite:///./sql_app.db"
    debug: bool = True

    class Config:
        env_file = ".env"

settings = Settings()
