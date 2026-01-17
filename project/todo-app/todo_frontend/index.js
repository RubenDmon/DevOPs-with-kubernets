const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.FRONTEND_PORT || 3000;
// IMPORTANTE: Asumo que esta variable es algo como "http://backend-svc:2345/todos"
const BACKEND_URL = process.env.BACKEND_URL; 
const IMAGE_PATH = process.env.IMAGE_PATH || path.join(__dirname, 'files', 'image.jpg');

const fetchImage = async () => {
    if (fs.existsSync(IMAGE_PATH)) {
        const stats = fs.statSync(IMAGE_PATH);
        const hoursAgo = (new Date() - stats.mtime) / (1000 * 60 * 60);
        if (hoursAgo < 24) return;
    }
    const response = await axios.get('https://picsum.photos/1200', { responseType: 'stream' });
    response.data.pipe(fs.createWriteStream(IMAGE_PATH));
};

app.get('/healthz', async (req, res) => {
    try {
        // await axios.get(BACKEND_URL); 
        res.status(200).send('ok');
    } catch (e) {
        res.status(500).send('not ok');
    }
});

app.get('/', (req, res) => {
    res.status(200).send('OK - Health Check Passed');
});

app.get('/app', async (req, res) => {
    try {
        await fetchImage();
        const response = await axios.get(BACKEND_URL); // GET /todos
        const todos = response.data;

        const activeTodos = todos.filter(t => !t.done);
        const doneTodos = todos.filter(t => t.done);

        let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

        const activeHtml = activeTodos.map(todo => {
            // CORRECCIÓN 1: Leer 'todo.task' (que es como viene de la DB)
            const text = todo.task || todo.todo || todo.text; 
            return `
            <li>
                ${text} 
                <form action="/app/update/${todo.id}" method="POST" style="display:inline; margin-left:10px;">
                    <button type="submit">Mark as done</button>
                </form>
            </li>`;
        }).join('');

        const doneHtml = doneTodos.map(todo => {
            const text = todo.task || todo.todo || todo.text;
            return `
            <li>
                <del>${text}</del>
            </li>`;
        }).join('');
        
        html = html.replace('id="todo-list">', `id="todo-list">${activeHtml}`);
        html = html.replace('id="done-list">', `id="done-list">${doneHtml}`);

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

// Ruta para servir la imagen
app.get('/app/image', (req, res) => {
    if (fs.existsSync(IMAGE_PATH)) {
        res.sendFile(IMAGE_PATH);
    } else {
        res.status(404).send('Wait for image...');
    }
});

// CORRECCIÓN 2: Ruta Update
app.post('/app/update/:id', async (req, res) => {
    const id = req.params.id;
    try {
        // ATENCIÓN: Si BACKEND_URL ya termina en '/todos', 
        // concatenar otro '/todos' daría error.
        // Opción Segura: Usar BACKEND_URL + '/' + id
        await axios.put(`${BACKEND_URL}/${id}`, { done: true });
        res.redirect('/app');
    } catch (error) {
        console.error("Error updating todo:", error.message);
        res.status(500).send('Error marking todo as done');
    }
});

const dir = path.join(__dirname, 'files');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

app.listen(PORT, () => console.log(`Frontend started on port ${PORT}`));