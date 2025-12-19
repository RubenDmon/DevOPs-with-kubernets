const http = require('http');
const fs = require('fs');
const path = require('path');

// Definimos las rutas a los archivos dentro del volumen compartido
const directory = path.join(__dirname, 'files');
const logPath = path.join(directory, 'logs.txt');
const pingPath = path.join(directory, 'pong.txt');

http.createServer((req, res) => {
    // Ignorar la petición de favicon que hacen los navegadores
    if (req.url === '/favicon.ico') {
        res.writeHead(404);
        res.end();
        return;
    }

    console.log('Request received for status');

    // 1. Leer el Log del timestamp + string aleatorio
    let logData = '';
    if (fs.existsSync(logPath)) {
        logData = fs.readFileSync(logPath, 'utf8').trim();
    } else {
        logData = 'No logs available yet';
    }

    // 2. Leer el contador de Pongs
    let pingData = '0';
    if (fs.existsSync(pingPath)) {
        pingData = fs.readFileSync(pingPath, 'utf8').trim();
    }

    // 3. Respuesta con salto de línea (\n)
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    
    // Usamos el template string con el formato exacto que pediste
    res.end(`${logData}\nPing / Pongs: ${pingData}`);

}).listen(3000, () => {
    console.log('Reader server started on port 3000');
});