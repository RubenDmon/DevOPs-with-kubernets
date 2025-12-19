const http = require('http');
const PORT = process.env.PORT || 3000;
let counter = 0;

const server = http.createServer((req, res) => {
  if (req.url === '/pingpong') {
    console.log(`Request number ${counter} received`);
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(`pong ${counter}`);
    counter++;
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, () => {
  console.log(`Ping-pong app started on port ${PORT}`);
});