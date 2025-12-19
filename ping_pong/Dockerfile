FROM node:alpine

WORKDIR /usr/src/app

# Copiamos los archivos de dependencias primero
COPY package*.json ./

# Instalamos las librerías
RUN npm install

# Copiamos el resto del código
COPY . .

CMD ["node", "index.js"]