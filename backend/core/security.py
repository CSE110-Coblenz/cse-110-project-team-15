from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import uuid4

import jwt
from passlib.context import CryptContext

from core.config import settings

_pwd_context = CryptContext(
    schemes=["pbkdf2_sha256"],
    deprecated="auto",
)


def hash_password(password: str) -> str:
    """Generate a salted hash for the given password."""
    return _pwd_context.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    """Verify a password against the stored salted hash."""
    return _pwd_context.verify(password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> Optional[dict]:
    """Verify and decode a JWT token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None


def generate_session_id() -> str:
    """Generate a unique session ID."""
    return str(uuid4())
