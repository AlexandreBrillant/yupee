# Yupee

Yupee is an open-source JavaScript library for building modular web applications. 

[View Yupee on Github](https://github.com/AlexandreBrillant/yupee)

It works with external **Yup component** files. A Yup component is a standard JavaScript file that starts by calling the **$$.start** function.

 ### Benefits of Using Yupee :

- No server required.
- Works locally.
- Very simple and uses only standard JavaScript.
- Released under the MIT License for any usage.

## Hello World

Here a very simple example (**helloworld.html**)

```html
 <!DOCTYPE html>
 <html>
   <head>
       <script src="../src/yupee.js"></script>
       <script>$$.load( "test1" );</script>
   </head>
   <body>
   </body>
  </html>
```
This page loads the **yupee.js** library. You can use also the **yupee.min.js** for better loading performance. The following instruction loads a simple Yup component located in the current directory (relative to the html page) from the **test1.js** file.

```javascript
$$.load( "test1" )
```

Here now the content of the Yup component

```javascript
 ( () => {
    
    const yup = $$.start();
    yup.paint( "<div>Hello world</div>" );
 
  } )();
```

The first instruction gets access to the current Yup component by calling **$$.start()**. To render the Yup component, simply call the **paint** method. By default, the **paint** method works inside the body of the HTML page. 

The end user will see only "Hello World" when loading the **helloworld.html** page.

## Loading a Yup component Anywhere in the HTML page

In this example, we load 3 yup components (**test3a**, **test3b** and **test3c**$). Each component will renderer in a different part of the HTML page.

```html
<html>
    <head>
        <script src="../src/yupee.js"></script>
        <script>$$.load( "test3c" );</script>
        <script>$$.load( "test3b" );</script>
        <script>$$.load( "test3a" );</script>        
    </head>

    <body>

        <div>Starting zones</div>

        <div id="part1"></div>

        <div id="part2"></div>

        <div id="part3"></div>

        <div>Stopping zones</div>

    </body>

</html>
```

In each Yup component, we will define first the part of the HTML that will be rendered. The **into** method gets a CSS selector for choosing the container location of the Yup component.

Here is the content of the test3a.js component:

### test3a

```javascript
( () => {

    const yup = $$.start();
    yup.into( "#part1" );
    yup.paint( "<div>Content 1 !</div>" );

} )();
```

Here is the content of the test3b.js component:

### test3b

```javascript
( () => {

    const yup = $$.start();
    yup.into( "#part2" );
    yup.paint( "<div>Content 2 !</div>" );

} )();
```

Here is the content of the test3c.js component:

### test3c

```javascript
( () => {

    const yup = $$.start();
    yup.into( "#part3" );
    yup.paint( "<div>Content 3 !</div>" );

} )();
```

When loading the htm page, the end user will see ***Content 1***, ***Content 2*** and ***Content 3**. Each Yup component paints a content in a part of the HTML page.

## Using Events

Yup components can catch DOM events using the **event** method.

```html
<html>
    <head>
        <script src="../src/yupee.js"></script>
        <script>$$.load( "test1" );</script>
    </head>
    <body>
    </body>
</html>
```
The Yup component **test1** will catch the click event from the Yup component rendering (the view) using the **event** method. For accessing to the view of the Yup component, calling **getView()** is required.

Also, it is possible to run a fonction when the Yup component is displayed using **action**.

```javascript
( () => {

    // Start the yup component and get a reference to the yup component
    const yup = $$.start();

    // With arrow functions
    yup.event(
        "click",
        () => { 
            // We use nor here
            yup.getView().style.color = "red";
        }        
    );

    // With standard functions
    yup.event(
        "click",
        function() { 
            yup.getView().style.fontWeight = "bold";
        } 
    );

    yup.action( function() {
        // We display the current component
        console.log( yup );
    });

    // Paint the yup component
    yup.paint( "<div>Click here for Bold and Red</div>" );

} )();
```

With this Yup component, when the user will click on the black message "Click here for Bold and Red", the message will be rendered in bold with a red color.

## Using DOM node and repainting a Yup component

In this sample, we add a content inside the Yup component using a DOM node and we alter after every 1 second the content with a counter.

```javascript
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
```
## Building a Calculator application

Here a way for building a Calculator using two Yup components. The first one **buttons**, will manage all the buttons of the calculator, the second one **screen** will display the result.

Yup components can communicate with each other using events. Thus the **buttons** will send event and the **screen** will catch this event.

Here the template of the HTML calculator page

```html
<!-- Author : Alexandre Brillant -->
<!-- A Simple Calculator using Yupee -->

<!DOCTYPE html>

<html>
    <head>
        <title>Simple Calculator using Yupee</title>
        <style>
            .row {
                display:block;
            }
            .btn {
                display:inline-block;
                width:30px;
                background-color:black;
                color:white;
                border:1px solid black;
                cursor: pointer;
                text-align:center;
                padding:4px;
                margin:2px;
            }
            #screenfield {
                margin:2px;
                background-color:black;
                color:white;
                text-align:right;
                width : 178px;
            }
            #calc {
                text-align:right;
                width:200px;
            }
        </style>
        <script src="../../src/yupee.js"></script>
        <script>
            $$.load( "screen" );
            $$.load( "buttons" );
        </script>
    </head>
    <body>

        <h1>Simple calculator using Yupee</h1>

		<a href="https://github.com/AlexandreBrillant/yupee">Yupee on GitHub</a>

        <hr>

        <div id="calc">
            <div id="screen">
                <input type="textfield" id="screenfield">
            </div>
            <div id="buttons">
                <div class="row">
                    <div class="btn">C</div>
                    <div class="btn">1/x</div>
                    <div class="btn">x^2</div>
                    <div class="btn">%</div>
                </div>
                <div class="row">
                    <div class="btn">7</div>
                    <div class="btn">8</div>
                    <div class="btn">9</div>
                    <div class="btn">*</div>
                </div>
                <div class="row">
                    <div class="btn">4</div>
                    <div class="btn">5</div>
                    <div class="btn">6</div>
                    <div class="btn">-</div>
                </div>
                <div class="row">
                    <div class="btn">1</div>
                    <div class="btn">2</div>
                    <div class="btn">3</div>
                    <div class="btn">+</div>
                </div>
                <div class="row">
                    <div  class="btn">0</div>
                    <div  class="btn">.</div>
                    <div  class="btn">=</div>
                </div>                
            </div>

        </div>

    </body>
</html>
```

For managing the buttons, we will create a Yup component (**buttons***) getting all the buttons with the ***div.btn*** selector.

```javascript
( () => {

    const yup = $$.start();

    yup.into( "#buttons" );

    // Generate event when clicking on a button with the button label for the screeen component
    const handleBtn = function( event ) {
        const action = event.target.textContent;
        $$.fire( "btn", action );
    }

    yup.selectAll( "div.btn").forEach( btn => {
        btn.addEventListener( "click", handleBtn );
    });

} )();
```

### Selecting parts of the Yup component

The **selectAll** method, will get all the HTML nodes from the provided CSS selector (starting from the Yup container). 

### Using custom events

Using a standard DOM listener, we handle each button of the HTML page and we send the button label to all the Yup components with **$$.fire**. The fist argument is the name of the event (**btn**) and the second argument is the label of the button.

```javascript
( () => {

    const yup = $$.start();
    yup.into( "#screenfield" );

    console.log( "Loading screen" );

    // Process event from the button

    const handleEvent = function( target, btnId ) {
        const screen = yup.getView();
        if ( "C" == btnId ) {
            screen.value = "0";
        } else {
            if ( btnId == "1/x" ) {
                screen.value = 1 / screen.value;
            } else
            if ( btnId == "x^2" ) {
                screen.value *= screen.value;
            } else
            if ( btnId == "=" ) {
                try {
                    screen.value = eval( screen.value );
                } catch( error ) {
                    screen.value = "Error";
                }
            } else {
                if ( screen.value == "0" )
                    screen.value = "";
                screen.value += btnId;
            }                
        }

    }

    // Listen for event from the buttons
    $$.listen( "btn", handleEvent );

} )();
```

### Catching custom events

This Yup component will catch all the event of the **Buttons** component using **$$.listen**. The fist argument is the event type **btn**, and the second one if a fonction for catching the data of the event (here the button label with **btnId**).

## Conclusion

Yupee is a lightweight library for creating modular web applications with ease. It is designed to be simple, flexible, and easy to use.


(c) 2025 - Alexandre Brillant
