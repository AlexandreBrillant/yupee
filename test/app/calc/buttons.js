/* Yup component for managing buttons of the calculator
   Author : Alexandre Brillant (https://github.com/AlexandreBrillant/)
*/

( () => {

    const yup = $$.start();

    yup.into( "#buttons" );

    // Generate event when clicking on a button with the button label for the screeen component
    const handleBtn = function( event ) {
        const action = event.target.textContent;
        $$.fire( "btn", action );
    }

    yup.selectAll( "div.btn").forEach( btn => {
        btn.addEventListener( "click", handleBtn );
    });

} )();

