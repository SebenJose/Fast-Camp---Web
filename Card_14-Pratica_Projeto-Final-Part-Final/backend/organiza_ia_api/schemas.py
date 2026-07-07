import re
from datetime import datetime
from typing import Annotated, Any
from uuid import UUID

from pydantic import (
    BaseModel,
    BeforeValidator,
    ConfigDict,
    EmailStr,
    Field,
    ValidationInfo,
    field_validator,
    model_validator,
)

# Todo campo de texto livre tem teto de tamanho: sem isso um payload
# gigante chegaria inteiro ao Argon2 (hash caro) ou ao banco.
MIN_PASSWORD_LENGTH = 6
MAX_PASSWORD_LENGTH = 128
MAX_EMAIL_LENGTH = 254  # limite prático do RFC 5321
MAX_USER_ID_LENGTH = 64
MIN_NAME_LENGTH = 2
MAX_NAME_LENGTH = 120
RESET_CODE_PATTERN = re.compile(r'^\d{6}$')


def _check_email_length(value: Any) -> Any:
    # Roda antes do EmailStr (BeforeValidator): barra strings gigantes com
    # uma checagem barata, sem entregar o valor ao parser de e-mail.
    if isinstance(value, str) and len(value) > MAX_EMAIL_LENGTH:
        raise ValueError(
            f'O e-mail pode ter no máximo {MAX_EMAIL_LENGTH} caracteres.'
        )
    return value


Email = Annotated[EmailStr, BeforeValidator(_check_email_length)]


def _validate_passwords_match(password: str, confirmation: str) -> str:
    if password != confirmation:
        raise ValueError('As senhas precisam ser iguais.')
    return confirmation


def _validate_password_length(password: str) -> str:
    if len(password) < MIN_PASSWORD_LENGTH:
        raise ValueError('A senha precisa ter pelo menos 6 caracteres.')
    if len(password) > MAX_PASSWORD_LENGTH:
        raise ValueError(
            f'A senha pode ter no máximo {MAX_PASSWORD_LENGTH} caracteres.'
        )
    return password


def _validate_reset_code_format(code: str) -> str:
    if not RESET_CODE_PATTERN.match(code):
        raise ValueError('Informe os 6 dígitos do código de verificação.')
    return code


def _validate_name(name: str) -> str:
    stripped = name.strip()
    if len(stripped) < MIN_NAME_LENGTH:
        raise ValueError('Informe seu nome.')
    if len(stripped) > MAX_NAME_LENGTH:
        raise ValueError(
            f'O nome pode ter no máximo {MAX_NAME_LENGTH} caracteres.'
        )
    return stripped


class Message(BaseModel):
    message: str


class SessionPublic(BaseModel):
    userId: str
    name: str
    email: EmailStr


class AuthResponse(BaseModel):
    message: str | None = None
    session: SessionPublic | None = None
    access_token: str | None = None


class RegisterRequest(BaseModel):
    name: str
    email: Email
    password: str
    passwordConfirmation: str

    @field_validator('name')
    @classmethod
    def name_valid(cls, value: str) -> str:
        return _validate_name(value)

    @field_validator('password')
    @classmethod
    def password_length(cls, value: str) -> str:
        return _validate_password_length(value)

    @field_validator('passwordConfirmation')
    @classmethod
    def passwords_match(cls, value: str, info: ValidationInfo) -> str:
        return _validate_passwords_match(info.data.get('password', ''), value)


class LoginRequest(BaseModel):
    email: Email
    password: str

    @field_validator('password')
    @classmethod
    def password_length(cls, value: str) -> str:
        # Nenhuma senha válida existe fora dos limites do cadastro, então
        # dá pra rejeitar cedo sem rodar o Argon2 em uma string enorme.
        return _validate_password_length(value)


class UserPublic(BaseModel):
    id: UUID
    name: str
    email: EmailStr
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserUpdateRequest(BaseModel):
    name: str | None = None
    email: Email | None = None
    password: str | None = None
    passwordConfirmation: str | None = None

    @field_validator('name')
    @classmethod
    def name_valid(cls, value: str | None) -> str | None:
        return _validate_name(value) if value is not None else value

    @field_validator('password')
    @classmethod
    def password_length(cls, value: str | None) -> str | None:
        return _validate_password_length(value) if value is not None else value

    @model_validator(mode='after')
    def passwords_match(self) -> 'UserUpdateRequest':
        # Precisa ser model_validator: um field_validator não roda quando o
        # campo é omitido do payload, o que deixaria passar uma troca de
        # senha sem confirmação.
        if self.password is None and self.passwordConfirmation is None:
            return self

        if self.password is None or self.passwordConfirmation is None:
            raise ValueError(
                'Informe a senha e a confirmação juntas para alterá-la.'
            )

        _validate_passwords_match(self.password, self.passwordConfirmation)
        return self


class ForgotPasswordRequest(BaseModel):
    email: Email


class ForgotPasswordVerifyRequest(BaseModel):
    email: Email
    code: str

    @field_validator('code')
    @classmethod
    def code_format(cls, value: str) -> str:
        return _validate_reset_code_format(value)


class ForgotPasswordResetRequest(BaseModel):
    email: Email
    code: str
    password: str
    passwordConfirmation: str

    @field_validator('code')
    @classmethod
    def code_format(cls, value: str) -> str:
        return _validate_reset_code_format(value)

    @field_validator('password')
    @classmethod
    def password_length(cls, value: str) -> str:
        return _validate_password_length(value)

    @field_validator('passwordConfirmation')
    @classmethod
    def passwords_match(cls, value: str, info: ValidationInfo) -> str:
        return _validate_passwords_match(info.data.get('password', ''), value)


# ---------------------------------------------------------------------------
# Schedule schemas
# ---------------------------------------------------------------------------

SCHEDULE_TIME_PATTERN = re.compile(r'^([01]\d|2[0-3]):[0-5]\d$')
SCHEDULE_TONES = frozenset({'slate', 'mint', 'sky', 'amber', 'rose'})
SCHEDULE_EVENT_TITLE_MAX_LENGTH = 100

_MINUTES_MAX = 23 * 60 + 59


def time_to_minutes(time_str: str) -> int:
    h, m = time_str.split(':')
    return int(h) * 60 + int(m)


class ScheduleDayRange(BaseModel):
    startMinutes: int = Field(ge=0, le=_MINUTES_MAX)
    endMinutes: int = Field(ge=0, le=_MINUTES_MAX)

    @model_validator(mode='after')
    def end_after_start(self) -> 'ScheduleDayRange':
        if self.endMinutes <= self.startMinutes:
            raise ValueError('O fim do dia precisa ser depois do começo.')
        return self


class ScheduleEventPublic(BaseModel):
    id: str
    title: str
    tone: str | None = None
    completed: bool = False
    startMinutes: int
    endMinutes: int


class SchedulePublic(BaseModel):
    dayRange: ScheduleDayRange
    eventsByPeriodId: dict[str, list[ScheduleEventPublic]]


class ScheduleResponse(BaseModel):
    message: str | None = None
    schedule: SchedulePublic | None = None


class ScheduleEventFormValues(BaseModel):
    title: str
    startTime: str
    endTime: str
    tone: str

    @field_validator('title')
    @classmethod
    def title_valid(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError('Informe um título para criar o card.')
        if len(stripped) > SCHEDULE_EVENT_TITLE_MAX_LENGTH:
            raise ValueError(
                f'O título pode ter no máximo '
                f'{SCHEDULE_EVENT_TITLE_MAX_LENGTH} caracteres.'
            )
        return stripped

    @field_validator('startTime', 'endTime')
    @classmethod
    def time_format(cls, value: str) -> str:
        if not SCHEDULE_TIME_PATTERN.match(value):
            raise ValueError('Informe um horário no formato HH:mm.')
        return value

    @field_validator('tone')
    @classmethod
    def tone_valid(cls, value: str) -> str:
        if value not in SCHEDULE_TONES:
            raise ValueError(
                f'Tom inválido. Use: {", ".join(sorted(SCHEDULE_TONES))}.'
            )
        return value

    @model_validator(mode='after')
    def end_after_start(self) -> 'ScheduleEventFormValues':
        if time_to_minutes(self.endTime) <= time_to_minutes(self.startTime):
            raise ValueError('O fim do card precisa ser depois do início.')
        return self


# O userId abaixo só espelha o contrato do frontend da Part 1; o backend
# nunca o usa - o dono da agenda vem exclusivamente do token, para ninguém
# mexer na agenda de outro usuário trocando o userId do corpo.
class CreateScheduleEventRequest(BaseModel):
    userId: str = Field(max_length=MAX_USER_ID_LENGTH)
    event: ScheduleEventFormValues


class UpdateDayRangeRequest(BaseModel):
    userId: str = Field(max_length=MAX_USER_ID_LENGTH)
    dayRange: ScheduleDayRange


class ToggleEventRequest(BaseModel):
    userId: str = Field(max_length=MAX_USER_ID_LENGTH)
