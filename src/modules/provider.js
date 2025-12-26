/**
 * A provider is here for critical ressource access like :
 * - loading a Yup component file
 * - loading a new page
 * - reading/writting value
 * 
 * A provider works with a driver. A driver can be plugged depending on your
 * usage. For sample for using inside Node.js you may change the way the
 * ressources are loaded, then you just have to create a driver and plugin
 * into this provider.
 *  
 * For creating a driver you must provide an object at $$.driver
 * 
 * @author Alexandre Brillant (https://github.com/AlexandreBrillant/)
 */
class Provider {
    static #singleton = null;
    static #singletonController = true;

    static instance() {
        if ( Provider.#singleton == null ) {
            Provider.#singletonController = false;
            Provider.#singleton = new Provider();
            Provider.#singletonController = true;

            $$.driver = Factory.instance().newDriver( {} );
        }
        return Provider.#singleton;
    }

    constructor() {
        if ( Provider.#singletonController )
            throw new "Illegal usage for the Provider, use Provider.instance()";
    }

    /**
     * Load a Yup component file
     * @param {*} location 
     */
    async loadYup( location ) {
        return ( $$.driver || this.#defaultDriver ).loadYup( location );
    }

    /**
     * Load a new HTML page
     * @param {*} location 
     */
    async loadPage( location ) {
        return ( $$.driver || this.#defaultDriver ).loadPage( location );
    }

    /**
     * Read a value for a key
     * @param {*} key 
     */
    async readData( key ) {
        return ( $$.driver || this.#defaultDriver ).readData( key );
    }

    /**
     * Write a value for a key
     * @param {*} key 
     */
    async writeData( key, value ) {
        return ( $$.driver || this.#defaultDriver ).writeData( key, value );
    }

    // Default driver
    #defaultDriver = new LocalDriver();

}