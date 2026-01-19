const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.FRONTEND_PORT || 3000;
// Tu ConfigMap dice: "http://todo-backend-svc:80/api/todos"
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
    res.status(200).send('ok');
});

app.get('/', (req, res) => {
    res.status(200).send('OK - Health Check Passed');
});

app.get('/app', async (req, res) => {
    try {
        await fetchImage();
        // BACKEND_URL ya es ".../api/todos", así que esto hace GET a esa ruta
        const response = await axios.get(BACKEND_URL); 
        const todos = response.data;

        const activeTodos = todos.filter(t => !t.done);
        const doneTodos = todos.filter(t => t.done);

        let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

        // Generar lista PENDIENTES
        const activeHtml = activeTodos.map(todo => {
            // Usamos 'task' porque así viene de la DB Postgres
            const text = todo.task || todo.todo || todo.text; 
            return `
            <li>
                ${text} 
                <form action="/app/update/${todo.id}" method="POST" style="display:inline; margin-left:10px;">
                    <button type="submit">Mark as done</button>
                </form>
            </li>`;
        }).join('');

        // Generar lista COMPLETADAS
        const doneHtml = doneTodos.map(todo => {
            const text = todo.task || todo.todo || todo.text;
            return `<li><del>${text}</del></li>`;
        }).join('');
        
        html = html.replace('id="todo-list">', `id="todo-list">${activeHtml}`);
        html = html.replace('id="done-list">', `id="done-list">${doneHtml}`);

        res.send(html);

    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).send('Error interno del servidor (Revisa logs del backend)');
    }
});

// Crear nueva tarea
app.post('/app/new', async (req, res) => {
    try {
        // Envía POST a ".../api/todos"
        await axios.post(BACKEND_URL, { todo: req.body.todo });
        res.redirect('/app');
    } catch (error) {
        console.error("Error creando todo:", error.message);
        res.status(500).send('Error al guardar todo');
    }
});

// Actualizar tarea (Mark as done)
app.post('/app/update/:id', async (req, res) => {
    const id = req.params.id;
    try {
        // Concatenamos ID: ".../api/todos" + "/" + "1" = ".../api/todos/1"
        // Coincide perfecto con la ruta PUT del backend
        await axios.put(`${BACKEND_URL}/${id}`, { done: true });
        res.redirect('/app');
    } catch (error) {
        console.error("Error updating todo:", error.message);
        res.status(500).send('Error marking todo as done');
    }
});

app.get('/app/image', (req, res) => {
    if (fs.existsSync(IMAGE_PATH)) {
        res.sendFile(IMAGE_PATH);
    } else {
        res.status(404).send('Wait for image...');
    }
});

const dir = path.join(__dirname, 'files');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

app.listen(PORT, () => console.log(`Frontend started on port ${PORT}`));