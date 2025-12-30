/**
 * This is a factory for building new instances of various classes like :
 * - Yup for a Yup component
 * - Yup model for a Yup data model
 * - Driver for loading new pages and ressource.
 * 
 * Thus a user can change a class using this factory easily.
 * 
 * @author Alexandre Brillant (https://github.com/AlexandreBrillant/)
 */
class Factory {
    static #singleton = null;
    static #singletonController = true;

    static instance() {
        if ( Factory.#singleton == null ) {
            Factory.#singletonController = false;
            Factory.#singleton = new Factory();
            Factory.#singletonController = true;
        }
        return Factory.#singleton;
    }

    constructor() {
        if ( Factory.#singletonController )
            throw new "Illegal usage for the Factory, use Factory.instance()";
    }

    newYup( config = {} ) {
        return new ( config.class || $$.yupClass || Yup )( config );
    }

    newYupContainer( config ) {
        return new ( $$.yupContainerClass || YupContainer )( config );
    }

    newModel( config = {} ) {
        return new ( config.class || $$.yupModelClass || YupModel )( config );
    }

    newDriver( config = {} ) {
        if ( config.class || $$.driverClass )    
            return new ( config.class || $$.driverClass );
        return $$.driver;
    }
}