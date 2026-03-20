# Autos Colombia - Sistema de Control de Parqueadero

Este es el sistema backend y frontend para la gestión del parqueadero "Autos Colombia", desarrollado con una **Arquitectura de 3 Capas** (Datos, Lógica, Presentación).

## Tecnologías Utilizadas
- **Node.js** y **Express.js** (Backend API)
- **SQLite** (Base de Datos ligera local)
- **HTML5, CSS3, Bootstrap y Vanilla JavaScript**

## Estructura del Proyecto (3 Capas)
1. **Capa de Datos (`/data`)**: Contiene la configuración de conexión y consultas a la base de datos `parqueadero.db` usando la librería `sqlite3`.
2. **Capa Lógica (`/logic`)**: Implementa las clases con encapsulamiento (`#atributosPrivados`) para mantener la lógica de negocio y reglas:
   - `Vehiculo.js`
   - `Celda.js`
   - `Registro.js`
   - `GestorParqueadero.js` (Orquestador principal)
3. **Capa de Presentación (`/public` y `server.js`)**: 
   - `server.js` expone la API RESTful.
   - `/public` contiene la interfaz web (Dashboard, Modales de Ingreso/Salida) enrutada en una Single Page Application fluida consumiendo Fetch API.

## Requisitos Previos
- [Node.js](https://nodejs.org/) (v16 o superior recomendado)

## Instalación y Ejecución Local
1. Clona este repositorio o descarga los archivos.
2. Abre la terminal en la raíz del proyecto y ejecuta el siguiente comando para instalar las dependencias:
   ```bash
   npm install
   ```
3. Inicia el servidor de Express usando el siguiente comando:
   ```bash
   node server.js
   ```
4. Abre tu navegador web favorito y visita: [http://localhost:3000](http://localhost:3000)

## Características de la Iteración 1
- **Dashboard Estadístico:** Monitoreo en tiempo real de los vehículos actualmente adentro (En Sitio) y el total de celdas libres.
- **Registro de Entrada:** Formulario con modal (Pop-up) para buscar por placa, ver si la mensualidad está activa, seleccionar una celda libre de la base de datos y dar ingreso oficial.
- **Registro de Salida:** Formulario para buscar una placa que se encuentre parqueada y generar su salida, liberando automáticamente la celda ocupada.
