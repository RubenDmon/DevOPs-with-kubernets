server.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`);
});


const http = require('http');

// Leemos el puerto desde la variable de entorno o usamos 3000 por defecto
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Todo App is running\n');
});

server.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`);
});