/* Yup component for managing buttons of the calculator
   Author : Alexandre Brillant (https://github.com/AlexandreBrillant/)
*/

( () => {

    const yup = $$.start();

    // Generate event when clicking on a button with the button label for the screeen component
    const handleBtn = function( event ) {
        const action = event.target.textContent;
        yup.produce( "btn", action );
    }

    yup.selectAll( "div.btn").forEach( btn => {
        btn.addEventListener( "click", handleBtn );
    });

} )();

