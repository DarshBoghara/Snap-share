import pytest
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.user_repo import UserRepository
from app.repositories.message_repo import MessageRepository
from app.utils.security import hash_password

@pytest.mark.asyncio
async def test_disappearing_message_instant_purge(db_session: AsyncSession):
    user_repo = UserRepository(db_session)
    msg_repo = MessageRepository(db_session)

    # 1. Create two test users
    alice = await user_repo.create("alice", "alice@example.com", hash_password("pass123"))
    bob = await user_repo.create("bob", "bob@example.com", hash_password("pass123"))

    # 2. Alice sends message to Bob
    msg = await msg_repo.create_message(
        sender_id=alice.id,
        receiver_id=bob.id,
        content="This message will self destruct"
    )
    assert msg.id is not None
    assert msg.message == "This message will self destruct"

    # Verify message exists in DB
    existing = await msg_repo.get_by_id(msg.id)
    assert existing is not None

    # 3a. Unauthorized user (Alice) attempts to purge message sent TO Bob -> Returns None (prevented)
    unauthorized_attempt = await msg_repo.mark_seen_and_delete_immediately(msg.id, alice.id)
    assert unauthorized_attempt is None, "Security flaw: Non-receiver was able to delete message!"

    # 3b. Authorized receiver (Bob) reads message (triggers disappearing engine)
    purged_msg = await msg_repo.mark_seen_and_delete_immediately(msg.id, bob.id)
    assert purged_msg is not None

    # 4. Assert message NO LONGER exists in DB
    after_purge = await msg_repo.get_by_id(msg.id)
    assert after_purge is None, "Disappearing message failed: Row still exists in database!"
