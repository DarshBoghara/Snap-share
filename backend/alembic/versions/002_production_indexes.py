"""Production composite indexes

Revision ID: 002_production_indexes
Revises: 001_initial_migration
Create Date: 2026-08-18 14:38:00.000000

"""
from typing import Sequence, Union
from alembic import op

revision: str = '002_production_indexes'
down_revision: Union[str, None] = '001_initial_migration'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_index('ix_messages_conversation', 'messages', ['sender_id', 'receiver_id', 'created_at'])
    op.create_index('ix_messages_unread', 'messages', ['receiver_id', 'status'])
    op.create_index('ix_messages_sender_status', 'messages', ['sender_id', 'status'])
    op.create_index('ix_users_online_lastseen', 'users', ['is_online', 'last_seen'])


def downgrade() -> None:
    op.drop_index('ix_users_online_lastseen', table_name='users')
    op.drop_index('ix_messages_sender_status', table_name='messages')
    op.drop_index('ix_messages_unread', table_name='messages')
    op.drop_index('ix_messages_conversation', table_name='messages')
