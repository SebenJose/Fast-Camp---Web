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

# Expõe a porta que o FastAPI usa
EXPOSE 8000

# Comando para rodar o servidor (executando migrações antes)
CMD ["sh", "-c", "alembic upgrade head && uvicorn fast_zero.app:app --host 0.0.0.0 --port 8000 --reload"]