"""add token balance and token_transactions table

Revision ID: e5f6a7b8c9d0
Revises: d8a2b5c4e7f1
Create Date: 2026-07-09 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = 'e5f6a7b8c9d0'
down_revision: Union[str, Sequence[str], None] = 'd8a2b5c4e7f1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        'users',
        sa.Column(
            'token_balance',
            sa.Integer(),
            server_default='10000',
            nullable=False,
        ),
    )

    op.create_table(
        'token_transactions',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('user_id', sa.Uuid(), nullable=False),
        sa.Column('type', sa.String(), nullable=False),
        sa.Column('amount', sa.Integer(), nullable=False),
        sa.Column('balance_after', sa.Integer(), nullable=False),
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
        op.f('ix_token_transactions_user_id'),
        'token_transactions',
        ['user_id'],
    )
    op.create_index(
        op.f('ix_token_transactions_created_at'),
        'token_transactions',
        ['created_at'],
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(
        op.f('ix_token_transactions_created_at'), 'token_transactions'
    )
    op.drop_index(op.f('ix_token_transactions_user_id'), 'token_transactions')
    op.drop_table('token_transactions')
    op.drop_column('users', 'token_balance')
