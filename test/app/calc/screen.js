/* Yup component for managing user actions of the calculator and display the result
   Author : Alexandre Brillant (https://github.com/AlexandreBrillant/)
*/

( () => {

    const yup = $$.start();
    yup.into( "#screenfield" );

    console.log( "Loading screen" );

    // Process event from the button

    const handleEvent = function( target, btnId ) {
        const screen = yup.getView();
        if ( "C" == btnId ) {
            screen.value = "0";
        } else {
            if ( btnId == "1/x" ) {
                screen.value = 1 / screen.value;
            } else
            if ( btnId == "x^2" ) {
                screen.value *= screen.value;
            } else
            if ( btnId == "=" ) {
                try {
                    screen.value = eval( screen.value );
                } catch( error ) {
                    screen.value = "Error";
                }
            } else {
                if ( screen.value == "0" )
                    screen.value = "";
                screen.value += btnId;
            }                
        }

    }

    // Listen for event from the buttons
    $$.listen( "btn", handleEvent );

} )();