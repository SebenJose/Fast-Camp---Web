from sqlalchemy import select

from fast_zero.models import User


def test_create_user(session):
    new_user = User(
        username='test_user', password='test_pass', email='test@example.com'
    )

    session.add(new_user)
    session.commit()

    user = session.scalar(select(User).where(User.username == 'test_user'))

    assert user.username == 'test_user'
