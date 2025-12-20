const express = require('express');
const axios = require('axios'); // Asegúrate de añadirlo a tu package.json
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;
// URL del servicio backend usando el DNS interno de Kubernetes
const BACKEND_URL = 'http://todo-backend-svc:2346/todos';

// Lógica de la imagen (manteniendo lo que ya tenías)
const imagePath = path.join(__dirname, 'files', 'today.jpg');

const fetchImage = async () => {
    // Tu lógica actual para descargar la imagen si no existe o es vieja
};

app.get('/', async (req, res) => {
    await fetchImage();

    try {
        // 1. Obtener la lista de todos desde el BACKEND
        const response = await axios.get(BACKEND_URL);
        const todos = response.data;

        // 2. Renderizar el HTML con los datos recibidos
        let todoListHtml = todos.map(todo => `<li>${todo}</li>`).join('');

        res.send(`
            <h1>Todo App</h1>
            <img src="/image" style="width:300px;"><br><br>
            <form action="/new" method="POST">
                <input type="text" name="todo" maxlength="140">
                <button type="submit">Create TODO</button>
            </form>
            <ul>${todoListHtml}</ul>
        `);
    } catch (error) {
        console.error('Error fetching todos from backend:', error.message);
        res.status(500).send('Backend is not reachable');
    }
});

// Endpoint para crear un nuevo TODO
app.post('/new', async (req, res) => {
    const newTodo = req.body.todo;
    try {
        // Enviamos el nuevo todo al BACKEND vía POST
        await axios.post(BACKEND_URL, { todo: newTodo });
        res.redirect('/');
    } catch (error) {
        console.error('Error posting to backend:', error.message);
        res.status(500).send('Could not save todo');
    }
});

app.get('/image', (req, res) => {
    res.sendFile(imagePath);
});

app.listen(PORT, () => {
    console.log(`Frontend started on port ${PORT}`);
});