require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());


// Import and use routes
const clientesRoutes = require('./routes/clientes');
const cuentasRoutes = require('./routes/cuentas');
const movimientosRoutes = require('./routes/movimientos');
const chatRoutes = require('./routes/chat');

app.use('/api/clientes', clientesRoutes);
app.use('/api/cuentas', cuentasRoutes);
app.use('/api/movimientos', movimientosRoutes);
app.use('/api/chat', chatRoutes);
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
