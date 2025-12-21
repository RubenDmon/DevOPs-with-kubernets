const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const app = express();
// Importante para procesar el formulario del HTML
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.FRONTEND_PORT || 3000;
const BACKEND_URL = process.env.BACKEND_URL;
const IMAGE_PATH = process.env.IMAGE_PATH || path.join(__dirname, 'files', 'image.jpg');

const fetchImage = async () => {
  // Verificamos si la imagen ya existe para no descargarla cada vez
  if (fs.existsSync(IMAGE_PATH)) {
    console.log("La imagen ya existe en el volumen.");
    return;
  }

  console.log("Descargando imagen diaria...");
  try {
    const response = await axios({
      url: 'https://picsum.photos/1200', // URL de imagen aleatoria
      responseType: 'stream',
    });
    
    // Creamos la carpeta 'files' si por alguna razón no existe
    const dir = path.dirname(IMAGE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const writer = fs.createWriteStream(IMAGE_PATH);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log("Imagen guardada correctamente en:", IMAGE_PATH);
        resolve();
      });
      writer.on('error', reject);
    });
  } catch (error) {
    console.error("Error descargando la imagen:", error.message);
  }
};

app.get('/', async (req, res) => {
    await fetchImage();

    try {
        const response = await axios.get(BACKEND_URL);
        const todos = response.data;

        // Leemos el archivo HTML estético
        let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

        // Creamos la lista dinámica
        const todoListHtml = todos.map(todo => `<li>${todo}</li>`).join('');

        // Reemplazamos el contenido estático por el dinámico
        // 1. La lista de tareas
        html = html.replace(
            /<ul id="todo-list">[\s\S]*?<\/ul>/, 
            `<ul id="todo-list">${todoListHtml}</ul>`
        );
        
        // 2. Ajustamos el formulario para que use nuestra ruta /new
        html = html.replace(
            '<div>',
            '<form action="/app/new" method="POST" class="input-group">'
        ).replace(
            '</div>',
            '</form>'
        );
        
        // 3. Ajustamos el input para que funcione con el POST de Express
        html = html.replace('id="todo-input"', 'name="todo" id="todo-input"');

        res.send(html);
    } catch (error) {
        console.error('Error fetching todos:', error.message);
        res.status(500).send('Backend is not reachable');
    }
});

app.post('/new', async (req, res) => {
    const newTodo = req.body.todo;
    try {
        await axios.post(BACKEND_URL, { todo: newTodo });
        res.redirect('/app'); // Redirigimos a la ruta del Ingress
    } catch (error) {
        res.status(500).send('Could not save todo');
    }
});

// Cambiamos el endpoint a /image para que coincida con el HTML
app.get('/image', (req, res) => {
    if (fs.existsSync(IMAGE_PATH)) {
        res.sendFile(IMAGE_PATH);
    } else {
        res.status(404).send('Image not found yet');
    }
});

app.listen(PORT, () => {
    console.log(`Frontend started on port ${PORT}`);
});