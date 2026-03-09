const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../parqueadero.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error abriendo la base de datos:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite parqueadero.db.');
    }
});

module.exports = db;
