const http = require('http');
const crypto = require('crypto');
const fs = require('fs');

const PORT = process.env.PORT || 3000;
const hash = crypto.randomUUID();

const MESSAGE = process.env.MESSAGE || "hello world";

const getFileContent = () => {
    try {
        return fs.readFileSync('/usr/src/app/config/information.txt', 'utf8').trim();
    } catch (err) {
        return "this text is from file";
    }
};
const getPongs = () => {
    return new Promise((resolve) => {
        // Llamamos a /pingpong para que incremente el contador en cada carga
        http.get('http://ping-pong-svc:2345/', (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                // Limpiamos el texto "pong " para quedarnos solo con el número
                const count = data.replace('pong ', '').trim();
                resolve(count);
            });
        }).on('error', (err) => {
            console.error("Error conectando a ping-pong:", err.message);
            resolve("0");
        });
    });
};
const server = http.createServer(async (req, res) => {

    if (req.url === '/healthz') {
    try {
      // Intentamos conectar al servicio de Ping-pong
      const response = await new Promise((resolve, reject) => {
        http.get('http://ping-pong-svc:2345/', (res) => {
           if (res.statusCode === 200) resolve(true);
           else reject(new Error('Status ' + res.statusCode));
        }).on('error', (err) => reject(err));
      });
      
      res.writeHead(200);
      res.end("OK");
    } catch (err) {
      console.error("Health check failed:", err.message);
      res.writeHead(500);
      res.end("Not Ready");
    }
    return;
  }
    if (req.url === '/favicon.ico') return res.end();

    const timestamp = new Date().toISOString();
    const pongs = await getPongs();
    const fileContent = getFileContent();

    // SALIDA EXACTA REQUERIDA
    const responseString = `file content: ${fileContent}\nenv variable: MESSAGE=${MESSAGE}\n${timestamp}: ${hash}.\nPing / Pongs: ${pongs}`;
    
    
    console.log(responseString);

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(responseString);
});

server.listen(PORT, () => {
    console.log(`LOG-OUTPUT-FINAL en puerto ${PORT}`);
});