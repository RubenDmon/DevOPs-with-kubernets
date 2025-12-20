const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

const filePath = '/usr/src/app/files/pong.txt';
const directory = '/usr/src/app/files';

if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
}

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

// AHORA: Cada vez que Log Output pida el dato, el contador sube
app.get('/pings', (req, res) => {
    counter++; // Incrementamos aquí
    try {
        fs.writeFileSync(filePath, counter.toString());
    } catch (err) {
        console.error('Error al guardar pongs:', err);
    }
    res.send(`${counter}`); // Enviamos el nuevo número
});

// Esta ruta puede quedarse para pruebas manuales o simplemente mostrar el estado
app.get('/pingpong', (req, res) => {
    res.send(`pong ${counter}`);
});

app.get('/', (req, res) => {
    res.send('Ping-pong server is running');
});

app.listen(port, () => {
    console.log(`Ping-pong app listening at http://localhost:${port}`);
});