import asyncio
import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.user_repo import UserRepository
from app.repositories.message_repo import MessageRepository
from app.utils.security import hash_password


from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker


@pytest.mark.asyncio
async def test_concurrent_read_purges(test_engine):
    session_factory = async_sessionmaker(bind=test_engine, expire_on_commit=False)

    async with session_factory() as setup_session:
        user_repo = UserRepository(setup_session)
        msg_repo = MessageRepository(setup_session)

        # 1. Create sender and receiver
        alice = await user_repo.create("alice_conc", "alice_conc@example.com", hash_password("pass123"))
        bob = await user_repo.create("bob_conc", "bob_conc@example.com", hash_password("pass123"))

        # 2. Create message
        msg = await msg_repo.create_message(
            sender_id=alice.id,
            receiver_id=bob.id,
            content="Concurrent purge test"
        )
        msg_id = msg.id
        bob_id = bob.id

    async def purge_task():
        async with session_factory() as task_session:
            repo = MessageRepository(task_session)
            return await repo.mark_seen_and_delete_immediately(msg_id, bob_id)

    # 3. Simulate two concurrent read requests from Bob (e.g., multi-tab open)
    res1, res2 = await asyncio.gather(purge_task(), purge_task())

    # Exactly one request gets the message object; the second gets None gracefully without error
    results = [res1, res2]
    successful_purges = [r for r in results if r is not None]
    assert len(successful_purges) == 1, "Idempotency failed: message double purged!"
