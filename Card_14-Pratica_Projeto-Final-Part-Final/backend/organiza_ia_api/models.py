from datetime import datetime, timezone
from uuid import UUID, uuid4

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, registry

table_registry = registry()

INITIAL_TOKEN_BALANCE = 10_000


def utcnow() -> datetime:
    # UTC naive gerado no Python: os timestamps não dependem do timezone
    # do servidor de banco.
    return datetime.now(timezone.utc).replace(tzinfo=None)


@table_registry.mapped_as_dataclass
class User:
    __tablename__ = 'users'

    name: Mapped[str]
    email: Mapped[str] = mapped_column(unique=True)
    password_hash: Mapped[str]
    id: Mapped[UUID] = mapped_column(
        init=False, primary_key=True, default=uuid4
    )
    # Tokens JWT emitidos antes dessa data são rejeitados: trocar a senha
    # derruba todas as sessões abertas.
    password_changed_at: Mapped[datetime | None] = mapped_column(
        init=False, default=None
    )
    token_balance: Mapped[int] = mapped_column(
        init=False, default=INITIAL_TOKEN_BALANCE
    )
    failed_login_attempts: Mapped[int] = mapped_column(init=False, default=0)
    login_locked_until: Mapped[datetime | None] = mapped_column(
        init=False, default=None
    )
    created_at: Mapped[datetime] = mapped_column(
        init=False, insert_default=utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        init=False, insert_default=utcnow, onupdate=utcnow
    )


@table_registry.mapped_as_dataclass
class PasswordResetToken:
    __tablename__ = 'password_reset_tokens'

    user_id: Mapped[UUID] = mapped_column(
        ForeignKey('users.id', ondelete='CASCADE'), index=True
    )
    code_hash: Mapped[str]
    expires_at: Mapped[datetime] = mapped_column(index=True)
    id: Mapped[UUID] = mapped_column(
        init=False, primary_key=True, default=uuid4
    )
    used_at: Mapped[datetime | None] = mapped_column(init=False, default=None)
    attempts: Mapped[int] = mapped_column(init=False, default=0)
    created_at: Mapped[datetime] = mapped_column(
        init=False, insert_default=utcnow
    )


@table_registry.mapped_as_dataclass
class Schedule:
    __tablename__ = 'schedules'

    user_id: Mapped[UUID] = mapped_column(
        ForeignKey('users.id', ondelete='CASCADE'), unique=True
    )
    day_range_start_minutes: Mapped[int] = mapped_column(default=6 * 60)
    day_range_end_minutes: Mapped[int] = mapped_column(default=22 * 60)
    id: Mapped[UUID] = mapped_column(
        init=False, primary_key=True, default=uuid4
    )
    created_at: Mapped[datetime] = mapped_column(
        init=False, insert_default=utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        init=False, insert_default=utcnow, onupdate=utcnow
    )


@table_registry.mapped_as_dataclass
class TokenTransaction:
    __tablename__ = 'token_transactions'

    user_id: Mapped[UUID] = mapped_column(
        ForeignKey('users.id', ondelete='CASCADE'), index=True
    )
    type: Mapped[str]
    amount: Mapped[int]
    balance_after: Mapped[int]
    id: Mapped[UUID] = mapped_column(
        init=False, primary_key=True, default=uuid4
    )
    created_at: Mapped[datetime] = mapped_column(
        init=False, insert_default=utcnow, index=True
    )


@table_registry.mapped_as_dataclass
class ChatMessage:
    __tablename__ = 'chat_messages'

    user_id: Mapped[UUID] = mapped_column(
        ForeignKey('users.id', ondelete='CASCADE'), index=True
    )
    role: Mapped[str]
    content: Mapped[str]
    input_tokens: Mapped[int] = mapped_column(default=0)
    output_tokens: Mapped[int] = mapped_column(default=0)
    id: Mapped[UUID] = mapped_column(
        init=False, primary_key=True, default=uuid4
    )
    created_at: Mapped[datetime] = mapped_column(
        init=False, insert_default=utcnow, index=True
    )


@table_registry.mapped_as_dataclass
class ScheduleEvent:
    __tablename__ = 'schedule_events'

    schedule_id: Mapped[UUID] = mapped_column(
        ForeignKey('schedules.id', ondelete='CASCADE'), index=True
    )
    period_id: Mapped[str]
    title: Mapped[str]
    start_minutes: Mapped[int]
    end_minutes: Mapped[int]
    tone: Mapped[str | None] = mapped_column(default=None)
    completed: Mapped[bool] = mapped_column(default=False)
    id: Mapped[UUID] = mapped_column(
        init=False, primary_key=True, default=uuid4
    )
    created_at: Mapped[datetime] = mapped_column(
        init=False, insert_default=utcnow
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        init=False, default=None
    )
