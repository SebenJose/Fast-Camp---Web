"""drop now() defaults on chat_messages and token_transactions

Revision ID: f1a2b3c4d5e6
Revises: e5f6a7b8c9d0
Create Date: 2026-07-11 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = 'f1a2b3c4d5e6'
down_revision: Union[str, Sequence[str], None] = 'e5f6a7b8c9d0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Timestamps são gerados no Python (sempre UTC naive); os defaults now()
    # do Postgres dependem do timezone do servidor e reintroduziriam a
    # inconsistência que a a1f4c8d92b37 removeu das demais tabelas.
    for table, column in [
        ('chat_messages', 'created_at'),
        ('token_transactions', 'created_at'),
    ]:
        op.alter_column(table, column, server_default=None)


def downgrade() -> None:
    """Downgrade schema."""
    for table, column in [
        ('chat_messages', 'created_at'),
        ('token_transactions', 'created_at'),
    ]:
        op.alter_column(table, column, server_default=sa.text('now()'))
