const http = require('http');

const data = JSON.stringify({
  tipo_documento: "CC",
  numero_documento: "999888777",
  nombre: "Prueba",
  apellido: "Test",
  fecha_nacimiento: "1990-01-01",
  telefono: "3003003000",
  email: "pruebareg@test.com",
  direccion: "Calle Falsa"
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/clientes',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('Response:', res.statusCode, body));
});

req.on('error', (e) => console.error(e));
req.write(data);
req.end();
