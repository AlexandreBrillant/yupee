/*
    Yup with a binding to the #part3 html element
    Author : Alexandre Brillant (https://github.com/AlexandreBrillant/)
 */

( () => {

    const yup = $$.start();
    yup.newContainer( "#part2" );
    yup.paint( "<div>Content 2 !</div>" );

} )();
