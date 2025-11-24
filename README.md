# Yupee

Yupee is an open-source JavaScript library for building complex and modular web applications. 

[View Yupee on Github](https://github.com/AlexandreBrillant/yupee)

It works with external **Yup component** files. A Yup component is a standard JavaScript file that starts by calling the **$$.start** function.

 ### Benefits of Using Yupee :

- No server required.
- Works locally.
- Very simple and uses only standard JavaScript.
- MVC architecture support
- Released under the MIT License for any usage.

## Hello World

Here a very simple example (**helloworld.html**)

This page loads the **yupee.js** library. You can use also the **yupee.min.js** for better loading performance. The following instruction loads a simple Yup component located in the current directory (relative to the html page) from the **test1.js** file.

### Implicit loading

When a **data-yup** attribute is found, yupee will load a Yup component related to the **id** attribute inside a sub directory **yups**.

```html
<html>
    <head>
        <script src="../../src/yupee.js"></script>
    </head>
    <body id="test1" data-yup>
    </body>
</html>
```

In this example, a yup component will be loaded inside the **yups/test1.js** file. The HTML part containing the **data-yup** attribute is a container for the Yup component.

### Explicit loading

If you want to skip the data-yup attribute, the **$$.load** method is available for loading a Yup component

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

In this example, a yup component **test1.js** will be loaded relativly to the html page.

### Yup component content

Here now the content of the Yup component

```javascript
 ( () => {
    
    const yup = $$.start();
    yup.paint( "<div>Hello world</div>" );
 
  } )();
```

The first instruction gets access to the current Yup component by calling **$$.start()**. To render here the Yup component, simply call the **paint** method. The **paint** method works inside the container of the
Yup component, by default the container is the element **body**.

The end user will see only "Hello World" when loading the **helloworld.html** page.

## Loading a Yup component Anywhere in the HTML page

In this example, we load 3 yup components (**test3a**, **test3b** and **test3c**). Each component will renderer a content in a different part of the HTML page.

### Implicit loading

You can load multiple component for the same page using using a **data-yup** attribute, then it will use the html attribute **id** for loading automatically the yup component inside a **yups** subdirectory. Each Yup component will have a specific container depending the location of the data-yup attribute.

Example

```html
<html>
    <head>
        <script src="../../src/yupee.js"></script>
    </head>

    <body>

        <div>Starting zones</div>

        <div id="part1" data-yup></div>

        <div id="part2" data-yup></div>

        <div id="part3" data-yup></div>

        <div>Stopping zones</div>

    </body>

</html>
```

In this example, it will load 3 yup components **yups/part1.js**, **yups/part2.js** and **yups/part3.js**. 

### Explicit loading

If you want to skip the **data-yup** attribute, you can use explicit loading here

```html
<html>
    <head>
        <script src="../src/yupee.js"></script>
        <script>$$.load( "part1" );</script>
        <script>$$.load( "part2" );</script>
        <script>$$.load( "part3" );</script>        
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

Here is the content of the **part1.js** component for an explicit loading, we need to define the location of the container using **into**. For implicit loading, this is not required.

```javascript
( () => {

    const yup = $$.start();
    yup.into( "#part1" );   // Only for explicit loading !
    yup.paint( "<div>Content 1 !</div>" );

} )();
```

When loading the html page, the end user will see ***Content 1***, ***Content 2*** and ***Content 3**. Each Yup component paints a content in a part of the HTML page.

## Using Parameters

### Implicit loading

Any attribute for a Yup container become a parameter for the Yup component.

```javascript
<html>
    <head>
        <script src="../../src/yupee.js"></script>
    </head>

    <body>

        <div>Starting zones</div>

        <div id="part1" color="red" data-yup></div>

        <div>Stopping zones</div>

    </body>

</html>
```

In this example, we added a **color** attribute. Then we can use it inside our Yup component like this :

```javascript
( () => {

    const yup = $$.start();
    const color = yup.param( "color", "black" );
    yup.paint( "<div>Content 1 !</div>" ).style( { "color" : color } );

} )();
```

### Explit loading

A Yup component can be loaded with additional parameters from the **load** method.

In the next example, we have two parameters **message** and **color**

```html
<html>
    <head>
        <script src="../src/yupee.js"></script>
        <script>$$.load( "test4", { message : "hello world", color : "red" } );</script>
    </head>

    <body>

    </body>
</html>
```

In the Yup component, the **param** method is used for getting each parameter value.

```javascript
( () => {

    const yup = $$.start();
    const message = yup.param( "message", "bye bye world..." );
    const color = yup.param( "color", "black" );

    yup.paint( `<div>${message}</div>` ).style( { "color" : color, "font-weight" : "bold" } );

} )();

```

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
            yup.container().style.color = "red";
        }        
    );

    // With standard functions
    yup.event(
        "click",
        function() { 
            yup.container().style.fontWeight = "bold";
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

Here’s a way to build a Calculator using two Yup components. The first one **buttons**, will manage all the buttons of the calculator, the second one **screen** will display the result.

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
        <script src="../../../src/yupee.js"></script>
    </head>
    <body>

        <h1>Simple calculator using Yupee</h1>

		<a href="https://github.com/AlexandreBrillant/yupee">Yupee on GitHub</a>

        <hr>

        <div id="calc">
            <div id="screen" data-yup>
                <input type="textfield" id="screenfield">
            </div>
            <div id="buttons" data-yup>
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

For managing the buttons, we will create a Yup component (**buttons**) getting all the buttons with the **div.btn** selector.

```javascript
( () => {

    const yup = $$.start();

    // Generate event when clicking on a button with the button label for the screeen component
    const handleBtn = function( event ) {
        const action = event.target.textContent;
        yup.produce( "btn", action );
    }

    yup.selectAll( "div.btn").forEach( btn => {
        btn.addEventListener( "click", handleBtn );
    });

} )();
```

### Creating a child Yup component

The **addChildBySelector** method for a Yup component will search from the container a new container using a CSS selector. This new container will be used for building a new Yup component.

### Produce/Consume custom events

A yup component can produce data with the **produce**" method with a name and a value. A yup component
can consume data with the **consume** method with a name.

Here the final screen component for our calculator.

We get a sub component with the **screen** constant. For getting each button value, we use the **consume** method with a **btn** name. Then we process it inside the **handleEvent** function.

```javascript
( () => {

    const yup = $$.start();
    const screen = yup.addChildBySelector( "textfield", "input[id=screenfield]" );

    console.log( "Loading screen" );

    // Process event from the button

    const handleEvent = function( btnId ) {
        if ( "C" == btnId ) {
            screen.value( "0" );
        } else {
            if ( btnId == "1/x" ) {
                screen.value( 1 / screen.value() );
            } else
            if ( btnId == "x^2" ) {
                textfield.value( screen.value() * screen.value() );
            } else
            if ( btnId == "=" ) {
                try {
                    screen.value( eval( screen.value() ) );
                } catch( error ) {
                    screen.value( "Error" );
                }
            } else {
                if ( screen.value() == "0" )
                    screen.value( "" );
                screen.value( screen.value() + btnId );
            }                
        }

    }

    // Listen for event from the buttons
    yup.consume( "btn", handleEvent );

} )();
```

## Creating MVC applications

You can share data between your Yup components. In this example, we build a simple notebook application. All
the notes are stored inside a shared model called **notes**, managed by a Yup component named **actions** (acting both The Model and The Controller). Another Yup component **notes** listens (The View) for model updates and repaints each note in the HTML template.

### The Model part

Here the **actions** component

```javascript
( () => {

    const yup = $$.start();

    // Share a model for the notes
    $$.data( "notes", [] );

    yup.event( "click",
            () => {
                let note = prompt( "Your note" );
                if ( note ) {
                    $$.data( "notes" ).push( note );
                    $$.fire( "repaint" );
                }
    } );

    yup.paint( "<input type='button' value='Add a note' id='add'>" );

} )();

```

### The View part

Here the **notes** component

```javascript
( () => {

    const yup = $$.start();

    function repaint( notes ) {
        let htmlNotes = "";
        notes.forEach( note => {
            htmlNotes += ( "<div>" + note + "</div>" );
        });
        yup.paint( htmlNotes );
    }

    $$.listen( "repaint", () => {
        repaint( $$.data( "notes" ) );
    } );

} )();
```

## Conclusion

Yupee is a lightweight library for creating complex and modular web applications with ease. It is designed to be simple, flexible, and easy to use.

(c) 2025 - Alexandre Brillant
