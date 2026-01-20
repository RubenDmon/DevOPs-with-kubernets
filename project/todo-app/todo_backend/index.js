const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();
const { connect, StringCodec } = require('nats');
let nc;
const sc = StringCodec();

const connectNats = async () => {
    try {
        // La URL viene de variable de entorno o usa localhost por defecto
        nc = await connect({ servers: process.env.NATS_URL || "nats://localhost:4222" });
        console.log("Connected to NATS");
    } catch (err) {
        console.error("Error connecting to NATS:", err);
    }
};
connectNats(); // Iniciar conexión al arrancar
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

// Inicializar DB (Crear tabla y columna done)
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

// Ruta Healthz (IMPORTANTE: Usa 'pool', no 'db')
app.get('/healthz', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).send('ok');
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).send('error');
  }
});

app.get('/', (req, res) => {
  res.status(200).send('OK');
});

// --- RUTAS API (Deben coincidir con tu ConfigMap) ---

// 1. GET /api/todos
app.get('/api/todos', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, task, done FROM todos');
    res.send(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// 2. PUT /api/todos/:id (Para el botón Mark as Done)
/*app.put('/api/todos/:id', async (req, res) => {
  const id = req.params.id;
  try {
    await pool.query('UPDATE todos SET done = true WHERE id = $1', [id]);
    res.status(200).send({ id, done: true });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});*/

// 3. POST /api/todos (Crear tarea)
/*app.post('/api/todos', async (req, res) => {
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
});*/
// MODIFICA TU POST (Crear Tarea)
app.post('/api/todos', async (req, res) => {
  const { todo } = req.body;
  if (todo && todo.length > 140) {
    return res.status(400).send('Todo is too long');
  }
    try {
        await pool.query('INSERT INTO todos (task) VALUES ($1)', [todo]);

        // --- NUEVO: Publicar a NATS ---
        if (nc) {
            const message = JSON.stringify({
                user: "bot",
                message: `New todo created: ${todo}`
            });
            nc.publish("todo_updates", sc.encode(message));
        }
        // -----------------------------

        res.status(201).send({ task: todo });
    } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// MODIFICA TU PUT (Mark as Done)
app.put('/api/todos/:id', async (req, res) => { 
    const id = req.params.id;
    try {
        await pool.query('UPDATE todos SET done = true WHERE id = $1', [id]);

        // --- Lógica NATS (Esto está perfecto) ---
        if (nc) {
             const message = JSON.stringify({
                user: "bot",
                message: `Todo ${id} marked as done!`
            });
            nc.publish("todo_updates", sc.encode(message));
        }
        // ----------------------------------------

        res.status(200).send({ id, done: true });
    }  catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
});
app.listen(PORT, () => console.log(`Backend listening on ${PORT}`));