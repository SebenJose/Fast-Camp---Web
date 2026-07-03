from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType

from organiza_ia_api.settings import get_settings


def get_mail_config() -> ConnectionConfig:
    settings = get_settings()

    return ConnectionConfig(
        MAIL_USERNAME=settings.MAIL_USERNAME,
        MAIL_PASSWORD=settings.MAIL_PASSWORD,
        MAIL_FROM=settings.MAIL_FROM,
        MAIL_PORT=settings.MAIL_PORT,
        MAIL_SERVER=settings.MAIL_SERVER,
        MAIL_STARTTLS=settings.MAIL_STARTTLS,
        MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
        SUPPRESS_SEND=settings.MAIL_SUPPRESS_SEND,
        USE_CREDENTIALS=bool(settings.MAIL_PASSWORD),
    )


async def send_password_reset_code(email: str, code: str) -> None:
    message = MessageSchema(
        subject='Organiza.IA - Código de recuperação de senha',
        recipients=[email],
        body=(
            f'<p>Seu código de recuperação de senha é <strong>{code}</strong>.</p>'
            f'<p>Ele expira em alguns minutos. Se você não solicitou, ignore este e-mail.</p>'
        ),
        subtype=MessageType.html,
    )

    fast_mail = FastMail(get_mail_config())
    await fast_mail.send_message(message)
