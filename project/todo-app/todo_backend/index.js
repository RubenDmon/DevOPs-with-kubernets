const express = require('express');
const { Pool } = require('pg');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

const PORT = process.env.BACKEND_PORT || 3001;

// Configuración de la conexión
const pool = new Pool({
  host: process.env.DB_HOST,
  user: 'postgres',
  password: process.env.DB_PASSWORD,
  database: 'todo_db',
  port: 5432,
});

// Inicializar DB
const initDb = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY, 
        task TEXT, 
        done BOOLEAN DEFAULT false
    )
  `);
  try {
    await pool.query('ALTER TABLE todos ADD COLUMN IF NOT EXISTS done BOOLEAN DEFAULT false');
  } catch (error) {
    console.log("Migration note:", error.message);
  }
};
initDb();

// Ruta Healthz (usando pool, NO db)
app.get('/healthz', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).send('ok');
  } catch (error) {
    res.status(500).send('error');
  }
});

app.get('/', (req, res) => {
  res.status(200).send('OK');
});

// --- RUTAS UNIFICADAS A /todos ---

// 1. GET (Traer todas)
app.get('/todos', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, task, done FROM todos');
    res.send(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// 2. PUT (Actualizar estado)
app.put('/todos/:id', async (req, res) => {
  const id = req.params.id;
  try {
    await pool.query('UPDATE todos SET done = true WHERE id = $1', [id]);
    res.status(200).send({ id, done: true });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// 3. POST (Crear nueva) - IMPORTANTE: Antes tenías /api/todos aquí
app.post('/todos', async (req, res) => {
  const { todo } = req.body;
  if (todo && todo.length > 140) {
    return res.status(400).send('Todo is too long');
  }
  try {
    await pool.query('INSERT INTO todos (task) VALUES ($1)', [todo]);
    res.status(201).send({ task: todo });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

app.listen(PORT, () => console.log(`Backend listening on ${PORT}`));