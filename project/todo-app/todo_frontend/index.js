const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.FRONTEND_PORT || 3000;
const BACKEND_URL = process.env.BACKEND_URL;
const IMAGE_PATH = process.env.IMAGE_PATH || path.join(__dirname, 'files', 'image.jpg');
// En tu index.js (Frontend)
app.get('/healthz', async (req, res) => {
    // El frontend está "listo" si puede contactar al backend (opcional) 
    // o simplemente si el servidor arrancó.
    try {
        // Opcional: Verificar que el backend responda
        // await axios.get(BACKEND_URL); 
        res.status(200).send('ok');
    } catch (e) {
        res.status(500).send('not ok');
    }
});
// --- 1. DEFINE LA FUNCIÓN QUE FALTABA ---
const fetchImage = async () => {
    if (fs.existsSync(IMAGE_PATH)) {
        const stats = fs.statSync(IMAGE_PATH);
        const hoursAgo = (new Date() - stats.mtime) / (1000 * 60 * 60);
        if (hoursAgo < 24) return; // Si tiene menos de 24h, no descargamos
    }
    const response = await axios.get('https://picsum.photos/1200', { responseType: 'stream' });
    response.data.pipe(fs.createWriteStream(IMAGE_PATH));
};

// --- 2. RUTA DE SALUD (Para que Google esté feliz) ---
app.get('/', (req, res) => {
    res.status(200).send('OK - Health Check Passed');
});

// --- 3. RUTA /APP ---
app.get('/app', async (req, res) => {
    try {
        await fetchImage(); // Ahora sí existe
        const response = await axios.get(BACKEND_URL);
        const todos = response.data;

        let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
        const todoListHtml = todos.map(todo => `<li>${todo}</li>`).join('');
        
        html = html.replace('id="todo-list">', `id="todo-list">${todoListHtml}`);
        // Asegúrate de que tu form action apunte a /app/new
        res.send(html);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).send('Error interno del servidor');
    }
});

app.post('/app/new', async (req, res) => {
    try {
        await axios.post(BACKEND_URL, { todo: req.body.todo });
        res.redirect('/app');
    } catch (error) {
        res.status(500).send('Error al guardar todo');
    }
});
const dir = path.join(__dirname, 'files');
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

// ... (resto de tu código fetchImage)

// RUTA PARA LA IMAGEN (Asegúrate de que sea esta)
app.get('/app/image', (req, res) => {
    if (fs.existsSync(IMAGE_PATH)) {
        res.sendFile(IMAGE_PATH);
    } else {
        res.status(404).send('La imagen aún no se ha descargado. Refresca en unos segundos.');
    }
});

app.listen(PORT, () => console.log(`Frontend started on port ${PORT}`));