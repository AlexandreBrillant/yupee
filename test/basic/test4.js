/*
    NoRComponent with a binding to the #part3 html element
    Author : Alexandre Brillant (https://github.com/AlexandreBrillant/)
 */

( () => {

    const yup = $$.start();
	yup.into( "body" );
    const message = yup.param( "message", "bye bye world..." );
    const color = yup.param( "color", "black" );

    yup.paint( `<div>${message}</div>` ).style( { "color" : color, "font-weight" : "bold" } );

} )();