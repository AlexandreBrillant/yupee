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
            // We use nor here
            yup.getView().style.color = "red";
        }        
    );

    // With standard functions
    yup.event(
        "click",
        function() { 
            yup.getView().style.fontWeight = "bold";
        } 
    );

    yup.action( function() {
        // We display the current component
        console.log( yup );
    });

    // Paint the yup component
    yup.paint( "<div>Click here for Bold and Red</div>" );

} )();