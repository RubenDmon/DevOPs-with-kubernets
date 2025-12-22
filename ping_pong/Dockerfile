FROM node:alpine

WORKDIR /usr/src/app

# Copiamos solo los archivos de configuración primero
COPY package*.json ./

# Instalamos las dependencias DENTRO de la imagen (aquí se crea el node_modules de Linux)
RUN npm install

# Ahora copiamos el resto del código (el .dockerignore evitará que se sobrescriba el node_modules)
COPY . .

CMD ["npm", "start"]