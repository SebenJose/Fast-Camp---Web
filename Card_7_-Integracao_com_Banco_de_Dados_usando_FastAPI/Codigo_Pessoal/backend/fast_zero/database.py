from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from fast_zero.settings import get_settings

engine = create_engine(get_settings().DATABASE_URL)


def get_session():  # pragma: no cover
    with Session(engine) as session:
        yield session
