require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());


// Import and use routes
app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/cuentas', require('./routes/cuentas'));
app.use('/api/movimientos', require('./routes/movimientos'));
app.use('/api/catalogos', require('./routes/catalogos'));

// === FUSIÓN DE FRONTEND PARA ENTREGA ÚNICA ===
const path = require('path');
app.use(express.static(path.join(__dirname, 'frontend', 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor Backend corriendo en http://localhost:${PORT}`);
});
