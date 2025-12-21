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
        http.get('http://ping-pong-svc:2345/pings', (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => resolve(data));
        }).on('error', () => resolve("0"));
    });
};

const server = http.createServer(async (req, res) => {
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