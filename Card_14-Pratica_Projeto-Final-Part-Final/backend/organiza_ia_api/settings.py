from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file='.env', env_file_encoding='utf-8', extra='ignore'
    )

    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = 'HS256'
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    PASSWORD_RESET_CODE_EXPIRE_MINUTES: int = 15

    ACCESS_TOKEN_COOKIE_NAME: str = 'access_token'
    # SameSite=None exige Secure=True (regra dos navegadores). Em dev,
    # front e back rodam no mesmo site (localhost), então Lax + Secure
    # desligado funciona. Em produção com domínios diferentes, ajuste
    # COOKIE_SECURE=true e troque para SameSite=None no deploy.
    COOKIE_SECURE: bool = False

    CORS_ORIGINS: str = 'http://localhost:3000'

    MAIL_USERNAME: str = 'organiza-ia@example.com'
    MAIL_PASSWORD: str = ''
    MAIL_FROM: str = 'organiza-ia@example.com'
    MAIL_PORT: int = 1025
    MAIL_SERVER: str = 'localhost'
    MAIL_STARTTLS: bool = False
    MAIL_SSL_TLS: bool = False
    MAIL_SUPPRESS_SEND: bool = True

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(',')]


@lru_cache
def get_settings() -> Settings:
    return Settings()
