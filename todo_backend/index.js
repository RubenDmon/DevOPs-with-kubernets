const express = require('express');
const app = express();
app.use(express.json());
const PORT = process.env.BACKEND_PORT || 3001;

let todos = ['Learn JavaScript', 'Learn React','Build a project'];

// Endpoint para obtener la lista
app.get('/todos', (req, res) => {
    res.json(todos);
});

// Endpoint para crear nuevos
app.post('/todos', (req, res) => {
    const newTodo = req.body.todo;
    if (newTodo) todos.push(newTodo);
    res.status(201).send();
});

app.listen(PORT, () => console.log(`Backend listening on ${PORT}`));