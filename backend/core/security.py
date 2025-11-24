from passlib.context import CryptContext

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

def get_session_id():
    return ""