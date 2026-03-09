const db = require('../data/database');
const Vehiculo = require('./Vehiculo');
const Celda = require('./Celda');
const Registro = require('./Registro');

class GestorParqueadero {
    mostrarVehiculosAdentro() {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    r.id_registro, r.fecha_hora_entrada, r.placa_vehiculo, 
                    c.numero_celda, v.mensualidad_activa
                FROM Registro r
                JOIN Celda c ON r.id_celda = c.id_celda
                JOIN Vehiculo v ON r.placa_vehiculo = v.placa
                WHERE r.fecha_hora_salida IS NULL
            `;
            db.all(query, [], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }

    obtenerEstadisticas() {
        return new Promise((resolve, reject) => {
            const stats = { vehículosAdentro: 0, celdasDisponibles: 0 };

            db.get(`SELECT COUNT(*) as count FROM Registro WHERE fecha_hora_salida IS NULL`, (err, row) => {
                if (err) return reject(err);
                stats.vehículosAdentro = row.count;

                db.get(`SELECT COUNT(*) as count FROM Celda WHERE estado = 'Disponible'`, (err, row) => {
                    if (err) return reject(err);
                    stats.celdasDisponibles = row.count;
                    resolve(stats);
                });
            });
        });
    }

    obtenerCeldasDisponibles() {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM Celda WHERE estado = 'Disponible'`, [], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }

    validarVehiculo(placa) {
        return new Promise((resolve, reject) => {
            db.get(`SELECT * FROM Vehiculo WHERE placa = ?`, [placa], (err, row) => {
                if (err) return reject(err);
                if (row) {
                    resolve(new Vehiculo(row.placa, row.mensualidad_activa));
                } else {
                    resolve(null);
                }
            });
        });
    }

    registrarIngreso(placa, idCelda) {
        return new Promise((resolve, reject) => {
            const fechaHoraEntrada = new Date().toISOString();

            db.serialize(() => {
                db.run('BEGIN TRANSACTION');

                db.run(`INSERT INTO Registro (fecha_hora_entrada, placa_vehiculo, id_celda) VALUES (?, ?, ?)`,
                    [fechaHoraEntrada, placa, idCelda], function (err) {
                        if (err) {
                            db.run('ROLLBACK');
                            return reject(err);
                        }

                        db.run(`UPDATE Celda SET estado = 'Ocupada' WHERE id_celda = ?`, [idCelda], function (err) {
                            if (err) {
                                db.run('ROLLBACK');
                                return reject(err);
                            }

                            db.run('COMMIT');
                            resolve({ success: true, message: 'Ingreso registrado correctamente' });
                        });
                    });
            });
        });
    }

    registrarSalida(placa) {
        return new Promise((resolve, reject) => {
            const fechaHoraSalida = new Date().toISOString();

            // Buscar el registro activo
            db.get(`SELECT id_registro, id_celda FROM Registro WHERE placa_vehiculo = ? AND fecha_hora_salida IS NULL`,
                [placa], (err, row) => {
                    if (err) return reject(err);
                    if (!row) return reject(new Error('El vehículo no registra entrada o ya salió.'));

                    const idRegistro = row.id_registro;
                    const idCelda = row.id_celda;

                    db.serialize(() => {
                        db.run('BEGIN TRANSACTION');

                        db.run(`UPDATE Registro SET fecha_hora_salida = ? WHERE id_registro = ?`,
                            [fechaHoraSalida, idRegistro], function (err) {
                                if (err) {
                                    db.run('ROLLBACK');
                                    return reject(err);
                                }

                                db.run(`UPDATE Celda SET estado = 'Disponible' WHERE id_celda = ?`, [idCelda], function (err) {
                                    if (err) {
                                        db.run('ROLLBACK');
                                        return reject(err);
                                    }

                                    db.run('COMMIT');
                                    resolve({ success: true, message: 'Salida registrada correctamente' });
                                });
                            });
                    });
                });
        });
    }
}

module.exports = new GestorParqueadero();
