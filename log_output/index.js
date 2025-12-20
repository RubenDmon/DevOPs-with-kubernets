const http = require('http');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
// Generamos un UUID único al arrancar el proceso (lo que antes hacía el writer)
const hash = crypto.randomUUID();

/**
 * Función para obtener el conteo de pongs desde el servicio de Ping Pong
 */
const getPongs = () => {
    return new Promise((resolve) => {
        // Usamos el nombre del SERVICE (ping-pong-svc) y el PORT (2345) definido en tu YAML
        http.get('http://ping-pong-svc:2345/pings', (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => resolve(data));
        }).on('error', (err) => {
            console.error("Error conectando a Ping Pong:", err.message);
            resolve("0"); // Valor por defecto si el servicio no responde
        });
    });
};

const server = http.createServer(async (req, res) => {
    // Ignorar favicon
    if (req.url === '/favicon.ico') return res.end();

    // Generar el timestamp actual
    const timestamp = new Date().toISOString();
    
    // Obtener los pongs a través de la red (Networking between pods)
    const pongs = await getPongs();

    // Formatear la respuesta según el requerimiento del ejercicio
    const responseString = `${timestamp}: ${hash}.\nPing / Pongs: ${pongs}`;
    
    console.log(responseString);

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(responseString);
});

server.listen(PORT, () => {
    console.log(`Log Output unificado escuchando en el puerto ${PORT}`);
});