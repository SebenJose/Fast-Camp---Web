"""add password_changed_at, FK indexes and python-side timestamps

Revision ID: a1f4c8d92b37
Revises: b4e1f2a3c5d6
Create Date: 2026-07-03 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = 'a1f4c8d92b37'
down_revision: Union[str, Sequence[str], None] = 'b4e1f2a3c5d6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Tokens emitidos antes dessa data são rejeitados (derruba sessões
    # ativas quando a senha muda).
    op.add_column(
        'users',
        sa.Column('password_changed_at', sa.DateTime(), nullable=True),
    )

    # Índices para as FKs consultadas com frequência (a agenda re-busca os
    # eventos a cada mutação e o fluxo de reset filtra tokens por usuário)
    # e para a limpeza de tokens expirados.
    op.create_index(
        op.f('ix_password_reset_tokens_user_id'),
        'password_reset_tokens',
        ['user_id'],
    )
    op.create_index(
        op.f('ix_password_reset_tokens_expires_at'),
        'password_reset_tokens',
        ['expires_at'],
    )
    op.create_index(
        op.f('ix_schedule_events_schedule_id'),
        'schedule_events',
        ['schedule_id'],
    )

    # Timestamps agora são gerados no Python (sempre UTC naive), então os
    # defaults now() do Postgres - que dependem do timezone do servidor -
    # deixam de existir.
    for table, column in [
        ('users', 'created_at'),
        ('users', 'updated_at'),
        ('password_reset_tokens', 'created_at'),
        ('schedules', 'created_at'),
        ('schedules', 'updated_at'),
        ('schedule_events', 'created_at'),
    ]:
        op.alter_column(table, column, server_default=None)


def downgrade() -> None:
    """Downgrade schema."""
    for table, column in [
        ('users', 'created_at'),
        ('users', 'updated_at'),
        ('password_reset_tokens', 'created_at'),
        ('schedules', 'created_at'),
        ('schedules', 'updated_at'),
        ('schedule_events', 'created_at'),
    ]:
        op.alter_column(table, column, server_default=sa.text('now()'))

    op.drop_index(
        op.f('ix_schedule_events_schedule_id'), table_name='schedule_events'
    )
    op.drop_index(
        op.f('ix_password_reset_tokens_expires_at'),
        table_name='password_reset_tokens',
    )
    op.drop_index(
        op.f('ix_password_reset_tokens_user_id'),
        table_name='password_reset_tokens',
    )
    op.drop_column('users', 'password_changed_at')
