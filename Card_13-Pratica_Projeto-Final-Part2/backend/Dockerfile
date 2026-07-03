# Usa uma imagem oficial do Python levinha
FROM python:3.12-slim

# Define a pasta de trabalho
WORKDIR /app

# Instala o Poetry
RUN pip install poetry

# Copia os arquivos de dependência e instala
COPY pyproject.toml poetry.lock* ./
RUN poetry config virtualenvs.create false \
  && poetry install --no-root

# Copia o resto do código
COPY . .

# Roda como usuário sem privilégios (UID 1000, o mesmo do usuário padrão do
# host): os arquivos criados dentro do volume montado (caches do pytest e
# do ruff, .coverage) deixam de ficar com dono root na máquina de quem
# desenvolve.
RUN useradd --uid 1000 --create-home appuser \
  && chown -R appuser:appuser /app
USER appuser

# Expõe a porta que o FastAPI usa
EXPOSE 8000

# Comando para rodar o servidor (executando migrações antes).
# O --reload é intencional: este compose é o ambiente de desenvolvimento
# (o código é montado como volume). Em produção, remova o --reload.
CMD ["sh", "-c", "alembic upgrade head && uvicorn organiza_ia_api.app:app --host 0.0.0.0 --port 8000 --reload"]
