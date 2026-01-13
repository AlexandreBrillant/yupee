/**
 * This class is a tool for binding data value to a set of field inside the HTML content.
 * The goal of this class it to easily map the application data model to a set of fields.
 * @author Alexandre Brillant (https://github.com/AlexandreBrillant/)
 */
class Binder {
    static #singleton = null;
    static #singletonController = true;

    static instance() {
        if ( Binder.#singleton == null ) {
            Binder.#singletonController = false;
            Binder.#singleton = new Binder();
            Binder.#singletonController = true;
        }
        return Binder.#singleton;
    }

    constructor() {
        if ( Binder.#singletonController )
            throw new "Illegal usage for the Binder, use Binder.instance()";
    }

    #log( targetData ) {
        console.log( targetData );
    }

    #bindNode( node, targetData ) {
        const dataid = node.dataset.yupid;
        const name = node.nodeName;
        const that = this;

        switch( name ) {
            case "LABEL" :
                ( targetData[ dataid ] ) && ( node.textContent = targetData[ dataid] );
                break;
            case "TEXTAREA":
            case "INPUT" :
                if ( node.type == "text" || name == "TEXTAREA" ) {
                    targetData[ dataid ] && ( node.value = targetData[ dataid ] );
                    node.addEventListener( "input", ( e ) => {
                        targetData[ dataid ] = e.target.value;
                        that.#log( targetData );
                    } );
                } else
                if ( node.type == "checkbox" ) {
                    node.addEventListener( "change", (e) => {
                        targetData[ dataid ] = e.target.checked;
                    } );
                }
        }
    }

    bind( container, targetData ) {
        const nodeset = container.querySelectorAll( "*" );
        nodeset && nodeset.forEach( 
            ( node ) => {
                if ( node.dataset.yupid ) {
                    this.#bindNode( node, targetData );
                }
            }
        );
    }

}