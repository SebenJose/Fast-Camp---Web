from functools import lru_cache

from pydantic import Field
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

    AI_API_KEY: str = ''
    AI_BASE_URL: str = 'https://openrouter.ai/api/v1'
    # Lista separada por vírgula: cada modelo é fallback do anterior
    AI_MODEL: str = (
        'openai/gpt-oss-20b:free,'
        'openai/gpt-oss-120b:free,'
        'meta-llama/llama-3.3-70b-instruct:free,'
        'qwen/qwen3-next-80b-a3b-instruct:free'
    )
    AI_MAX_OUTPUT_TOKENS: int = 512
    AI_TIMEOUT_SECONDS: float = 30.0
    AI_TOTAL_TIMEOUT_SECONDS: float = 45.0

    TOKEN_WEEKLY_LIMIT: int = Field(default=100_000, gt=0)
    METRICS_TIMEZONE: str = 'America/Sao_Paulo'

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
