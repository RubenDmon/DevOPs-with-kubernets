const express = require('express');
const { Pool } = require('pg'); // Importamos el cliente de Postgres
const app = express();
app.use(express.json());

const PORT = process.env.BACKEND_PORT || 3001;

// --- 2. RUTA DE SALUD (Para que Google esté feliz) ---
app.get('/', (req, res) => {
    res.status(200).send('OK - Health Check Passed');
});

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
app.get('/healthz', async (req, res) => {
  try {
    // Intenta una consulta simple y rápida
    await db.query('SELECT 1') 
    res.status(200).send('ok')
  } catch (error) {
    console.error('Health check failed:', error)
    res.status(500).send('error')
  }
})
app.get('/api/todos', async (req, res) => {
  try {
    const result = await pool.query('SELECT task FROM todos');
    res.json(result.rows.map(row => row.task));
  } catch (err) {
    res.status(500).send(err.message);
  }
});
app.post('/api/todos', async (req, res) => {
  const { todo } = req.body;

  // 1. VALIDACIÓN: Máximo 140 caracteres
  if (todo && todo.length > 140) {
    console.error(`Rejected: Todo is too long (${todo.length} chars). Content: ${todo.substring(0, 20)}...`);
    return res.status(400).send('Todo is too long (max 140 characters)');
  }

  try {
    if (todo) {
      // 2. LOGGING: Registrar el todo recibido
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