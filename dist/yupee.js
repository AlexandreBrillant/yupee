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

/**
 * Inner function for tracing the main action
 * @param {*} actionId an actionId key
 * @param  {...any} params a set of values to trace
 */
function _trace( actionId, ...params ) {
    if ( debugMode ) {
        const paramstr = params.join( "," );
        const log = `** [${actionId}] ** ${paramstr}`
        if ( traceMode == $$.KEYS.DEBUG_CONSOLE ) {
            console.log( log );
        }
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

/**
 * Inner function for critial action, the application must stopped.
 * For sample a component cannot be loaded, the application's behavior becomes
 * undetermined.
 * 
 * It may use an alert popup calling the $$.alert method. User can update it
 * 
 * @param {*} actionId 
 * @param  {...any} params 
 */
function _criticalError( actionId, ...params ) {
    const paramstr = params.join( "," );
    const log = `Critical Error [${actionId}] ** ${paramstr}`;
    $$.alert && $$.alert( log );
    console.log( log );
    console.log( new Error().stack );
}

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
            this.fire( $$.KEYS.EVENT_READY );   // Ready event
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


/**
 * A Yup model manages data for a Yup component. A Yup component can only have one Yup model, but a 
 * yup model can be for multiple Yup component
 */
class YupModel {
    #content = {};
    #yups = [];

    constructor( content ) {
        content && ( this.#content = content );
    }

    /**
     * Force a new model content
     * @param newContent 
     */
    reset( newContent ) {
        this.#content = newContent;
    }

    #submodels = {};

    /**
     * Create a sub model for this model. It means with the majorkey argument, all the
     * sub model will work only with this majorkey sub object. This is useful for avoiding
     * to share all the model, by only a subset to a Yup component.
     * @param {*} majorKey 
     */
    subModel( majorKey ) {
        if ( this.#submodels[ majorKey ] ) {
            return this.#submodels[ majorKey ];
        }
        !this.#content[majorKey] && ( this.#content[majorKey] = {} );
        const submodel = new YupModel( this.#content[majorKey] );
        this.#submodels[ majorKey ] = submodel;
        return submodel;
    }

    // For inner usage
    _addYup( yupcomponent ) {
        this.#yups.push( yupcomponent );
    }

    // For inner usage
    _removeYup( yupcomponent ) {
        const index = this.#yups.indexOf( yupcomponent );
        index > -1 && this.#yups.splice( index, 1 );
    }

    /**
     * Add data for an array of the current model. A key is required
     * @param {*} key The key for the datamodel
     * @param {*} data The data to be pushed
     * @param {*} update "false" by default to update all the Yup components using this model
     */
    pushData( key, data, update = false ) {
        this.#content[key] = this.#content[key] ?? [];
        this.#content[key].push( data );
        if ( update ) {
            this.update( key );
        }
    }

    /** Notify to all the Yup component using this model to repaint 
     *  @param flags optional for all the renderers, it can be used for optimization
     *  @param includeSubModel "false" by default, if true then the update contains also the sub models
     */
    update( flags, includeSubModel = false ) {
        this.#yups.forEach( yup => yup.paint( { flags }) );
        if ( includeSubModel && this.#submodels ) {
            for ( const key in this.#submodels ) {
                this.#submodels[ key ].update( flags, includeSubModel );
            }
        }
    }

    /**
     * Read or Write a data inside this current model. By default it will ask to all the concerned yup components to repaint
     * @param {*} key A key for this data, no key for gettong all the model content
     * @param {*} value Optional value to write
     * @param {*} update "false" By default to update all the Yup component using this model
     * @returns a data value
     */
    data( key, value, update = false ) {
        if ( typeof key == "undefined" )
            return this.#content;
        if ( !value ) {
            return this.#content[ key ];
        }
        this.#content[ key ] = value;
        if ( update )
            this.update( key );
        return value;
    }

    /**
     * Trace to the console the content of this model
     */
    dump() {
        console.log( "*** Start Dump Model ***")
        console.log( this.#content );
        this.#yups.forEach(
            yup => console.log( "-> Yup user [" + yup.yupid() + "]" ) );
        
        console.log( "*** End Dump Model ***")
    }

    /**
     * Convert data model object to a JSON string
     */
    toJSON() {
        return JSON.stringify( this.#content );
    }

    /**
     * Update all the data of this model using a JSON String
     * @param jsonStr 
     */
    fromJSON(jsonStr) {
        this.#content = JSON.parse( jsonStr );
    }

}

/**
* This is the class for managing the container of the Yup component, it adds tools
* for managing the DOM. It can be considered as a Proxy for a DOM node.
*
* @author Alexandre Brillant (https://github.com/AlexandreBrillant/)
*/

class YupContainer {
    #$

    constructor( node ) {
        this.#$ = node;
    }

    /**
     * @param newContainer optional value for updating the dom node of this container
     * @returns The DOM node
     */
    node( newContainer ) {
        newContainer && ( this.#$ = newContainer );
        return this.#$;
    }

    /**
     * @returns The DOM ID
     */
    id( newId ) {
        newId && ( this.#$.id = newId );
        return this.#$.id;
    }

    /**
     * Set attribute of the DOM node
     * @param {*} key 
     * @param {*} value 
     */
    setAttribute( key, value ) {
        this.#$.setAttribute( key, value );
    }

    /*** 
     * "data-key" is managed in the same way as "key"
     * @param {*} key 
     * @returns an attribute or a dataset
     */
    getAttribute( key ) {
        return this.#$.dataset[ key ] || this.#$.getAttribute( key );
    }

    /**
     * Has attribute for the key or a data-key attribute
     * @param {*} key 
     * @returns 
     */
    hasAttribute( key ) {
        return ( key in this.#$.dataset ) || this.#$.hasAttribute( key );
    }

    attributes() {
        return this.#$.attributes;
    }

    /**
     * @returns The DOM parent node
     */
    parentNode() {
        return this.#$.parentNode;
    }

    /**
     * Check if the container is a parent of this one
     * @param {*} container a Yup Container
     */
    isParent( container ) {
        return container.node() == this.parentNode();
    }

    lastChild() {
        return this.#$.lastChild;
    }

    appendChild( newChild ) {
        if ( newChild instanceof YupContainer ) {
            newChild = newChild.node();
        }
        if ( typeof newChild == "string" ) {
            this.#$.insertAdjacentHTML( "beforeend", newChild );
        } else
        this.#$.appendChild( newChild );
    }

    /**
     * Remove a child
     * @param {*} child can be a DOM node or a YupContainer
     */
    removeChild( child ) {
        if ( child instanceof YupContainer ) {
            child = child.node();
        }
        this.#$.removeChild( child );
    }

    querySelector( selector ) {
        return this.#$.querySelector( selector );
    }

    querySelectorAll( selector ) {
        // Work for the whole document rathen than this container
        let finalContainer = this.#$;
        if ( selector.startsWith( "/" ) ) {
            finalContainer = document;
            selector = selector.substring( 1 );
        }
        return finalContainer.querySelectorAll( selector );
    }

    style( values ) {
        for ( let property in values ) {
            this.#$.style[ property ] = values[ property ];
        }
        return this;
    }

    event( evt, handler ) {
        this.#$.addEventListener( evt, handler );
    }

    textContent() {
        return this.#$.textContent;
    }

    value(content) {
            if ( typeof content == "undefined" )
            return this.#$.value;
        else
            this.#$.value = content;
    }

    hasClass( className ) {
        return this.#$.classList.contains( className );
    }

    addClass( className ) {
        !this.#$.classList.contains( className ) && this.#$.classList.add( className );
        return this;
    }

    removeClass( className ) {
        this.#$.classList.remove( className );
        return this;
    }

    /**
     * Clean the DOM content
     */
    clean() {
        while ( this.#$.firstChild )
            this.#$.removeChild( this.#$.firstChild );
    }
}
/**
 * A Yup component is an instance of the Yup class. It can be stored as an external file using the data-yup attribute for the file location.
 *
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
    #$
    #yupid
    #model;
    #childid = 1;
    #parent = null;

    constructor( { yupid, model, renderer, template, container, params } ) {
        this.#yupid = yupid;

        if ( params ) {
            if ( params instanceof Node ) {
                this.#$ = new YupContainer( params );
            } else
            if ( params._into ) {
                this.#$ = new YupContainer( params._into );
                delete params._into;
            }
        }

        // Force an empty container with an id
        if ( !this.#$ ) {
            this.#$ = new YupContainer( document.createElement( "DIV" ) );
            yupid && ( this.#$.id( yupid ) );
        }

        // Required a container so after
        if ( params ) {
            for ( const key in params ) {
                if ( typeof params[ key ] == "string" ) 
                    this.#$.setAttribute( key, params[ key ] );
            } 
        }

        model && this.model( model );
        renderer && this.renderer( renderer );
        template && ( this.#template = template );
        container && ( this.#$ = new YupContainer( container ) );

        // Use the application model by default
        !this.#model && $$.application.hasModel() && this.model( $$.application.model() );
    }

    // Children by name
    #children = {};
    // Children list
    #childrenLst = [];

    #generate_newid() {
        return "yup" + ( this.#childid++ );
    }

    // Inner usage
    #setchild( name, yup ) {
        yup.#parent = this;
        this.#children[ name ] = yup;
        this.#childrenLst.push( yup );
        // Connect the DOM here for no parent only
        !yup.container().parentNode() && this.container().appendChild( yup.container() );  
        return yup;
    }

    /**
     * Add a new child inside this Yup component.The container of the new child will be added to the container of the current yup component.
     * Example :
     * addChild( "<div>...</div>" );
     * addChild( mynode );
     * addChild( { yupid:..., html: "<div></div>" });
     * addChild( { yupid:..., node: mynode });
     * addChild( { yupid:..., selector : "div.button#v1" });
     * addChild( { yupid:..., select : "div.button#v1" });
     * addChild( { yupid:..., html:"<div></div>", click:()=>{}} )
     * 
     * If no yupid is present, then the id of the child container is used, if no present a counter is used
     * 
     * @param content can be a yup component, HTML content, a DOM node, an Object { yupid:..., html:..., node:..., selector:... }
     * @return a new Yup component or null if the operation is not possible (look at the trace for the reason)
     */
    addChild( content ) {
        let yupid;
        let container;

        if ( content instanceof Yup ) {
            yupid = content.yupid();
            return this.#setchild( yupid, content );
        } else            
        if ( typeof content == "string" || content.html ) {
            this.container().appendChild( content.html || content );
            container = this.container().lastChild();
        } else
        if ( content.node || content instanceof Node ) {
            container = content.node || content;
        } else {
            let { selector } = content;
            selector = selector || content.select;  // try "select" attribute rather
            if ( selector ) {
                container = this.container().querySelector( selector );
            }
        }

        if (!container) {
            this.trace( "Invalid addChild parameter no container ?" );
            this.trace( content );
            return null;
        }

        !yupid && ( yupid = content.yupid );    // Specific id provided by the content
        !yupid && ( yupid = ( container.id || container.dataset.yupid || container.getAttribute( "yupid" ) ) );   // Use the id per default   // Use the id per default
        !yupid && ( yupid = this.#generate_newid() );

        const yup = Factory.instance().newYup( { yupid, container } );

        content.click && yup.click( content.click );
        
        return this.#setchild( yupid, yup );
    }

    /**
     * @param { selector, click } CSS selector for finding all the children nodes from the current container, click is optional for managing the click event
     * @returns an array of the new yup component children
     */
    addChildren( { select, selector, click } ) {
        const yups = [];
        const lst = this.#$.querySelectorAll( select || selector );
        lst && lst.forEach( 
            ( node ) => {
            yups.push( this.addChild( { node, click } ) );
        } );
        return yups;
    }

    // Clean all the reference to this child
    #removeChildReference( child ) {
        const id = this.yupid();
        id && delete this.#children[ id ];
        const index = this.#childrenLst.indexOf( child );
        index > -1 && this.#childrenLst.splice( index, 1 );
    }

    /** 
     * Remove this Yup component. It updates if requires the parent and the DOM content */
    remove() {
        // Remove all the references
        this.#model && ( this.#model._removeYup( this ) );
        const parent = this.parent();
        parent.#removeChildReference( this );

        // DOM update
        if ( this.container().node() instanceof DocumentFragment ) {
            const fragment = this.container().node();
            while ( fragment.firstChild ) {
                parent.container().removeChild( fragment.firstChild );
            }
        } else {
            // Check for a valid parent
            if ( this.container().isParent( parent.container() ) )
                parent.container().removeChild( this.container() );
        }
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
     * @returns The number of children
     */
    childCount() {
        return this.#childrenLst.length;
    }

    /* 
    * @param index The index of the children
    * @returns A yup component child
    */
    childAt( index ) {
        return this.#childrenLst[ index ];
    }

    

    /**
     * @returns A Yup parent or null for the root yup component
     */
    parent() {
        return this.#parent;
    }

    /**
     * Message for the console including the current Yup id
     * @param {*} message Message for the console
     */
    trace( message ) {
        _trace( `Yup[${this.#yupid}] => (${message})` );
    }

    #binder( func ) {
        const that = this;
        return function( ...args ) {
            args.push( that );
            func.apply( that, args );
        };
    }

    /**
     * Return the current model or create a new one
     * @param newmodel Optional value for setting a new model for this Yup component
     * @returns The current model of this Yup component
     */
    model( newmodel ) {
        if ( newmodel ) {
            // Remove the previous one
            if ( this.#model ) {
                this.#model._removeYup( this );
            }
            newmodel._addYup( this );
            this.#model = newmodel;
        }
        if ( !this.#model ) {
            return this.model( new YupModel() );
        }
        return this.#model;
    }

    /**
     * Add a data value to the current model. if the repaint mode is true
     * then the paint method is automatically called after. Note that it will
     * automatically add a items key inside the current model
     * @param {*} data 
     * @param {*} repaintMode optional if you don't want to run a repaint of the Yup component
     */
    pushData( data, repaintMode ) {
        this.model().pushData( "items", data, repaintMode );
    }

    /**
     * When a yup component produces a data, this data
     * can be sent to other yup components using this
     * method. 
     * A component "produce" a data and any one can catch it using "consume"
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

    #modelRenderer = null;

    /**
     * Read or Write a renderer for this model
     * @param modelRenderer A optional delegate function for rendering the current model
     * @returns The current model
     */
    renderer( modelRenderer ) {
        if ( !this.#modelRenderer )
            this.#modelRenderer = modelRenderer;
        return this.#modelRenderer;
    }

    /**
     * Read/Write a parameter when using the $$.load method
     * @param {*} paramKey a key name for reading or a litteral object { name, value } for writing
     * @param {*} defaultValue Default value if the parameter is unknown
     * @return the parameter value or the default value
     */
    param( paramKey, defaultValue ) {
        if ( typeof paramKey == "string" ) {
            const attValue = this.container().getAttribute( paramKey );
            return attValue || defaultValue;
        } else {
            const { name, value } = paramKey;
            if ( name && value ) {
                if ( !this.container().hasAttribute( name ) ) {
                    this.container().setAttribute( name, value );
                }
            }
            return this;
        }
    }

    #template = null;

    /**
     * A template is provided as a parameter name "data-template" or "template" to the HTML container.
     * 
     * @param Optional values is an object with a set of key/value, this is used for resolving the template parameter
     * @return a template for this component
     */
    template( values ) {
        let content = null;
        const templateName = this.param( "data-template" ) || this.param( "template" ) || this.#template;
        if ( templateName ) {
            content = $$.application.templates[ templateName ];
            content && ( content = this.#resolveTemplate( content, values ) );
        }
        return content;
    }

    #resolveTemplate( content, values ) {
        return content.replace( /{(\w+)}/g,
            ( match, param ) => values[ param ] || "" );
    }

    #buffer = null;

    /**
     * Paint this component adding a content to the current container.
     * The container is automatically cleaned before adding a content.
     * When calling a pushData, this method is automatically called. The
     * renderer can be used for deciding how to paint the component.
     * @param html optional HTML string or HTML DOM node if you didn't use a model/renderer
     */
    paint( html ) {
        if ( typeof html == "undefined" || ( typeof html == "object" && "flags" in html ) ) {
            // Paint the model using the modelRenderer
            if ( this.#model ) {
                if ( this.#modelRenderer ) {
                    this.clean();
                    this.#modelRenderer( { model:this.model(), container:this.container().node(), template:this.template(), flags:html.flags} );
                } else {
                    if ( $$.application.renderer ) {
                        this.clean();
                        $$.application.renderer( { model:this.model(), container:this.container().node(), template:this.template(), flags:html.flags } );
                    }
                }
            }
        } else {

            // Paint a content without using a model
            if ( html instanceof Node ) {   
                this.clean(); 
                this.#$.appendChild( html );
            } else {
                if ( typeof html == "object" )
                    html = this.template( html );
            }

            if ( typeof html == "string" ) {
                this.clean();
                // Use a buffer for the document fragment usage
                ( !this.#buffer && ( this.#buffer = document.createElement( "DIV" ) ) );
                this.#buffer.innerHTML = html;
                while ( this.#buffer.firstChild ) {
                    this.#$.appendChild( this.#buffer.firstChild );
                }
            }
        }

        return this;
    }

    /**
     * Apply a CSS style to the current container
     * @param {*} values object with the css properties and values
     */
    style( values ) {
        this.#$.style( values );
        return this;
    }

    /**
     * Add a new DOM event listener to the current container
     * @param evt HTML event
     * @param handler HTML handler
     */
    event( evt, handler ) {
        this.#$.event( evt, this.#binder( handler ) );
        return this;
    }

    /**
     * Manage a click for this yup component or a click for a yup child. It avoids to use the event method.
     * If using $$.KEYS.AUTO_HANDLER, it will generate a default handler producing an event $$.KEYS.EVENT_YUPID with
     * the current id. Thus you can catch using the consume method.
     * 
     * @param {*} handler Function for managing a click or "auto" for producing a data with the yupid value
     */
    click( handler ) {
        if ( handler == $$.KEYS.AUTO_HANDLER ) {
            handler = this.#binder( function() {
                this.produce( $$.KEYS.EVENT_YUPID, this.yupid() );
            } );
        }
        this.event( "click", handler );
    }

    /** 
     *  Update the container of this component relativly to the whole document
     *  This is the container used when calling the paint method.
     *  @param selector a CSS selector for choosing another container
     *  @param keepparams False by default, duplicate the previous attributes to the new container
     */
    newContainer( cssselector, keepparams = false ) {
        try {
            const node = document.querySelector( cssselector );
            if ( node != null ) {
                let oldattributes = null;
                if ( keepparams ) {
                    oldattributes = this.container().attributes();
                }
                this.#$.node( node );
                if ( oldattributes ) {
                    for ( const att of oldattributes ) {
                        this.param( att );
                    }
                }
            }
        } catch( error ) {
            this.trace( `Invalid selector [${cssselector} / ${error.message}] ? using document.body` );
            this.#$.node( document.body );
        }
        return this;
    }

    /**
     * use container().node() for getting the DOM node
     * @returns An object managing the container of this component.
     */
    container() {
        return this.#$;
    }

    /**
     * Remove all the content of the container
     */
    clean() {
        // No Yup child, only remove DOM nodes
        if ( !this.childCount() ) {
            const parentNode = this.container();
            while ( parentNode.firstChild )
                parentNode.removeChild( parentNode.firstChild );
        } else {
            while ( this.childCount() ) {
                this.childAt( 0 ).remove();
            }
        }

        this.container().clean();
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

    /**
     * @return the unique id for this yup component
     */
    yupid() {
        return this.#yupid;
    }

    /**
     * Show the current yup component by setting a display style to "block" to the container
     * @param displayMode is an optional parameter, the default value is "block"
     */
    show( displayMode = "block" ) {
        this.style( { display : displayMode } );
    }

    /**
     * Hide the current yup component by setting a display style to none to the container
     */
    hide( displayMode = "none" ) {
        this.style( { display : displayMode } );
    }

    value(content) {
        return this.container().value( content );
    }
}
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

    newModel( config = {} ) {
        return new ( config.class || $$.yupModelClass || YupModel )( config );
    }

    newDriver( config = {} ) {
        if ( config.class || $$.driverClass )    
            return new ( config.class || $$.driverClass );
        return $$.driver;
    }
}
/**
 * This is the main function of Yupee
 * It is called both for loading Yup components and for managing each one
 * @author Alexandre Brillant (https://github.com/AlexandreBrillant/)
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
/**
 * Resolve the data-yup attributes when the document is ready
 * @author Alexandre Brillant (https://github.com/AlexandreBrillant/)
 */
( () => {
    // Check for data-yup attribute inside the current page
    function resolve_yup_path( node ) {
        const t = [];
        while ( node ) {
            if ( node.nodeType == Node.ELEMENT_NODE && node.hasAttribute( "data-yup" ) ) {
                const yupid = node.dataset.yupid || node.getAttribute( "yupid" ) || node.id;
                yupid && t.unshift( yupid );
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
 * Class for switching between several pages keeping the current context
 * @author Alexandre Brillant (https://github.com/AlexandreBrillant/)
 */
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

    #currentPage() {
        const current = window.location.pathname.split('/').pop();
        const page = current.split( "." )[ 0 ]; // Only the prefix
        return document.body.dataset.page || document.body.getAttribute( "page" ) || page;
    }

    loadpage( page, keepContext = true ) {
        if ( keepContext && $$.application.hasModel() ) {
            // Store the application model
            const wholeModel = $$.application.model();
            if ( wholeModel ) {
                const jsonModel = wholeModel.toJSON();
                Provider.instance().writeData( this.#currentPage(), jsonModel );
            }
        }
        Provider.instance().loadPage( page + "/main.html" );
    }

    /**
     * Call when all the yup component has been loaded for
     * restoring the state of the page
     */
    init() {
        Provider.instance().readData( this.#currentPage() ).then( 
            ( value ) => {
                const wholeModelData = JSON.parse( value );
                wholeModelData && $$.application.initModel( wholeModelData ).update();
            } );
    }
}


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
        Pages.instance().init();    // restore the data model if required
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
        YupModel : YupModel
    }

    /**
     * This is a function for critical message.
     * By default a popup is displayed. User can update this behevior.
     * @param msg 
     * @returns 
     */
    $$.alert = ( msg ) => alert( msg );

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

    return $$;

} )( {} || $$ );
