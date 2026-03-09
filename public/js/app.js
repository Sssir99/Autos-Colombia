// globals
const API_URL = 'http://localhost:3000/api';

// element refs
const elVehiculosAdentro = document.getElementById('vehiculos-adentro-count');
const elCeldasDisponibles = document.getElementById('celdas-disponibles-count');
const elEnSitioCount = document.getElementById('en-sitio-count');
const elTablaBody = document.getElementById('tabla-vehiculos-body');

// On Data Load
document.addEventListener('DOMContentLoaded', () => {
    actualizarReloj();
    setInterval(actualizarReloj, 1000);

    cargarDashboard();
});

function actualizarReloj() {
    moment.locale('es');
    const ahora = moment();
    document.getElementById('current-date').textContent = ahora.format('dddd, D [De] MMMM [De] YYYY').replace(/\b\w/g, c => c.toUpperCase());
    document.getElementById('current-time').textContent = ahora.format('hh:mm:ss a');
}

async function cargarDashboard() {
    try {
        const statsRes = await fetch(`${API_URL}/estadisticas`);
        const stats = await statsRes.json();

        elVehiculosAdentro.textContent = stats.vehículosAdentro;
        elEnSitioCount.textContent = stats.vehículosAdentro;
        elCeldasDisponibles.textContent = stats.celdasDisponibles;

        const vehiculosRes = await fetch(`${API_URL}/vehiculos-adentro`);
        const vehiculos = await vehiculosRes.json();

        dibujarTabla(vehiculos);
    } catch (error) {
        console.error("Error cargando dashboard:", error);
    }
}

function dibujarTabla(vehiculos) {
    elTablaBody.innerHTML = '';

    if (vehiculos.length === 0) {
        elTablaBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:20px;">No hay vehículos adentro.</td></tr>`;
        return;
    }

    vehiculos.forEach(v => {
        const tr = document.createElement('tr');

        const horaIngreso = moment(v.fecha_hora_entrada).format('hh:mm A');

        const mensualidadHtml = v.mensualidad_activa
            ? `<div class="status-badge status-ok"><i class="fa-regular fa-circle-check"></i> AL DÍA</div>`
            : `<div class="status-badge status-error"><i class="fa-regular fa-circle-xmark"></i> PAGO DIARIO</div>`;

        tr.innerHTML = `
            <td><div class="placa-badge">${v.placa_vehiculo}</div></td>
            <td>
                <div class="time-info">
                    <span class="time-main">${horaIngreso}</span>
                    <span class="time-sub">HOY</span>
                </div>
            </td>
            <td><div class="celda-badge">${v.numero_celda}</div></td>
            <td>${mensualidadHtml}</td>
        `;
        elTablaBody.appendChild(tr);
    });
}

// ==========================================
// MODAL INGRESO LOGIC
// ==========================================
async function abrirModalEntrada() {
    document.getElementById('modal-entrada').classList.remove('hidden');
    document.getElementById('placa-entrada').value = '';
    document.getElementById('mensualidad-container').classList.add('hidden');
    document.getElementById('celdas-container').classList.add('hidden');
    document.getElementById('btn-guardar-ingreso').disabled = true;
}

function cerrarModalEntrada() {
    document.getElementById('modal-entrada').classList.add('hidden');
}

async function validarPlaca() {
    const placa = document.getElementById('placa-entrada').value.toUpperCase().trim();
    if (placa.length < 6) return alert("Ingrese una placa válida");

    try {
        const res = await fetch(`${API_URL}/vehiculo/${placa}`);
        if (res.status === 404) {
            Swal.fire('Error', 'Vehículo no encontrado en la base de datos.', 'error');
            return;
        }

        const vehiculo = await res.json();

        // Show Mensualidad
        const mContainer = document.getElementById('mensualidad-container');
        const mStatus = document.getElementById('mensualidad-status');

        mContainer.classList.remove('hidden');
        if (vehiculo.mensualidadActiva) {
            mStatus.className = 'status-box';
            mStatus.innerHTML = `<i class="fa-regular fa-circle-check"></i> AL DÍA`;
        } else {
            mStatus.className = 'status-box error';
            mStatus.innerHTML = `<i class="fa-regular fa-circle-xmark"></i> PAGO DIARIO`;
        }

        // Cargar celdas disponibles
        await cargarCeldasSelect();

    } catch (error) {
        console.error("Error validando placa:", error);
    }
}

async function cargarCeldasSelect() {
    try {
        const res = await fetch(`${API_URL}/celdas-disponibles`);
        const celdas = await res.json();

        const select = document.getElementById('select-celda');
        select.innerHTML = '<option value="">-- Seleccione una celda --</option>';

        celdas.forEach(c => {
            select.innerHTML += `<option value="${c.id_celda}">${c.numero_celda}</option>`;
        });

        document.getElementById('celdas-container').classList.remove('hidden');

        // enable save button only if cell is selected
        select.addEventListener('change', () => {
            document.getElementById('btn-guardar-ingreso').disabled = !select.value;
        });

    } catch (error) {
        console.error("Error cargando celdas:", error);
    }
}

async function guardarIngreso() {
    const placa = document.getElementById('placa-entrada').value.toUpperCase().trim();
    const idCelda = document.getElementById('select-celda').value;

    if (!placa || !idCelda) return;

    try {
        const res = await fetch(`${API_URL}/ingreso`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ placa, idCelda })
        });

        const result = await res.json();

        if (res.ok) {
            Swal.fire('Éxito', result.message, 'success');
            cerrarModalEntrada();
            cargarDashboard();
        } else {
            Swal.fire('Error', result.error, 'error');
        }
    } catch (error) {
        Swal.fire('Error', error.message, 'error');
    }
}

// ==========================================
// MODAL SALIDA LOGIC
// ==========================================

// Variable to store data between search and save
let salidaActiva = null;

function abrirModalSalida() {
    document.getElementById('modal-salida').classList.remove('hidden');
    document.getElementById('placa-salida').value = '';
    document.getElementById('detalles-vehiculo-container').classList.add('hidden');
    document.getElementById('btn-guardar-salida').disabled = true;
    salidaActiva = null;
}

function cerrarModalSalida() {
    document.getElementById('modal-salida').classList.add('hidden');
}

async function buscarVehiculoSalida() {
    const placaBuscada = document.getElementById('placa-salida').value.toUpperCase().trim();
    if (placaBuscada.length < 6) return;

    try {
        const res = await fetch(`${API_URL}/vehiculos-adentro`);
        const vehiculos = await res.json();

        const vehiculo = vehiculos.find(v => v.placa_vehiculo === placaBuscada);

        if (vehiculo) {
            salidaActiva = vehiculo;

            document.getElementById('salida-placa-txt').textContent = vehiculo.placa_vehiculo;
            document.getElementById('salida-celda-txt').textContent = vehiculo.numero_celda;
            document.getElementById('salida-hora-ingreso').textContent = moment(vehiculo.fecha_hora_entrada).format('hh:mm A');
            document.getElementById('salida-hora-salida').textContent = moment().format('hh:mm a');

            document.getElementById('detalles-vehiculo-container').classList.remove('hidden');
            document.getElementById('btn-guardar-salida').disabled = false;
        } else {
            Swal.fire('No Encontrado', 'El vehículo no está registrado adentro o la placa es incorrecta.', 'warning');
            document.getElementById('detalles-vehiculo-container').classList.add('hidden');
            document.getElementById('btn-guardar-salida').disabled = true;
        }
    } catch (error) {
        console.error("Error buscando salida:", error);
    }
}

async function guardarSalida() {
    if (!salidaActiva) return;

    try {
        const res = await fetch(`${API_URL}/salida`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ placa: salidaActiva.placa_vehiculo })
        });

        const result = await res.json();

        if (res.ok) {
            Swal.fire({
                title: 'Salida Registrada',
                text: result.message,
                icon: 'success',
                confirmButtonColor: '#ED1C4A'
            });
            cerrarModalSalida();
            cargarDashboard();
        } else {
            Swal.fire('Error', result.error, 'error');
        }
    } catch (error) {
        Swal.fire('Error', error.message, 'error');
    }
}
