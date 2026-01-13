/* 
    Yup component for managing actions for building a new note. It use the
    application model implemented in the main.js.
    Author : Alexandre Brillant (https://github.com/AlexandreBrillant/)
*/

( () => {

    const yup = $$.start();

    yup.event( "click",
            () => {
                $$.application.newNote();
            } );

    yup.paint( "<input type='button' value='Add a note' id='add'>" );

} )();
