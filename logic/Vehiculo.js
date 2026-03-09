class Vehiculo {
    #placa;
    #mensualidadActiva;

    constructor(placa, mensualidadActiva) {
        this.#placa = placa;
        this.#mensualidadActiva = mensualidadActiva;
    }

    get placa() {
        return this.#placa;
    }

    get mensualidadActiva() {
        return this.#mensualidadActiva;
    }

    verificarMensualidad() {
        return this.#mensualidadActiva === 1;
    }
}

module.exports = Vehiculo;
