# Usa uma versão oficial e otimizada (leve) do Node.js
FROM node:20-alpine

# Define a pasta de trabalho dentro do contêiner
WORKDIR /usr/src/app

# Copia os arquivos de configuração do npm primeiro (package.json e package-lock.json)
# Isso otimiza o cache do Docker durante os builds
COPY package*.json ./

# Instala as dependências (Express, AWS SDK, Cors, Dotenv)
RUN npm install

# Copia todo o restante do código do backend para o contêiner
COPY . .

# Sinaliza qual porta o contêiner vai usar
EXPOSE 3000

# Comando para iniciar a API
CMD ["node", "server.js"]
