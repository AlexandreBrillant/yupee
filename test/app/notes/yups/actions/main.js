/* Yup component for setting the application model
   Author : Alexandre Brillant (https://github.com/AlexandreBrillant/)
*/

( () => {

    const yup = $$.start();
    $$.application.initModel( { notes: []} );

    $$.application.newNote = () => {
        const note = prompt( "Your note" );
        if ( note ) {
            $$.application.model().data( "notes" ).push( note );
            $$.application.model().update();
        }
    };

    $$.application.removeNote = ( note ) => {
        const newNotes = $$.application.model().data( "notes" ).filter( n => n != note );
        $$.application.model().data( "notes", newNotes );
        $$.application.model().update();
    }

} )();