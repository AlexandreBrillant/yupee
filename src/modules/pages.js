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

    // Load a new page, save the current context before
    loadpage( page, keepContext = true ) {
        $$.fire( $$.KEYS.EVENT_LOAD_PAGE, page );        
        if ( keepContext ) this.saveContext();            
        Provider.instance().loadPage( page );
    }

    saveContext() {
        if ( $$.application.hasModel() ) {
            $$.fire( $$.KEYS.EVENT_BEFORE_SAVING_CONTEXT, this.#currentPage() );
            const wholeModel = $$.application.model();
            if ( wholeModel ) {
                const jsonModel = wholeModel.toJSON();
                this.savepage( null, jsonModel );
            }
        }
    }

    savepage( page, data ) {
        page = page || this.#currentPage();
        Provider.instance().writeData( page, data );
    }

    /**
     * Load all the data for a page name. This is useful
     * when you want to access data from another page
     * @param {*} page page name
     * @returns 
     */
    async loadPageData( page ) {
        page = page || this.#currentPage();
        return Provider.instance().readData( page );
    }

    async savePageData( page, data ) {
        this.savepage( page, data );
        return true;
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
                $$.fire( $$.KEYS.EVENT_INIT_PAGE, this.#currentPage() );
            } );
    }

}

