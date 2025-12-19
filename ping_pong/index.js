const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// La ruta DEBE ser absoluta para evitar problemas en el contenedor
const filePath = '/usr/src/app/files/pong.txt';
const directory = '/usr/src/app/files';

// Asegurar que la carpeta existe antes de leer
if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
}

// 1. Intentar recuperar el contador
let counter = 0;
try {
    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        counter = parseInt(data) || 0;
        console.log(`Contador recuperado: ${counter}`);
    }
} catch (err) {
    console.error('Error al leer el archivo de persistencia:', err);
}

// 2. Rutas
app.get('/pingpong', (req, res) => {
    counter++;
    try {
        fs.writeFileSync(filePath, counter.toString());
    } catch (err) {
        console.error('Error al escribir el archivo:', err);
    }
    res.send(`pong ${counter}`);
});

app.get('/', (req, res) => {
    res.send('Ping-pong server is running');
});

app.listen(port, () => {
    console.log(`Ping-pong app listening at http://localhost:${port}`);
});