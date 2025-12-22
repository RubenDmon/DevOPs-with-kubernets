const http = require('http');
const { Client } = require('pg');

const PORT = process.env.PORT || 3000;

// Configuración de la base de datos
const dbConfig = {
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:example@postgres-svc:5432/postgres',
  connectionTimeoutMillis: 5000, // No esperar más de 5 segundos para conectar
};

let dbClient = null;

/**
 * Inicializa la conexión a la base de datos con reintentos.
 * Se ejecuta en segundo plano para no bloquear el arranque del servidor.
 */
const startDb = async () => {
  let retries = 10;
  while (retries > 0) {
    // Creamos una instancia nueva en cada intento para evitar el error "Client has already been connected"
    const client = new Client(dbConfig);
    
    try {
      console.log(`Intentando conectar a la DB... (${retries} intentos restantes)`);
      await client.connect();
      
      console.log('¡Conectado a PostgreSQL con éxito!');
      
      // Aseguramos que la tabla y la fila inicial existan
      await client.query('CREATE TABLE IF NOT EXISTS pongs (id SERIAL PRIMARY KEY, counter INTEGER);');
      const res = await client.query('SELECT * FROM pongs');
      
      if (res.rowCount === 0) {
        await client.query('INSERT INTO pongs (counter) VALUES (0)');
        console.log('Fila inicial de pongs creada.');
      }
      
      // Una vez todo está listo, asignamos el cliente al objeto global
      dbClient = client;
      return; 
    } catch (err) {
      console.error('Error conectando a la DB:', err.message);
      retries -= 1;
      
      // Cerramos el cliente fallido antes de reintentar
      try { await client.end(); } catch (e) { /* ignore */ }
      
      if (retries === 0) {
        console.error('Se agotaron los reintentos. El pod se reiniciará.');
        process.exit(1);
      }
      
      // Esperar 5 segundos antes del próximo intento
      await new Promise(res => setTimeout(res, 5000));
    }
  }
};

/**
 * Servidor HTTP
 */
const server = http.createServer(async (req, res) => {
  // Ignorar favicon
  if (req.url === '/favicon.ico') {
    res.writeHead(204);
    return res.end();
  }

  // Endpoint de Ping-Pong
  if (req.url === '/pingpong') {
    // Si la DB aún no está lista, respondemos 503 (Servicio no disponible)
    // Esto evita que el Ingress se quede cargando infinito.
    if (!dbClient) {
      res.writeHead(503, { 'Content-Type': 'text/plain' });
      return res.end("Error: La base de datos no esta lista todavia.");
    }

    try {
      // Incrementar el contador y obtener el nuevo valor
      const dbRes = await dbClient.query('UPDATE pongs SET counter = counter + 1 RETURNING counter');
      const count = dbRes.rows[0].counter;
      
      console.log(`Ping recibido. Nuevo valor: ${count}`);
      
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(`pong ${count}`);
    } catch (err) {
      console.error("Error en la consulta SQL:", err.message);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end("Error interno al actualizar el contador.");
    }
    return;
  }

  // Cualquier otra ruta
  res.writeHead(404);
  res.end("Not Found");
});

// --- EL ORDEN DE ESTAS LÍNEAS ES CRUCIAL ---

// 1. Arrancamos el servidor HTTP de inmediato
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Aplicación Ping-pong escuchando en puerto ${PORT}`);
});

// 2. Iniciamos el proceso de conexión a la base de datos en paralelo
startDb();