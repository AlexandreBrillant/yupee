/*
    Yup Component with a binding to the #part1 html element
    Author : Alexandre Brillant (https://github.com/AlexandreBrillant/)
 */

( () => {

    const yup = $$.start();
    const color = yup.param( "color", "black" );
    yup.paint( "<div>Content 1 !</div>" ).style( { "color" : color } );

} )();