/* 
    Yup component for producing new notes. The notes component will display it
    Author : Alexandre Brillant (https://github.com/AlexandreBrillant/)
*/

( () => {

    const yup = $$.start();

    yup.event( "click",
            () => {
                let note = prompt( "Your note" );
                if ( note ) {
                    yup.produce( "note", note );
                }
    } );

    yup.paint( "<input type='button' value='Add a note' id='add'>" );

} )();
