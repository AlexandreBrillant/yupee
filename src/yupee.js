/**
 * Yupee, for avoiding React when building modular web applications.
 * 
 * It works with external Yup component files. A Yup component is a standard JavaScript file that calls the $$.start function.
 * Each Yup component can generate a piece of HTML and manage actions and events.
 * 
 * @example
 * ```html
 * <html>
 *   <head>
 *       <script src="../src/yupee.js"></script>
 *       <script>$$.load( "test1" );</script>
 *   </head>
 
 *   <body>
 *
 *   </body>
 *
 * </html>
 * ```
 * 
 * In this sample, we load a Yup Component file named "test1.js". Here a minimal yup component
 * 
 * @example
 * ( () => {
 *   
 *   const yup = $$.start();
 *   yup.paint( "<div>Hello world</div>" );
 *
 * } )();
 * 
 * Benefits of using this library :
 * ================================
 *  
 * - Yupee does not need a server
 * - Yupee works locally
 * - Yupee is very simple and uses only standard JavaScript
 * 
 * @author Alexandre Brillant (https://github.com/AlexandreBrillant/)
 */

const $$ = ( ( $$ ) =>  {    

    /**
     * This class is the main part; it manages all the Yup components for loading and storing them.
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
                        handler( obj.source, ...args );
                    }
                );
            }
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

        // Internal usage : do not use
        loadNextComponent() {
            const component = this.#yupeesStack.shift();
            if ( typeof component != "undefined" ) {
                let { location, params } = component;
                if ( !location.includes( "." ) )
                    location += ".js";
                const scriptNode = document.createElement( "script" );
                scriptNode.addEventListener( "load", () => {
                    Yupees.#singleton.loadNextComponent();
                } );
                scriptNode.src = location;
                this.#currentParams = params;
                document.head.appendChild( scriptNode );
            }
        }

        /**
         * Start a new component and return a reference to it
         * @returns The current running component
         */
        start() {
            const currentComponent = new Yup(this.#currentParams);
            return currentComponent;
        }
    }

    /**
     * A Yup component is an external file with this content :
     * @example
     *  ( () => {
     *      const yup = $$.start();
     *      yup.paint( "<div>Content 1 !</div>", "#part1" );
     *  } )() );
     * 
     * A yup component must begin with the $$.start method, it will provide a reference to the current yup component
     * 
     * @author Alexandre Brillant (https://github.com/AlexandreBrillant/)
     */
    class Yup {
        #view
        #eventStack
        #actionStack 
        #params

        constructor(params) {
            this.#params = params;
            this.#eventStack = [];
            this.#actionStack = [];
            this.#view = document.body;
        }

        #binder( func ) {
            const that = this;
            return function( ...args ) {
                args.push( that );
                func.apply( that, args );
            };
        }

        /**
         * Read the a parameter provided when using the $$.load method
         * @param {*} paramIndex Parameter index starting from 0
         * @param {*} defaultValue Default value if the parameter is unknown
         * @return the parameter value or the default value
         */
        param( paramkey, defaultValue ) {
            if ( this.#params && this.#params[paramkey] )
                return this.#params[ paramkey ];
            return defaultValue;
        }

        /**
         * Paint this component adding a content to the current view.
         * 
         * @param html HTML string or HTML node
         * @param into Optionnal part for updating the component view
         */
        paint( html ) {

            this.clean();

            // Put the content

            if ( html instanceof Node ) {    
                this.#view.appendChild( html );
            } else
                this.#view.innerHTML = html;

            // Store listeners and actions

            this.#eventStack.forEach( ( handler ) => { handler(); } );
            this.#eventStack.splice(0,this.#eventStack.length);

            this.#actionStack.forEach( ( action ) => { action(); } );
            this.#actionStack.splice( 0,this.#actionStack.length );

            return this;
        }

        /**
         * Apply a CSS style to the current paint
         * @param {*} values object with the css properties and values
         */
        style( values ) {
            for ( let property in values ) {
                this.#view.style[ property ] = values[ property ];
            }
            return this;
        }

        /**
         * Add a new DOM event listener to the current view
         * @param evt HTML event
         * @param handler HTML handler
         */
        event( evt, handler ) {
            this.#eventStack.push(
                () => {
                    this.#view.addEventListener( evt, this.#binder( handler ) );
                } );
            return this;
        }

        /**
         * Running an action with the component can be added inside the HTML page
         * @param handler Store this handler and run it after the component is painted
         */ 
        action( handler ) {
            this.#actionStack.push(
                this.#binder( handler )
            );
            return this;
        }

        /** 
         *  Change the view of this component. This is the view used when calling the paint method.
         *  @param selector a CSS selector
         */
        into( cssselector ) {
            try {
                const node = document.querySelector( cssselector );
                if ( node != null ) {
                    this.#view = node;
                }
            } catch( error ) {
                console.log( `Invalid selector [${cssselector} / ${error.message}] ? using document.body` );
                this.#view = document.body;
            }
            return this;
        }

        /** Modify the view to another part of the document with an HTML id value
         *  @param id unique identifier bound to the HTML id attribute
         */
        intoid( id ) {
            return this.into( "@" + id );
        }

        /**
            @return The HTML view for this component
        */
        getView() {
            return this.#view;
        }

        /**
         * Remove all the content of the view
         */
        clean() {
            const parentNode = this.#view;
            while ( parentNode.firstChild )
                parentNode.removeChild( parentNode.firstChild );
            return this;
        }

        /**
         * @param cssSelector CSS Selector
         * @return an array with all the HTML nodes depending on the CSSS selector
         */
        selectAll( cssSelector ) {
            return this.getView().querySelectorAll( cssSelector );
        }

        /**
         * @param cssSelector CSS Selector
         * @return a node depending on the cssSelector
         */
        select( cssSelector ) {
            return this.getView().querySelector( cssSelector );
        }
    }

    // #######################################################################

    function _startingAll() {
        if ( starting ) {
            starting.forEach( ( starting ) => starting() );
        }
        starting=null;
    }

    let starting = [];
    let ready = false;

    /**
     * This is the main function of Yupee
     * It is called both for loading Yup components and for managing each one
     */
    const rooter = (...args) => {
        if ( document.body )
            ready = true;

        init = () => {
                let usage = null;
                if ( args.length ) 
                    usage = args[ 0 ];
            
                const yupees = Yupees.instance();

                if ( typeof usage == "object" ) { 
                    const { load, params } = usage;
                    yupees.loadComponent( load, params );
                }
        };

        if ( ready )    // Run now
            init();
        else {          // Wait until the html page is loaded
            starting.push(init);
            document.addEventListener( "DOMContentLoaded", () => {
                ready = true;
                _startingAll();
            } );
        }

    }

    // shortcuts

    $$.rooter = rooter;

    /**
     * This required when starting a Yup component.
     * @return A reference to the current Yup component
     */
    $$.start = () => {
        return Yupees.instance().start();
    }

    /**
     * @param yupcomponent The yup component external file
     * @param  {...any} params Optional parameters for the Yup component
     * @returns $$
     */
    $$.load = ( yupcomponent, params ) => {
        rooter( { "load" : yupcomponent, "params" : params } );
        return $$;
    };

    /**
     * Listen for a Yup component event, this is for the user application usage
     * @param {*} actionId Free event name
     * @param  {...any} actions Handlers for this actionId event
     * @returns $$
     */
    $$.listen = ( actionId, ...actions ) => {
        actions.forEach( (action) => Yupees.instance().listen( actionId, action ) );
        return $$;
    };

    /**
     * A Yup component can fire an event to another Yup component, this is for user application usage
     * @param {*} actionId  Free event name
     * @param  {...any} params  Free additional parameters
     * @returns 
     */
    $$.fire = ( actionId, ...params ) => {
        Yupees.instance().fire( actionId, params )
        return $$;
    };

    /**
     * Read/Write date between the Yup components
     * @param {*} key A free key name
     * @param  {...any} params Optional parameters when writing a value
     * @returns $$ or a value
     */
    $$.data = ( key, ...params ) => {
        if ( params.length == 0 )
            return Yupees.instance().data(key,...params );    // read
        Yupees.instance().data(key,...params );   // write
        return $$;
    }

    return $$;

} )( {} || $$ );
