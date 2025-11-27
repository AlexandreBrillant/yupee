/* Yup component for painting all the node
   Author : Alexandre Brillant (https://github.com/AlexandreBrillant/)
*/

( () => {

    const yup = $$.start();

    // Set the renderer for the model of notes
    yup.renderer(
        ( model, container ) => {
            const notes = model.data( "notes" );
            notes.forEach( note => {
                const div = document.createElement( "DIV" );
                div.textContent = note;
                container.appendChild( div );
            });
    } );

    // Push a note inside the current model
    yup.consume( "note", ( note ) => yup.model().pushData( "notes", note ) );

} )();