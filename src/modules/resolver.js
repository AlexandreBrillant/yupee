/**
 * Resolve the data-yup attributes when the document is ready
 * @author Alexandre Brillant (https://github.com/AlexandreBrillant/)
 */
( () => {

    // Check a yupbase attribute from the current node to the document parent
    function yup_base( node ) {
        let yupbase = "";        
        while ( node && ( node != document ) ) {
            let tmpbase = node.getAttribute( "yupbase" ) || ( node.dataset && node.dataset.yupbase );
            if ( tmpbase ) {
                !tmpbase.endsWith( "/" ) && ( tmpbase += "/" );
                yupbase = tmpbase + yupbase;
            }
            node = node.parentNode;
        }
        if ( yupbase ) {
            ( !yupbase.endsWith( "/" ) ) && ( yupbase += "/" );
        }
        if ( !yupbase )
            yupbase = "yups/";
        return yupbase;
    }

    // Check for data-yup attribute inside the current page
    function resolve_yup_id( node ) {
        return node.dataset.yupid || node.getAttribute( "yupid" ) || node.id;
    }

    function process_data_yup() {
        const nodes = document.querySelectorAll( "*" );
        for ( node of nodes ) {
            if ( node.hasAttribute( "data-yup" ) || node.hasAttribute( "yup" ) ) {
                // Try a delegate function
                if ( $$.pathResolver )
                    path = $$.pathResolver( node );
                else {
                    path = ( node.dataset.yup || node.getAttribute( "yup" ) ) || resolve_yup_id( node );
                    path = path && ( yup_base( node ) + path );
                }
                if ( path ) {
                    $$.load( path, { "_into" : node } );
                }
            }
        }
    }

    document.addEventListener( "DOMContentLoaded", () => {
        process_data_yup();
    } );
} )();
