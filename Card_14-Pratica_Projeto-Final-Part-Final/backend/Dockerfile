FROM python:3.12-slim

WORKDIR /app

RUN pip install poetry

COPY pyproject.toml poetry.lock* ./
RUN poetry config virtualenvs.create false \
  && poetry install --no-root

COPY . .

# Roda como usuário sem privilégios (UID 1000, o mesmo do usuário padrão do
# host): os arquivos criados dentro do volume montado (caches do pytest e
# do ruff, .coverage) deixam de ficar com dono root na máquina de quem
# desenvolve.
RUN useradd --uid 1000 --create-home appuser \
  && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# O --reload é intencional: este compose é o ambiente de desenvolvimento
# (o código é montado como volume). Em produção, remova o --reload.
CMD ["sh", "-c", "alembic upgrade head && uvicorn organiza_ia_api.app:app --host 0.0.0.0 --port 8000 --reload"]
