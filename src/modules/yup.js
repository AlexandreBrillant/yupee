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
    #container
    #yupid
    #model;
    #childid = 1;
    #parent = null;

    constructor(yupid,params = null, config) {
        this.#yupid = yupid;

        if ( params ) {
            if ( params instanceof Node ) {
                this.#container = params;
            } else
            if ( params._into ) {
                this.#container = params._into;
                delete params._into;
            }
        }

        // Force an empty container with an id
        if ( !this.#container ) {
            this.#container = document.createElement( "DIV" );
            yupid && ( this.#container.id = yupid );
        }

        // Required a container so after
        if ( params ) {
            for ( const key in params ) {
                if ( typeof params[ key ] == "string" ) 
                    this.#container.setAttribute( key, params[ key ] );
            } 
        }

        if ( config ) {
            const { model, renderer, template, container } = config;
            model && this.model( model );
            renderer && this.renderer( renderer );
            template && ( this.#template = template );
            container && ( this.#container = container );
        }

        // Use the application model by default
        !this.#model && $$.application.model() && this.model( $$.application.model() );
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
        !yup.container().parentNode && this.container().appendChild( yup.container() );  
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
        let yupcontainer;

        if ( content instanceof Yup ) {
            yupid = content.yupid();
            return this.#setchild( yupid, content );
        } else            
        if ( typeof content == "string" || content.html ) {
            this.container().insertAdjacentHTML( "beforeend", content.html || content );
            yupcontainer = this.container().lastChild;
        } else
        if ( content.node || content instanceof Node ) {
            yupcontainer = content.node || content;
        } else {
            let { selector } = content;
            selector = selector || content.select;  // try "select" attribute rather
            if ( selector ) {
                yupcontainer = this.container().querySelector( selector );
            }
        }

        if (!yupcontainer) {
            this.trace( "Invalid addChild parameter no container ?" );
            this.trace( content );
            return null;
        }

        !yupid && ( yupid = content.yupid );    // Specific id provided by the content
        !yupid && ( yupid = yupcontainer.id );   // Use the id per default
        !yupid && ( yupid = this.#generate_newid() );

        const yup = new Yup( yupid, yupcontainer );

        content.click && yup.click( content.click );
        
        return this.#setchild( yupid, yup );
    }

    /**
     * @param { selector, click } CSS selector for finding all the children nodes from the current container, click is optional for managing the click event
     * @returns an array of the new yup component children
     */
    addChildren( { select, selector, click } ) {
        const yups = [];
        const lst = this.#container.querySelectorAll( select || selector );
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
        if ( this.container() instanceof DocumentFragment ) {
            const fragment = this.container();
            while ( fragment.firstChild ) {
                parent.container().removeChild( fragment.firstChild );
            }
        } else {
            // Check for a valid parent
            if ( this.container().parentNode == parent.container() )
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
            if ( this.container().hasAttribute( paramKey ) )
                return this.container().getAttribute( paramKey );
            return defaultValue;
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
                    this.#modelRenderer( { model:this.model(), container:this.container(), template:this.template(), flags:html.flags} );
                } else {
                    if ( $$.application.renderer ) {
                        this.clean();
                        $$.application.renderer( { model:this.model(), container:this.container(), template:this.template(), flags:html.flags } );
                    }
                }
            }
        } else {

            // Paint a content without using a model
            if ( html instanceof Node ) {   
                this.clean(); 
                this.#container.appendChild( html );
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
                    this.#container.appendChild( this.#buffer.firstChild );
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
     * Manage a click for this yup component or a click for a yup child. It avoids to use the event method.
     * @param {*} childname Optional for applying this click event only on a child by this name
     * @param {*} handler Function for managing a click or "auto" for producing a data with the yupid value
     */
    click( childname, handler ) {
        if ( typeof childname == "function" ) {
            this.event( "click", childname );
        } else {
            if ( typeof childname == "string" ) {
                let child = this.child( childname );
                if ( child == null ) {
                    if ( childname == $$.KEYS.AUTO_HANDLER ) {
                        child = this;
                        handler = $$.KEYS.AUTO_HANDLER;
                    } else {
                        this.trace( "click : Unknown child " + childname );
                        return;
                    }
                }
                if ( handler == $$.KEYS.AUTO_HANDLER ) {
                    child.event( "click", () => {
                        child.produce( $$.KEYS.EVENT_YUPID, child.yupid() );
                    } );
                } else
                    child.event( "click", handler );
            }
        }
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
                    oldattributes = this.container().attributes;
                }
                this.#container = node;
                if ( oldattributes ) {
                    for ( const att of oldattributes ) {
                        this.param( att );
                    }
                }
            }
        } catch( error ) {
            this.trace( `Invalid selector [${cssselector} / ${error.message}] ? using document.body` );
            this.#container = document.body;
        }
        return this;
    }

    /**
     * @returns The visual container of this component, it can be an HTML part
     */
    container() {
        return this.#container;
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
        // DOM cleaning too
        while ( this.container().firstChild )
            this.container().removeChild( this.container().firstChild );
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
        if ( typeof content == "undefined" )
            return this.container().value;
        else
            this.container().value = content;
    }
}