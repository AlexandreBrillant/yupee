/* Yup component for painting all the notes produced by the actions component
   Author : Alexandre Brillant (https://github.com/AlexandreBrillant/)
*/

( () => {

    const yup = $$.start();

    // Set a renderer for the model of notes
    yup.renderer(
        ( { model, container } ) => {
            const notes = model.data( "notes" );
            notes.forEach( note => {
                yup.addChild( "<div>" + note + " <button>-</button></div>" ).addChild( { "select" : "button" }).click( () => $$.application.removeNote( note ) );
            });
    } );

} )();