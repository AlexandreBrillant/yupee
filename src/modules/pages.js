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

