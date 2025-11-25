/*
    Yup with a binding to the #part2 html element
    Author : Alexandre Brillant (https://github.com/AlexandreBrillant/)
 */

( () => {

    const yup = $$.start();
    const color = yup.param( "color", "black" );
    yup.paint( "<div>Content 2 !</div>" ).style( { "color" : color } );

} )();