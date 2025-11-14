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
 */

const $$ = ( ( $$ ) =>  {    

    let debugMode = false;

    function trace( actionId, ...params ) {
        if ( debugMode ) {
            const paramstr = params.join( "," );
            console.log( `** [${actionId}] ** ${paramstr}` );
        }
    }

    // --------------------------------------------------------------------------------------------------------------------

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
        #yupRoot = null;
        #listeners = {};
        #data = {};

        /**
         * Access to any Yup component by a name
         * @param {*} yupid A yup component name
         * @returns a Yup component
         */
        yup( yupid ) {
            return this.#yupRoot.childName( yupid );
        }

        /**
         * @returns The root yup component
         */
        root() {
            return this.#yupRoot;
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
            trace( "listen", eventId, handler );
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
            trace( "fire", eventId, args );
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
            trace( "data", key, args );
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

        #yupid( location ) {
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
                this.#currentYupId = this.#yupid( location );
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
            const currentComponent = new Yup(this.#currentYupId, this.#currentParams);
            if ( this.#yupRoot == null ) {
                this.#yupRoot = new Yup( "root", document.body );
            }                 
            this.#yupRoot.addChild( currentComponent );
            trace( "start", this.#currentYupId );
            return currentComponent;
        }
    }

    // --------------------------------------------------------------------------------------------------------------------

    /**
     * A Yup component is an external file with this kind of content :
     * @example
     *  ( () => {
     *      const yup = $$.start();
     *      yup.paint( "<div>Content 1 !</div>", "#part1" );
     *  } )() );
     * 
     * A yup component must begin with the $$.start method, it will provide a reference to the current yup component.
     * A yup component is rendered inside a visual container, generally an HTML node.
     * 
     * A yup component can have a model for pushingData and paint it using the renderer delegate method.
     * 
     * A yup component can have children, a child is a sub part of the container. It is added using addChild with
     * a name and a CSS Selector.
     * 
     * @author Alexandre Brillant (https://github.com/AlexandreBrillant/)
     */
    class Yup {
        #container
        #actionStack 
        #params
        #yupid
        #model = [];
        #childid = 1;
        #parent = null;

        constructor(yupid,params) {
            this.#yupid = yupid;

            // Updating the default container
            if ( params instanceof Node ) {
                this.#container = params;
            } else
                this.#params = params;

            this.#actionStack = [];

            // Default container
            if ( !this.#container )
                this.#container = document.body;
        }

        #children = {};

        /**
         * Add a child for this Yup component from a sub part of the current container. A child will become another Yup component
         * @param {*} childName A name of the child, use the method child for getting it
         * @param {*} selector A CSS Selector for the child relativly the current container
         */
        addChild( childName, selector ) {
            const node = this.#container.querySelector( selector );
            if ( node == null ) {
                log( "Unknown child [" + selector + "]" );
            } else {
                this.#setchild( childName, new Yup( childName, node ) );
                return this.#children[ childName ];
            }
        }

        #setchild( name, yup ) {
            yup.#parent = this;
            this.#children[ name ] = yup;
            return yup;
        }

        /**
         * Add a new child inside this Yup component
         * The container of the new child will be added to the container of the current yup component
         * @param {*} content can be a yup component, html content or a DOM node
         * @return a new Yup component or null if the operation is not possible
         */
        addChild( content ) {
            if ( content instanceof Yup ) {
                return this.#setchild( content.yupid(), content );
            }

            const yupname = "yup" + ( this.#childid++ );
            let newNode = content;

            if ( typeof content == "string" ) {
                this.container().innerHTML += content;
                newNode = this.container().lastChild;
            }

            if ( newNode instanceof Node ) {
                const yup = new Yup( "yup" + ( this.#childid++ ), newNode );
                this.container().appendChild( yup.container() );
                this.#setchild( yupname, yup );
                return yup;
            }
            return null;
        }

        /**
         * Return a yup child by a name. This yup child has been added using the addChild method
         * @param {*} childName A Yup child
         * @returns A yup component
         */
        child( childName ) {
            return this.#children[ childName ];
        }

        /**
         * Message for the console including the current Yup id
         * @param {*} message Message for the console
         */
        log( message ) {
            console.log( `Yup[${this.#yupid}] => (${message})` );
        }

        #binder( func ) {
            const that = this;
            return function( ...args ) {
                args.push( that );
                func.apply( that, args );
            };
        }

        /**
         * Add a data value to the current model. if the repaint mode is true
         * then the paint method is automatically called after.
         * @param {*} data 
         * @param {*} repaintMode optional, by default is true
         */
        pushData( data, repaintMode ) {
            this.#model.push( data );
            if ( typeof repaintMode == "undefined" )
                repaintMode = true;
            if ( repaintMode ) {
                this.paint();
            }
        }

        /**
         * When a yup component produces a data, this data
         * can be sent to other yup components using this
         * method. 
         * component produce a data and any one can catch it
         * @param {*} name a data name
         * @param {*} value a data value
         */
        produce( name, value ) {
            Yupees.instance().fire( "data:" + name, value );
        }

        /**
         * When another yup component produces a data, this one
         * can be catched with this method.
         * @param {*} name a data name
         * @param {*} Handler a function for processing the value
         */
        consume( name, handler ) {
            Yupees.instance().listen( "data:" + name, handler );
        }

        #itemRenderer = null;

        /**
         * @param {*} renderFunction A function delegate for rendering each part of the model
         */
        renderer( itemRenderer ) {
            this.#itemRenderer = itemRenderer;
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
         * Paint this component adding a content to the current container.
         * When calling a pushData, this method is automatically called. The
         * renderer can be used for deciding how to paint the component.
         * @param html optional HTML string or HTML node if you didn't use the model
         */
        paint( html ) {

            // Active the actions before painting

            this.#actionStack.forEach( ( action ) => { action(); } );
            this.#actionStack.splice( 0,this.#actionStack.length );

            this.clean();

            if ( typeof html == "undefined" ) {                
                // Paint the model using the itemRenderer
                if ( this.#itemRenderer != null ) {
                    this.#model.forEach( ( item ) => this.#itemRenderer( this.#container, item ) );
                } else {
                    // Default painting
                    this.#container.innerHTML = `Default renderer for YUP {${this.#yupid}} with this model [${this.#model}]`;
                }
            } else {
                // Paint a content without using a model
                if ( html instanceof Node ) {    
                    this.#container.appendChild( html );
                } else
                    this.#container.innerHTML = html;
            }

            return this;
        }

        /**
         * Apply a CSS style to the current container
         * @param {*} values object with the css properties and values
         */
        style( values ) {
            for ( let property in values ) {
                this.#container.style[ property ] = values[ property ];
            }
            return this;
        }

        /**
         * Add a new DOM event listener to the current container
         * @param evt HTML event
         * @param handler HTML handler
         */
        event( evt, handler ) {
            this.#container.addEventListener( evt, this.#binder( handler ) );
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
         *  Change the container of this component relativly to the whole document
         *  This is the container used when calling the paint method.
         *  @param selector a CSS selector for choosing another container
         */
        into( cssselector ) {
            try {
                const node = document.querySelector( cssselector );
                if ( node != null ) {
                    this.#container = node;
                }
            } catch( error ) {
                console.log( `Invalid selector [${cssselector} / ${error.message}] ? using document.body` );
                this.#container = document.body;
            }
            return this;
        }

        /** 
         *  Update the container using an element id
         *  @param id unique identifier of the current html page as a new container
         */
        intoid( id ) {
            return this.into( "@" + id );
        }

        /**
         *  @deprecated use container()
         *   @return The HTML view for this component
         */
        getView() {
            return this.#container;
        }

        container() {
            return this.#container;
        }

        /**
         * Remove all the content of the container
         */
        clean() {
            const parentNode = this.#container;
            while ( parentNode.firstChild )
                parentNode.removeChild( parentNode.firstChild );
            return this;
        }

        /**
         * @param cssSelector CSS Selector
         * @return an array with all the HTML nodes depending on the CSSS selector
         */
        selectAll( cssSelector ) {
            return this.container().querySelectorAll( cssSelector );
        }

        /**
         * @param cssSelector CSS Selector
         * @return a node depending on the cssSelector
         */
        select( cssSelector ) {
            return this.container().querySelector( cssSelector );
        }

        yupid() {
            return this.#yupid;
        }
    }

    // --------------------------------------------------------------------------------------------------------------------

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

    // Check for data-yup attribute inside the current page

    function init_data_yup() {
        const nodes = document.querySelectorAll( "*" );
        for ( node of nodes ) {
            if ( node.hasAttribute( "data-yup" ) && node.id ) {
                $$.load( "yups/" + node.id, node );
            }
        }
    }

    ( () => {
        document.addEventListener( "DOMContentLoaded", () => {
            init_data_yup();
        } );
    } )();



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
        trace( "load", yupcomponent, params );
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
        trace( actionId, actions );
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
        trace( "fire", actionId, params );
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
        trace( "data", key, params );
        return $$;
    }

    $$.debugMode = () => {
        debugMode = !debugMode;
    }

    return $$;

} )( {} || $$ );
