from pydantic import BaseSettings

class Settings(BaseSettings):
    app_name: str = "Qualiopi FastAPI App"
    admin_email: str
    secret_key: str
    database_url: str
    debug: bool = False

    class Config:
        env_file = ".env"

settings = Settings()