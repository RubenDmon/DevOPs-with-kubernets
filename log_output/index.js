const http = require('http');

// Tu lógica original de generación
const randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

const logStatus = () => {
  const timestamp = new Date().toISOString();
  const status = `${timestamp}: ${randomString}`;
  console.log(status);
  return status; // Retornamos el string para usarlo en el servidor
};

// Mantener tu intervalo original (opcional, el ejercicio no lo pide pero ayuda a debuggear)
setInterval(logStatus, 5000);

// NUEVO: Servidor para responder a las peticiones del Ingress
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  console.log(`Request received at ${new Date().toISOString()}`);
  
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  // Respondemos con lo mismo que imprimes en los logs
  res.end(logStatus()); 
});

server.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`);
});