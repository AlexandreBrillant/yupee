/*
    Yup component managing a counter
    Author : Alexandre Brillant (https://github.com/AlexandreBrillant/)
 */

( () => {

    // Start the yup component and keep the reference inside the Yup 
    const yup = $$.start();

    const e = document.createElement( "div" );
    e.appendChild( document.createTextNode( "Here a new dynamic content, we can count now" ) );

    yup.paint( e );

    let count = 1;

    // repaint every 1s with the counter

    setInterval( 
        () => {
            yup.paint( `<div>${count}</div>` );
            count++;
        }, 1000 
    );

} )();