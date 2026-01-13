/**
 * Resolve the data-yup attributes when the document is ready
 * @author Alexandre Brillant (https://github.com/AlexandreBrillant/)
 */
( () => {

    // Check for data-yup attribute inside the current page
    function resolve_yup_path( node ) {
        const yupid = node.dataset.yupid || node.getAttribute( "yupid" ) || node.id;
        // check for yupbase ancestor
        let parent = node.parentNode;
        let yupbase = "";
        while ( parent && ( parent != document ) ) {
            let tmpbase = parent.getAttribute( "yupbase" ) || ( parent.dataset && parent.dataset.yupbase );
            if ( tmpbase ) {
                !tmpbase.endsWith( "/" ) && ( tmpbase += "/" );
                yupbase = tmpbase + yupbase;
            }
            parent = parent.parentNode;
        }
        return yupbase + yupid;
    }

    function process_data_yup() {
        const nodes = document.querySelectorAll( "*" );
        for ( node of nodes ) {
            let path = null;
            // Try a delegate function
            if ( $$.pathResolver )
                path = $$.pathResolver( node );
            // Try the data-yup attribute value
            path = !path && ( node.dataset.yup );
            // Use the node id as a name for the yup component for empty data-yup attribute
            if ( !path && node.hasAttribute( "data-yup" ) ) {
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
