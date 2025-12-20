const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 3000;
const directory = path.join(__dirname, 'files');
const imagePath = path.join(directory, 'image.jpg');
const htmlPath = path.join(__dirname, 'index.html');

// Asegurar que la carpeta de almacenamiento existe
if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
}

/**
 * Función para descargar la imagen manejando redirecciones (Picsum 302)
 */
const fetchImage = () => {
    return new Promise((resolve) => {
        // Verificar si ya tenemos una imagen válida en caché (menos de 10 minutos)
        if (fs.existsSync(imagePath)) {
            const stats = fs.statSync(imagePath);
            const diffInMinutes = (new Date() - new Date(stats.mtime)) / 60000;
            if (diffInMinutes < 10 && stats.size > 0) {
                console.log('Usando imagen válida de la caché persistente...');
                return resolve();
            }
        }

        const download = (url) => {
            https.get(url, (response) => {
                // Manejar Redirecciones (301, 302)
                if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                    console.log(`Siguiendo redirección a: ${response.headers.location}`);
                    return download(response.headers.location);
                }

                if (response.statusCode !== 200) {
                    console.error(`Error de servidor: ${response.statusCode}`);
                    return resolve();
                }

                const file = fs.createWriteStream(imagePath);
                response.pipe(file);
                file.on('finish', () => {
                    file.close(() => {
                        console.log('Imagen guardada con éxito tras descarga.');
                        resolve();
                    });
                });
            }).on('error', (err) => {
                console.error('Error de red (DNS/Conexión):', err.message);
                resolve();
            });
        };

        console.log('Iniciando descarga desde Picsum...');
        download('https://picsum.photos/1200');
    });
};

const server = http.createServer(async (req, res) => {
    console.log(`Petición recibida: ${req.url}`);

    if (req.url === '/favicon.ico') return res.end();

    // RUTA DE LA IMAGEN: Soporta acceso directo y a través de Ingress /app
    if (req.url === '/image.jpg' || req.url === '/app/image.jpg') {
        if (fs.existsSync(imagePath)) {
            const stats = fs.statSync(imagePath);
            if (stats.size > 0) {
                res.writeHead(200, { 'Content-Type': 'image/jpeg' });
                return fs.createReadStream(imagePath).pipe(res);
            }
        }
        res.writeHead(404);
        return res.end('Imagen no encontrada o en proceso de descarga.');
    }

    // RUTA PRINCIPAL: Servir el HTML
    // Ejecutamos fetchImage pero no bloqueamos el HTML si tarda
    fetchImage(); 

    if (fs.existsSync(htmlPath)) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        fs.createReadStream(htmlPath).pipe(res);
    } else {
        res.writeHead(500);
        res.end('Error interno: index.html no encontrado en el contenedor.');
    }
});

server.listen(port, () => {
    console.log(`Todo-App Project v14 activa en puerto ${port}`);
    // Intento de descarga inicial al arrancar el contenedor
    fetchImage();
});