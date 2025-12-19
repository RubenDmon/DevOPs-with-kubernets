const fs = require('fs');
const path = require('path');
const crypto = require('crypto'); // Esto es nativo de Node.js, no fallará

const directory = path.join(__dirname, 'files');
const filePath = path.join(directory, 'logs.txt');

// Asegurar que la carpeta existe
if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
}

// Generamos un string aleatorio sin usar librerías externas
const randomString = crypto.randomBytes(10).toString('hex');

const writeLog = () => {
  const log = `${new Date().toISOString()}: ${randomString}\n`;
  fs.appendFileSync(filePath, log);
  console.log('Wrote to file:', log);
};

setInterval(writeLog, 5000);