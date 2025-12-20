const express = require('express');
const app = express();
app.use(express.json());

let todos = ['Completar el ejercicio 2.1', 'Configurar el backend'];

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

app.listen(3001, () => console.log('Backend listening on 3001'));