const express = require('express');
const cors = require('cors');
const path = require('path');
const gestor = require('./logic/GestorParqueadero');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.get('/api/vehiculos-adentro', async (req, res) => {
    try {
        const vehiculos = await gestor.mostrarVehiculosAdentro();
        res.json(vehiculos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/estadisticas', async (req, res) => {
    try {
        const stats = await gestor.obtenerEstadisticas();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/celdas-disponibles', async (req, res) => {
    try {
        const celdas = await gestor.obtenerCeldasDisponibles();
        res.json(celdas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/vehiculo/:placa', async (req, res) => {
    try {
        const vehiculo = await gestor.validarVehiculo(req.params.placa);
        if (vehiculo) {
            res.json({ placa: vehiculo.placa, mensualidadActiva: vehiculo.verificarMensualidad() });
        } else {
            res.status(404).json({ message: 'Vehículo no encontrado en la base de datos' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/ingreso', async (req, res) => {
    const { placa, idCelda } = req.body;
    if (!placa || !idCelda) return res.status(400).json({ error: 'Faltan datos (placa o idCelda)' });

    try {
        const result = await gestor.registrarIngreso(placa, idCelda);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/salida', async (req, res) => {
    const { placa } = req.body;
    if (!placa) return res.status(400).json({ error: 'Falta la placa del vehículo' });

    try {
        const result = await gestor.registrarSalida(placa);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// For any other route, send index.html (SPA feel)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
