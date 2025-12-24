const http = require('http');
const { Client } = require('pg');

const PORT = process.env.PORT || 3000;

const dbConfig = {
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:example@postgres-svc:5432/postgres',
  connectionTimeoutMillis: 5000,
};

let dbClient = null;

const startDb = async () => {
  let retries = 10;
  while (retries > 0) {
    const client = new Client(dbConfig);
    try {
      console.log(`Intentando conectar a la DB... (${retries} intentos restantes)`);
      await client.connect();
      console.log('¡Conectado a PostgreSQL con éxito!');
      await client.query('CREATE TABLE IF NOT EXISTS pongs (id SERIAL PRIMARY KEY, counter INTEGER);');
      const res = await client.query('SELECT * FROM pongs');
      if (res.rowCount === 0) {
        await client.query('INSERT INTO pongs (counter) VALUES (0)');
      }
      dbClient = client;
      return; 
    } catch (err) {
      console.error('Error conectando a la DB:', err.message);
      retries -= 1;
      try { await client.end(); } catch (e) { }
      if (retries === 0) process.exit(1);
      await new Promise(res => setTimeout(res, 5000));
    }
  }
};

const server = http.createServer(async (req, res) => {
  if (req.url === '/favicon.ico') {
    res.writeHead(204);
    return res.end();
  }

  // Ahora respondemos a "/" porque el Gateway hará el Rewrite.
  // Esto también sirve como Health Check para GKE.
  if (!dbClient) {
    res.writeHead(503, { 'Content-Type': 'text/plain' });
    return res.end("Error: La base de datos no esta lista todavia.");
  }

  try {
    const dbRes = await dbClient.query('UPDATE pongs SET counter = counter + 1 RETURNING counter');
    const count = dbRes.rows[0].counter;
    console.log(`Ping recibido en raíz. Nuevo valor: ${count}`);
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(`pong ${count}`);
  } catch (err) {
    console.error("Error SQL:", err.message);
    res.writeHead(500);
    res.end("Error interno");
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Ping-pong (REWRITE READY) escuchando en puerto ${PORT}`);
});

startDb();