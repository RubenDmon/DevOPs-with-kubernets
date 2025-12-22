const express = require('express');
const { Pool } = require('pg'); // Importamos el cliente de Postgres
const app = express();
app.use(express.json());

const PORT = process.env.BACKEND_PORT || 3001;

// Configuración de la conexión usando variables de entorno
const pool = new Pool({
  host: process.env.DB_HOST,      // 'postgres-svc'
  user: 'postgres',
  password: process.env.DB_PASSWORD,
  database: 'todo_db',
  port: 5432,
});

// Crear la tabla si no existe al iniciar
const initDb = async () => {
  await pool.query('CREATE TABLE IF NOT EXISTS todos (id SERIAL PRIMARY KEY, task TEXT)');
};
initDb();

app.get('/todos', async (req, res) => {
  try {
    const result = await pool.query('SELECT task FROM todos');
    res.json(result.rows.map(row => row.task));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post('/todos', async (req, res) => {
  const { todo } = req.body;
  try {
    if (todo) {
      await pool.query('INSERT INTO todos (task) VALUES ($1)', [todo]);
    }
    res.status(201).send();
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(PORT, () => console.log(`Backend listening on ${PORT}`));