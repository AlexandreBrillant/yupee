/**
 * This class manages all the Yup components for loading and storing them.
 * it must be used as a singleton only with Yupees.instance()
 * 
 * @author Alexandre Brillant (https://github.com/AlexandreBrillant/)
 */

class Yupees {
    static #singleton = null;
    static #singletonController = true;

    static instance() {
        if ( Yupees.#singleton == null ) {
            Yupees.#singletonController = false;
            Yupees.#singleton = new Yupees();
            Yupees.#singletonController = true;
        }
        return Yupees.#singleton;
    }

    constructor() {
        if ( Yupees.#singletonController )
            throw new "Illegal usage for the Yupees, use Yupees.instance()";
    }

    //----------------------------------------------

    #yupeesStack = [];
    #startLoading = false;

    #listeners = {};
    #data = {};
    #applicationModel = null;

    /**
     * Typically, user could use a global model for the current application containing all the data
     * @returns a shared model
     */
    applicationModel( content ) {
        this.#applicationModel = this.#applicationModel ?? new YupModel( content );
        return this.#applicationModel;
    }

    /**
     * Listens for an event. This is not a DOM event but a free user event for communicating between components
     * @param actionId the event id (not DOM event)
     * @param handler The function for receiving the event notification
     */
    listen( eventId, handler ) {
        if ( typeof ( this.#listeners[ eventId ] ) == "undefined" ) {
            this.#listeners[ eventId ] = [];
        }
        this.#listeners[ eventId ].push( { "handler" : handler } );
        _trace( "listen", eventId, handler );
    }

    /**
     * Fires an event with optional arguments. This event will be received by all the functions listening for it
     * @param eventId The event id (not DOM event)
     * @param args Optional arguments
     */
    fire( eventId, ...args ) {
        if ( this.#listeners[ eventId ] ) {
            this.#listeners[ eventId ].forEach(
                ( obj ) => {
                    const handler = obj.handler;
                    handler( ...args );
                }
            );
        }
        _trace( "fire", eventId, args );
    }

    /**
     * Reads or writes data between the Yup components
     * @param key A string for the data name
     * @param args Optional for reading and at least one argument for writing
     * @returns A value if the key is known
     */
    data(key,...args ) {
        if ( args.length == 0 ) {
            if ( typeof this.#data[ key ] == "undefined" ) {
                return null;
            } else
                return this.#data[ key ];
        } else {
            this.#data[ key ] = args[ 0 ];
        }
        _trace( "data", key, args );
    }

    // Internal usage : do not use
    loadComponent( location, params ) {
        this.#yupeesStack.push( { "location" : location, "params" : params } );
        if ( !this.#startLoading ) {
            this.#startLoading = true;
            this.loadNextComponent();
        }
    }

    #currentParams = null;
    #currentYupId = null;

    #yupidFromLocation( location ) {
        const pathSep = location.lastIndexOf( "/" );
        if ( pathSep > -1 )
            return location.substring( pathSep + 1 );
        return location;
    }

    // Internal usage : do not use
    loadNextComponent() {
        const component = this.#yupeesStack.shift();
        if ( typeof component != "undefined" ) {
            let { location, params } = component;
            this.#currentYupId = this.#yupidFromLocation( location );
            if ( !location.match( /\.js$/ ) )
                location += ".js";

            this.#currentParams = params;
            Provider.instance().loadYup( location ).then( () => {
                Yupees.#singleton.loadNextComponent();
            }).catch( ( error ) => {
                _trace( "load", error, error.stack );
                _criticalError( "load yup", location );
                $$.exit( 1 );
            } );
        } else {
            this.fire( $$.KEYS.EVENT_READY );   // Ready event for all the yup components
        }
    }

    /**
     * Start a new component and return a reference to it
     * @param config Optional configuration object (including model/renderer)
     * @returns The current running component
     */
    start( config ) {
        config = config || {};
        config.yupid = this.#currentYupId;
        config.params = this.#currentParams;
        const currentComponent = Factory.instance().newYup( config );
        _trace( "start", this.#currentYupId );
        return currentComponent;
    }

    /**
     * Stop loading Yup components
     * @param {*} exitCode 
     */
    exit( exitCode ) {
        this.#yupeesStack = [];
        this.#startLoading = false;
    }
}

