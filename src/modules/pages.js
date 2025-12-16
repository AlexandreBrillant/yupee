class Pages {
    static #singleton = null;
    static #singletonController = true;

    static instance() {
        if ( Pages.#singleton == null ) {
            Pages.#singletonController = false;
            Pages.#singleton = new Pages();
            Pages.#singletonController = true;
        }
        return Pages.#singleton;
    }

    constructor() {
        if ( Pages.#singletonController )
            throw new "Illegal usage for the Pages, use Pages.instance()";
    }

    loadpage( page, newContext = true ) {
        window.location.href = page + "/main.html";
    }
}
