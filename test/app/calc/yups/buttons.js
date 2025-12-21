/* Yup component for managing buttons of the calculator
   Author : Alexandre Brillant (https://github.com/AlexandreBrillant/)
*/

( () => {

    const yup = $$.start();
    yup.addChildren( { select : "div.btn", click : $$.KEYS.AUTO_HANDLER } );

} )();

