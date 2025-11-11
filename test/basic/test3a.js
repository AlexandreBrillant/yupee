/*
    Yup Component with a binding to the #part1 html element
    Author : Alexandre Brillant (https://github.com/AlexandreBrillant/)
 */

( () => {

    const yup = $$.start();
    yup.into( "#part1" );
    yup.paint( "<div>Content 1 !</div>" );

} )();