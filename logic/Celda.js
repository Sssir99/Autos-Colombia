class Celda {
    #idCelda;
    #numeroCelda;
    #estado;

    constructor(idCelda, numeroCelda, estado) {
        this.#idCelda = idCelda;
        this.#numeroCelda = numeroCelda;
        this.#estado = estado;
    }

    get idCelda() {
        return this.#idCelda;
    }

    get numeroCelda() {
        return this.#numeroCelda;
    }

    get estado() {
        return this.#estado;
    }

    ocuparCelda() {
        this.#estado = 'Ocupada';
    }

    liberarCelda() {
        this.#estado = 'Disponible';
    }
}

module.exports = Celda;
