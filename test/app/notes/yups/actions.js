/* Yup component for managing actions on the note application
   Author : Alexandre Brillant (https://github.com/AlexandreBrillant/)
*/

( () => {

    const yup = $$.start();

    // Share a model for the notes
    $$.data( "notes", [] );

    yup.event( "click",
            () => {
                let note = prompt( "Your note" );
                if ( note ) {
                    yup.produce( "note", note );
                }
    } );

    yup.paint( "<input type='button' value='Add a note' id='add'>" );

} )();
