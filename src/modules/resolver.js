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
