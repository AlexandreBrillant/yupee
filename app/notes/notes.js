/* Yup component for painting all the node
   Author : Alexandre Brillant (https://github.com/AlexandreBrillant/)
*/

( () => {

    const yup = $$.start();

    yup.into( "#notes" );

    function repaint( notes ) {
        let htmlNotes = "";
        notes.forEach( note => {
            htmlNotes += ( "<div>" + note + "</div>" );
        });
        yup.paint( htmlNotes );
    }

    $$.listen( "repaint", () => {
        repaint( $$.data( "notes" ) );
    } );

} )();