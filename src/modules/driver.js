/**
 * Abstract class for a Driver
 * @author Alexandre Brillant (https://github.com/AlexandreBrillant/)
 */
class Driver {

    constructor() {
        if ( new.target == Driver ) {
            throw new Error( "Invalid Driver class usage, you must use a descendant class" );
        }
    }

    async loadYup( location ) {
        throw new Error( "Invalid usage" );
    }


    async loadPage( location ) {
        throw new Error( "Invalid usage");
    }

    async readData( key ) {
        throw new Error( "Invalid usage");
    }

    async writeData( key, value ) {
        throw new Error( "Invalid usage");
    }

}

/**
 * Local implementation
 * @author Alexandre Brillant (https://github.com/AlexandreBrillant/)
 */
class LocalDriver extends Driver {

        async loadYup( location ) {
            return new Promise(
                (resolve,reject) => {
                    const scriptNode = document.createElement( "script" );
                    scriptNode.addEventListener( "load", () => resolve(true) );
                    scriptNode.addEventListener( "error", () => reject( "can't load " + location) );
                    scriptNode.src = location;
                    document.head.appendChild( scriptNode );
                } );
        }

        async loadPage( location ) {
            return new Promise(
                (resolve,reject) => {
                    // Overwrite the current context
                    window.location.href = location;
                } );
        }

        async readData( key ) {
            return new Promise(
                (resolve,reject) => {
                    resolve( localStorage.getItem( key ) );
                } );
        }

        async writeData( key,value ) {
            return new Promise(
                (resolve,reject) => {
                    localStorage.setItem( key, value );
                    resolve(true);
                } );
        }

}