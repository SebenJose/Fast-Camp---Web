from http import HTTPStatus
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from organiza_ia_api import billing_service
from organiza_ia_api.database import get_session
from organiza_ia_api.models import TokenTransaction, User
from organiza_ia_api.schemas import (
    BillingResponse,
    RechargeRequest,
    TokenTransactionPublic,
    utc_isoformat,
)
from organiza_ia_api.security import get_current_user

router = APIRouter(prefix='/api/billing', tags=['billing'])

RECHARGE_PACKAGES = (1_000, 5_000, 10_000)

INVALID_RECHARGE_MESSAGE = (
    'Valor de recarga inválido. Pacotes disponíveis: '
    + ', '.join(str(amount) for amount in RECHARGE_PACKAGES)
    + ' tokens.'
)


def _to_public(transaction: TokenTransaction) -> TokenTransactionPublic:
    return TokenTransactionPublic(
        id=str(transaction.id),
        type=transaction.type,
        amount=transaction.amount,
        balanceAfter=transaction.balance_after,
        createdAt=utc_isoformat(transaction.created_at),
    )


def _build_billing_response(
    session: Session, user_id: UUID, balance: int, limit: int, offset: int = 0
) -> BillingResponse:
    transactions = session.scalars(
        select(TokenTransaction)
        .where(TokenTransaction.user_id == user_id)
        .order_by(TokenTransaction.created_at.desc())
        .limit(limit)
        .offset(offset)
    ).all()

    return BillingResponse(
        balance=balance,
        packages=list(RECHARGE_PACKAGES),
        transactions=[_to_public(transaction) for transaction in transactions],
    )


@router.get('', status_code=HTTPStatus.OK, response_model=BillingResponse)
def get_billing(
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> BillingResponse:
    return _build_billing_response(
        session, current_user.id, current_user.token_balance, limit, offset
    )


@router.post(
    '/recharge', status_code=HTTPStatus.CREATED, response_model=BillingResponse
)
def recharge(
    data: RechargeRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> BillingResponse:
    if data.amount not in RECHARGE_PACKAGES:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail=INVALID_RECHARGE_MESSAGE,
        )

    user_id = current_user.id
    balance = billing_service.credit_tokens(session, user_id, data.amount)
    session.commit()

    return _build_billing_response(session, user_id, balance, limit=50)
