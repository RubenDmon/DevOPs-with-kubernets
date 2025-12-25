FROM node:alpine
WORKDIR /usr/src/app

# 1. Copiamos SOLO los archivos de definición de paquetes primero
COPY package*.json ./

# 2. Instalamos dependencias (Docker guardará esto en caché si package.json no cambia)
RUN npm install

# 3. Ahora sí copiamos el resto del código (index.js, index.html, etc.)
COPY . .

EXPOSE 3000
CMD ["node", "index.js"]