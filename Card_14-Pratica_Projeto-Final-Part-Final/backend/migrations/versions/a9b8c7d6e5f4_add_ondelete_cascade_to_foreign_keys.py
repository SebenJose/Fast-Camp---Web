"""add ondelete cascade to foreign keys

Revision ID: a9b8c7d6e5f4
Revises: d4e5f6a7b8c9
Create Date: 2026-07-17 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op

revision: str = 'a9b8c7d6e5f4'
down_revision: Union[str, Sequence[str], None] = 'd4e5f6a7b8c9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

FOREIGN_KEYS = [
    ('password_reset_tokens', 'user_id', 'users'),
    ('schedules', 'user_id', 'users'),
    ('token_transactions', 'user_id', 'users'),
    ('chat_messages', 'user_id', 'users'),
    ('schedule_events', 'schedule_id', 'schedules'),
]


def upgrade() -> None:
    """Upgrade schema."""
    for table, column, referent in FOREIGN_KEYS:
        constraint = f'{table}_{column}_fkey'
        op.drop_constraint(constraint, table, type_='foreignkey')
        op.create_foreign_key(
            constraint, table, referent, [column], ['id'], ondelete='CASCADE'
        )


def downgrade() -> None:
    """Downgrade schema."""
    for table, column, referent in FOREIGN_KEYS:
        constraint = f'{table}_{column}_fkey'
        op.drop_constraint(constraint, table, type_='foreignkey')
        op.create_foreign_key(constraint, table, referent, [column], ['id'])
