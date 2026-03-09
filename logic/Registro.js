class Registro {
    #idRegistro;
    #fechaHoraEntrada;
    #fechaHoraSalida;

    constructor(idRegistro, fechaHoraEntrada, fechaHoraSalida = null) {
        this.#idRegistro = idRegistro;
        this.#fechaHoraEntrada = fechaHoraEntrada;
        this.#fechaHoraSalida = fechaHoraSalida;
    }

    get idRegistro() {
        return this.#idRegistro;
    }

    get fechaHoraEntrada() {
        return this.#fechaHoraEntrada;
    }

    get fechaHoraSalida() {
        return this.#fechaHoraSalida;
    }

    set fechaHoraSalida(fecha) {
        this.#fechaHoraSalida = fecha;
    }
}

module.exports = Registro;
