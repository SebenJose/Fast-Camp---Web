"""create schedules and schedule_events tables

Revision ID: b4e1f2a3c5d6
Revises: 2ce92a5c89ae
Create Date: 2026-06-29 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = 'b4e1f2a3c5d6'
down_revision: Union[str, Sequence[str], None] = '2ce92a5c89ae'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'schedules',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('user_id', sa.Uuid(), nullable=False),
        sa.Column(
            'day_range_start_minutes',
            sa.Integer(),
            server_default='360',
            nullable=False,
        ),
        sa.Column(
            'day_range_end_minutes',
            sa.Integer(),
            server_default='1320',
            nullable=False,
        ),
        sa.Column(
            'created_at',
            sa.DateTime(),
            server_default=sa.text('now()'),
            nullable=False,
        ),
        sa.Column(
            'updated_at',
            sa.DateTime(),
            server_default=sa.text('now()'),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id'),
    )

    op.create_table(
        'schedule_events',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('schedule_id', sa.Uuid(), nullable=False),
        sa.Column('period_id', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('start_minutes', sa.Integer(), nullable=False),
        sa.Column('end_minutes', sa.Integer(), nullable=False),
        sa.Column('tone', sa.String(), nullable=True),
        sa.Column(
            'completed', sa.Boolean(), server_default='false', nullable=False
        ),
        sa.Column(
            'created_at',
            sa.DateTime(),
            server_default=sa.text('now()'),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(['schedule_id'], ['schedules.id']),
        sa.PrimaryKeyConstraint('id'),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('schedule_events')
    op.drop_table('schedules')
