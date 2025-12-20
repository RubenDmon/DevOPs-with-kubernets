FROM node:alpine
WORKDIR /usr/src/app
# Copiamos archivos de dependencias
COPY . .
# Instalamos axios y express dentro de la imagen
RUN npm install
# Copiamos el resto del código (incluyendo index.js)
COPY . .
EXPOSE 3000
CMD ["node", "index.js"]