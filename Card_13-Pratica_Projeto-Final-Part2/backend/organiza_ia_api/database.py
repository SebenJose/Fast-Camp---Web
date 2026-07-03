from collections.abc import Iterator
from functools import lru_cache

from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import Session

from organiza_ia_api.settings import get_settings


@lru_cache
def get_engine() -> Engine:  # pragma: no cover
    # Lazy (primeiro uso, não no import): importar a aplicação não exige
    # banco alcançável, então os testes rodam sem Postgres.
    return create_engine(
        get_settings().DATABASE_URL,
        # Testa a conexão com um SELECT 1 antes de entregá-la ao request:
        # sem isso, uma conexão que morreu no meio-tempo (restart do
        # Postgres, timeout de rede) só falha na hora do uso e derruba a
        # requisição com um erro 500 evitável.
        pool_pre_ping=True,
        # Recicla conexões com mais de 30 min: evita depender de nenhum
        # idle timeout do lado do banco (comum em serviços gerenciados).
        pool_recycle=1800,
    )


def get_session() -> Iterator[Session]:  # pragma: no cover
    with Session(get_engine()) as session:
        yield session
