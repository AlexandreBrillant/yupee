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
 * @version 1.0
 */

const $$ = ( ( $$ ) =>  {    

    let debugMode = false;
    let deepTrace = false;
    let traceMode = 0;

//#include "trace.js"
//#include "yupees.js"
//#include "yupmodel.js"
//#include "yupcontainer.js"
//#include "yup.js"
//#include "factory.js"
//#include "boot.js"
//#include "resolver.js"
//#include "pages.js"
//#include "driver.js"
//#include "provider.js"
//#include "binder.js"

    function _startingAll() {
        if ( starting ) {
            starting.forEach( ( starting ) => starting() );
        }
        starting=null;
    }

    let starting = [];
    let ready = false;

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
     * Load a new page with new yup component
     * @param {*} page URL, this is a folder with a main.html page and a set of Yup components
     * @param {*} keepContext by default true for keeping the current application model
     */
    $$.loadPage = ( page, keepContext = true ) => {
        Pages.instance().loadpage( page, keepContext );
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
           // restore the data model if required
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
        initModel : ( content ) => {    // Use a new model
            $$.initModelHandler && $$.initModelHandler( content );
            if ( !$$.application._model )
                $$.application._model = Yupees.instance().applicationModel( content );
            else
                $$.application._model.reset( content );
            return $$.application._model;
        },
        model : () => {    // Common model for the Yup components
            if ( !$$.application._model )
                throw new Error( "No initialized model, use the initModel method" );
            return $$.application._model;
        },
        renderer : null,            // Default renderer for a Yup component
        templates : {               // Common template for a Yup component
        },
        update : ( flags ) => {     // Notification to update the model
            $$.application.model().update( flags );
        },
        hasModel: () => {
            return $$.application._model;
        },
        initModelHandler: ( handler ) => {  // Handler for being notified when the model is initialized, this is for multiple pages usage
            $$.initModelHandler = handler;
        },
        ready : () => {
            $$.application._model && $$.application._model.update();
        }
    }

    /*
    * Override the default Driver class for pages management. You must
    * extends your class using $$.classes.Driver
    */
    $$.driverClass = null;

    /**
     * Override the default Yup class by this one. You must extend your class
     * using $$.classes.Yup.
     */
    $$.yupClass = null;

    /**
     * Override the default Yup container class by this one. You must extend your class
     * using $$.classes.YupContainer.
     */
    $$.yupContainerClass = null;

    /**
     * Override the default Yup model class by this one. You must extend your class
     * using $$.classes.YupModel.
     */
    $$.yupModelClass = null;

    /**
     * Here a way to use your own classes for your Driver, Yup component or Yup model.
     * You just have to exends one Class like
     * @example
     * class MyYupComponent extends $$.classes.Yup {
     *  ...
     * }
     */
    $$.classes = {       
        Driver : Driver,
        Yup : Yup,
        YupContainer : YupContainer,
        YupModel : YupModel
    };

    /**
    * Simple shortcuts for dialogs of type alert/confirm/prompt, thus user can
    * override this default usage
    */
    $$.dialogs = {
        alert:( msg ) => window.alert( msg ),
        confirm:( msg ) => window.confirm( msg ),
        prompt:( msg ) => window.prompt( msg )
    };

    /**
     * This is a simple way to stop the Yup component loading and leave the application
     * @param exitCode : 0 for OK, > 0 for error
     */
    $$.exit = ( exitCode ) => {
        Yupees.instance().exit( exitCode );
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

    // Prepare the application model when all Yup components has been loaded
    $$.listen( $$.KEYS.EVENT_READY, () => {
        Pages.instance().init(); 
        $$.application.ready();
    });

    return $$;

} )( {} || $$ );
