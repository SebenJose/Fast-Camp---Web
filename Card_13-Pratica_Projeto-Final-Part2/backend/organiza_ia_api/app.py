import logging
from http import HTTPStatus
from typing import Any, Awaitable, Callable

from fastapi import FastAPI, Request, Response
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from organiza_ia_api.routers import auth, password_reset, schedule, users
from organiza_ia_api.schemas import Message
from organiza_ia_api.settings import get_settings

logger = logging.getLogger('organiza_ia_api')

# Nenhum payload legítimo da API chega perto disso; corpos maiores são
# rejeitados antes do parse do JSON.
MAX_REQUEST_BODY_BYTES = 64 * 1024

app = FastAPI(title='Organiza.IA API')

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_settings().cors_origins_list,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.middleware('http')
async def limit_request_body_size(
    request: Request, call_next: Callable[[Request], Awaitable[Response]]
) -> Response:
    content_length = request.headers.get('content-length')

    if (
        content_length
        and content_length.isdigit()
        and int(content_length) > MAX_REQUEST_BODY_BYTES
    ):
        return JSONResponse(
            status_code=HTTPStatus.REQUEST_ENTITY_TOO_LARGE,
            content={
                'message': 'O corpo da requisição excede o tamanho máximo '
                'permitido.'
            },
        )

    return await call_next(request)


# Erros de roteamento vêm do Starlette com detail em inglês; os handlers
# de negócio já levantam HTTPException com mensagens em português.
_ROUTING_ERROR_MESSAGES = {
    'Not Found': 'Rota não encontrada.',
    'Method Not Allowed': 'Método não permitido.',
}


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(
    request: Request, exc: StarletteHTTPException
) -> JSONResponse:
    # Registrado na exceção do Starlette (não na subclasse do FastAPI): os
    # erros de roteamento (404 de rota inexistente, 405 de método errado)
    # são levantados como StarletteHTTPException direto pelo Router e não
    # passariam por um handler registrado só na subclasse, vazando o
    # formato {"detail": ...} em vez do contrato {"message": ...}.
    return JSONResponse(
        status_code=exc.status_code,
        content={
            'message': _ROUTING_ERROR_MESSAGES.get(exc.detail, exc.detail)
        },
        headers=exc.headers,
    )


def _translate_validation_error(error: dict[str, Any]) -> str:
    # Erros dos validadores próprios já vêm em português (ValueError); os
    # gerados pelo Pydantic vêm em inglês e são traduzidos aqui.
    message: str = error['msg']

    if error['type'] == 'missing':
        return 'Preencha todos os campos obrigatórios.'

    if error['type'] == 'string_too_long':
        return 'Um dos campos enviados excede o tamanho máximo permitido.'

    if 'valid email address' in message:
        return 'Informe um e-mail válido.'

    if message.startswith('Value error, '):
        return message.removeprefix('Value error, ')

    return 'Dados inválidos.'


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    return JSONResponse(
        status_code=HTTPStatus.UNPROCESSABLE_ENTITY,
        content={'message': _translate_validation_error(exc.errors()[0])},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(
    request: Request, exc: Exception
) -> JSONResponse:
    # Sem isso, uma exceção não prevista (ex.: banco fora do ar) escapa
    # para o handler padrão do Starlette, que devolve texto puro em vez de
    # JSON e quebra o contrato {"message": ...} que todo o resto da API
    # segue. O erro real vai pro log; o cliente recebe uma mensagem genérica.
    logger.exception('Erro não tratado em %s', request.url.path)

    return JSONResponse(
        status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
        content={'message': 'Erro interno no servidor.'},
    )


app.include_router(auth.router)
app.include_router(password_reset.router)
app.include_router(users.router)
app.include_router(schedule.router)


@app.get('/', status_code=HTTPStatus.OK, response_model=Message)
def read_root() -> Message:
    return Message(message='Organiza.IA API no ar.')
