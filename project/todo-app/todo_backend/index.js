const express = require('express');
const { Pool } = require('pg');
const app = express();
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

// Init DB
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
    console.log("Nota sobre DB:", error.message); 
  }
};
initDb();

app.get('/', (req, res) => {
    res.status(200).send('OK - Health Check Passed');
});

// CORRECCIÓN 1: Usar 'pool' en vez de 'db'
app.get('/healthz', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).send('ok');
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).send('error');
  }
});

// CORRECCIÓN 2: Rutas unificadas a /todos (coherencia con frontend)
app.get('/todos', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, task, done FROM todos');
    res.send(rows); 
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// CORRECCIÓN 3: Implementar la Query REAL
app.put('/todos/:id', async (req, res) => {
  const id = req.params.id;
  try {
    // ESTA LÍNEA ES LA QUE FALTABA PARA QUE FUNCIONE:
    await pool.query('UPDATE todos SET done = true WHERE id = $1', [id]);
    
    console.log(`Todo ${id} marcado como hecho`);
    res.status(200).send({ id, done: true });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

app.post('/todos', async (req, res) => {
  const { todo } = req.body;
  if (todo && todo.length > 140) {
    return res.status(400).send('Todo is too long (max 140 characters)');
  }
  try {
    if (todo) {
      console.log(`New todo received: "${todo}"`);
      await pool.query('INSERT INTO todos (task) VALUES ($1)', [todo]);
      res.status(201).send();
    } else {
      res.status(400).send('Todo content is missing');
    }
  } catch (err) {
    console.error('Database error:', err.message);
    res.status(500).send(err.message);
  }
});

app.listen(PORT, () => console.log(`Backend listening on ${PORT}`));