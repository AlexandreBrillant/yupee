/*
    Yup component with two listeners for the click event 
    Author : Alexandre Brillant (https://github.com/AlexandreBrillant/)
 */

( () => {

    // Start the yup component and get a reference to the yup component
    const yup = $$.start();

    // With arrow functions
    yup.event(
        "click",
        () => { 
            yup.style( { color : "red" } );
        }        
    );

    // Or with standard functions
    yup.event(
        "click",
        function() { 
            yup.style( { fontWeight : "bold" } );
        } 
    );

    // Paint the yup component
    yup.paint( "<div>Click here for Bold and Red</div>" );

} )();