/*
    Yup with a binding to the #part2 html element
    Author : Alexandre Brillant (https://github.com/AlexandreBrillant/)
 */

( () => {

    const yup = $$.start();
    yup.into( "#part2" );
    yup.paint( "<div>Content 2 !</div>" );

} )();