// Generar un string aleatorio único al iniciar
const randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

const logStatus = () => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp}: ${randomString}`);
};

// Ejecutar cada 5000 milisegundos (5 segundos)
setInterval(logStatus, 5000);

// Ejecutar una vez al inicio para no esperar 5 segundos
logStatus();