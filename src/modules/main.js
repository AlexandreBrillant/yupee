/**
 * Yupee is a simple way for building complex web application without a server
 *
 * It works with external Yup component files. A Yup component is a standard JavaScript file that calls the $$.start function.
 * Each Yup component can renderer a piece of HTML and manage actions and events. A Yup container has a container for
 * renderering.
 * 
 * @example
 * ```html
 * <html>
 *   <head>
 *       <script src="yupee.js"></script>
 *       <script>$$.load( "test1" );</script>
 *   </head>
 
 *   <body>
 *
 *   </body>
 *
 * </html>
 * ```
 * 
 * In this sample, we load a Yup Component file named "test1.js". Here now a minimal yup component
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
 * - Yupee can be used for very complex MVC applications
 * 
 * @author Alexandre Brillant (https://github.com/AlexandreBrillant/)
 * @version 0.9
 */

const $$ = ( ( $$ ) =>  {    

    let debugMode = false;
    let deepTrace = false;
    let traceMode = 0;

    function _trace( actionId, ...params ) {
        if ( debugMode ) {
            const paramstr = params.join( "," );
            const log = `** [${actionId}] ** ${paramstr}`
            if ( traceMode == $$.KEYS.DEBUG_CONSOLE )
                console.log( log );
            else {
                document.body.insertAdjacentHTML( "beforeend", `<div class='yuptrace'>${log}</div>` );
            }
            if ( deepTrace ) {
                params.forEach( ( element ) => {
                    if ( typeof element == "object" ) {
                        if ( traceMode == $$.KEYS.DEBUG_CONSOLE )
                            console.log( element );
                        else {
                            document.body.insertAdjacentHTML( "beforeend", `<div class='yuptrace'>${log}</div>` );
                        }
                    }
                } );
            }
        }
    }

//#include "yupees.js"

//#include "yupmodel.js"

//#include "yup.js"

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
    const boot = (...args) => {
        ready = document.body ? true : false;

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

    // Resolve the data-yup attributes when the document is ready

    ( () => {

        // Check for data-yup attribute inside the current page

        function resolve_yup_path( node ) {
            const t = [];
            while ( node ) {
                if ( node.nodeType == Node.ELEMENT_NODE && node.hasAttribute( "data-yup" ) ) {
                    if ( node.id ) {
                        t.unshift( node.id );
                    }
                }
                node = node.parentNode;
            }
            return t.join( "/" );
        }

        function process_data_yup() {
            const nodes = document.querySelectorAll( "*" );
            for ( node of nodes ) {
                let path = null;
                // Try a delegate function
                if ( $$.pathResolver )
                    path = $$.pathResolver( node );
                // Try the data-yup attribute value
                path = !path && node.dataset.yup;
                // Use the node id as a name for the yup component for empty data-yup attribute
                if ( !path && node.hasAttribute( "data-yup" ) && node.id ) {
                    path = "yups/" + resolve_yup_path( node );
                }
                if ( path )
                    $$.load( path, { "_into" : node } );
            }
        }

        document.addEventListener( "DOMContentLoaded", () => {
            process_data_yup();
        } );
    } )();

    /**
     * This required when starting a Yup component.
     * You can call it with a configuration like that
     * $$.start( { model:..., renderer:...} ); or
     * $$.start();
     * @param config Optional object configuration (model/renderer)
     * @return A reference to the current Yup component
     */
    $$.start = ( config ) => {
        return Yupees.instance().start( config );
    }

    /**
     * @param yupcomponent The yup component external file
     * @param  {...any} params Optional parameters for the Yup component
     * @returns $$
     */
    $$.load = ( yupcomponent, params ) => {
        boot( { "load" : yupcomponent, "params" : params } );
        _trace( "load", yupcomponent, params );
        return $$;
    };

    /**
     * You can update the path using a delegate function.
     * This function has a DOM node as a parameter and return a path
     * to the Yup component
     */
    $$.pathResolver = null;

    /**
     * Listen for a Yup component event, this is for the user application usage
     * @param {*} eventid Free event name
     * @param  {...any} actions functions to call for this eventid event
     * @returns $$
     */
    $$.listen = ( eventid, ...actions ) => {
        actions.forEach( (action) => Yupees.instance().listen( eventid, action ) );
        _trace( eventid, actions );
        return $$;
    };

    /**
     * Event for all the Yup component has been loaded
     * @param  {...any} actions functions for processing the event
     */
    $$.ready = ( ...actions ) => {
        $$.listen( $$.KEYS.EVENT_READY, ...actions );
    }

    /**
     * A Yup component can fire an event to another Yup component, this is for user application usage
     * @param {*} eventid  Free event name
     * @param  {...any} params  Free additional parameters
     * @returns 
     */
    $$.fire = ( eventid, ...params ) => {
        Yupees.instance().fire( eventid, params )
        _trace( "fire", eventid, params );
        return $$;
    };

    /**
     * Read/Write data between the Yup components
     * @param {*} key A free key name
     * @param  {...any} params Optional parameters when writing a value
     * @returns $$ or a value
     */
    $$.data = ( key, ...params ) => {
        if ( params.length == 0 )
            return Yupees.instance().data(key,...params );    // read
        Yupees.instance().data(key,...params );   // write
        _trace( "data", key, params );
        return $$;
    }

    /**
     * This is a shared object for all the application. Any Yup component can use it.
     * @returns an object for all the yup components
     */
    $$.application = {
        model : ( content ) => {    // Common model for the Yup components
            if ( !$$.application._model )
                $$.application._model = Yupees.instance().applicationModel( content );
            return $$.application._model;
        },
        renderer : null,            // Default renderer for a Yup component
        templates : {               // Common template for a Yup component
        },
        update : ( flags ) => {     // Update the model
            $$.application.model().update( flags );
        }
    }

    // Specific key usage
    $$.KEYS = Object.freeze( {
        DEBUG_CONSOLE : 0,  // console trace output
        DEBUG_BODY : 1, // page body trace output
        EVENT_YUPID : "event/yupid", // key for producing a yup id value
        EVENT_READY : "event/ready", // event for all the Yup components are loaded
        AUTO_HANDLER : "handler/auto" // manager for a click firing an event
    } );

    /**
     * Enable/Disable the debug mode. By default the
     * trace are for the console output.
     * @param {*} mode Change the trace output $$.KEYS.DEBUG_CONSOLE or $$.KEYS.DEBUG_BODY
     */
    $$.debugMode = ( mode ) => {
        traceMode = mode ?? $$.KEYS.DEBUG_CONSOLE;
        debugMode = !debugMode;
    }

    return $$;

} )( {} || $$ );
