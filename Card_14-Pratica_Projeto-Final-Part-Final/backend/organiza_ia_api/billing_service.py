from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.orm import Session

from organiza_ia_api.models import TokenTransaction, User


def debit_tokens(session: Session, user_id: UUID, amount: int) -> int:
    return _apply_transaction(
        session, user_id, type='debit', delta=-amount, floor_at_zero=True
    )


def credit_tokens(session: Session, user_id: UUID, amount: int) -> int:
    return _apply_transaction(
        session, user_id, type='recharge', delta=amount, floor_at_zero=False
    )


def _apply_transaction(
    session: Session,
    user_id: UUID,
    *,
    type: str,
    delta: int,
    floor_at_zero: bool,
) -> int:
    balance = session.scalar(
        select(User.token_balance).where(User.id == user_id).with_for_update()
    )

    if balance is None:
        raise ValueError(f'Usuário {user_id} não encontrado.')

    new_balance = balance + delta
    if floor_at_zero:
        new_balance = max(0, new_balance)

    session.execute(
        update(User)
        .where(User.id == user_id)
        .values(token_balance=new_balance)
    )
    session.add(
        TokenTransaction(
            user_id=user_id,
            type=type,
            amount=abs(delta),
            balance_after=new_balance,
        )
    )

    return new_balance
