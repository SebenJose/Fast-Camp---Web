"""create chat_messages table

Revision ID: d8a2b5c4e7f1
Revises: a1f4c8d92b37
Create Date: 2026-07-09 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = 'd8a2b5c4e7f1'
down_revision: Union[str, Sequence[str], None] = 'a1f4c8d92b37'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'chat_messages',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('user_id', sa.Uuid(), nullable=False),
        sa.Column('role', sa.String(), nullable=False),
        sa.Column('content', sa.String(), nullable=False),
        sa.Column(
            'input_tokens', sa.Integer(), server_default='0', nullable=False
        ),
        sa.Column(
            'output_tokens', sa.Integer(), server_default='0', nullable=False
        ),
        sa.Column(
            'created_at',
            sa.DateTime(),
            server_default=sa.text('now()'),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(
        op.f('ix_chat_messages_user_id'), 'chat_messages', ['user_id']
    )
    op.create_index(
        op.f('ix_chat_messages_created_at'), 'chat_messages', ['created_at']
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_chat_messages_created_at'), 'chat_messages')
    op.drop_index(op.f('ix_chat_messages_user_id'), 'chat_messages')
    op.drop_table('chat_messages')
