import pytest
import uuid
from app.utils.security import create_access_token, create_refresh_token, decode_token


def test_jwt_token_type_validation():
    user_id = uuid.uuid4()
    access_token = create_access_token(user_id)
    refresh_token = create_refresh_token(user_id)

    decoded_access = decode_token(access_token)
    decoded_refresh = decode_token(refresh_token)

    assert decoded_access.get("type") == "access"
    assert decoded_access.get("sub") == str(user_id)
    assert decoded_refresh.get("type") == "refresh"
    assert decoded_refresh.get("sub") == str(user_id)
