/*
    NoRComponent with a binding to the #part3 html element
    Author : Alexandre Brillant (https://github.com/AlexandreBrillant/)
 */

( () => {

    const yup = $$.start();
    yup.into( "#part3" );
    yup.paint( "<div>Content 3 !</div>" );

} )();