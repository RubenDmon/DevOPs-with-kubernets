const http = require('http');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'files', 'logs.txt');

http.createServer((req, res) => {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(content);
  } else {
    res.end('No logs yet...');
  }
}).listen(3000);