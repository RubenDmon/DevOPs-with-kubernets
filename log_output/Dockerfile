FROM node:alpine
WORKDIR /usr/src/app
# Copiamos solo los archivos de configuración primero
COPY package*.json ./
# Instalamos las dependencias limpias dentro del contenedor
RUN npm install 
# Luego el resto del código
COPY . .
EXPOSE 3000
CMD ["node", "index.js"]