# Usa uma imagem oficial do Node.js levinha
FROM node:20-alpine

# Define a pasta de trabalho dentro do contêiner
WORKDIR /app

# Copia os arquivos de dependência e instala
COPY package*.json ./
RUN npm ci

# Copia o resto do código
COPY . .

# Expõe a porta que o Next.js usa
EXPOSE 3000

# Comando para rodar em modo de desenvolvimento
CMD ["npm", "run", "dev"]