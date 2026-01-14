# Yupee

Yupee is an open-source JavaScript library for building complex and modular web applications. 

Yupee helps developers organize their JavaScript applications into independent components. It automatically binds a component to a DOM node, reduces inter-component dependencies by using event-based communication, and supports a full MVC (Model-View-Controller) architecture for the entire application, including multi-page management.

[View Yupee on Github](https://github.com/AlexandreBrillant/yupee)

It works with external **Yup component** files. A Yup component is a standard JavaScript file that starts by calling the **$$.start** function.

## Current Version

**v1.0** – Stable and ready for use ! 

## Benefits of Using Yupee :

- No server required.
- Works locally.
- Very simple and uses only standard JavaScript.
- No external librairies.
- MVC architecture support.
- Released under the MIT License for any usage.

## Build all

Yupee includes its own preprocessor to assemble the final library from independent javascript parts.

```bash
npm run build
```

Then you will have a **dist/yupee.js** (for development) or **dist/yupee.min.js** (for production)

## Hello World

Here a very simple example (**helloworld.html**)

This page loads the **yupee.js** library. You can use also the **yupee.min.js** for better loading performance. The following instruction loads a simple Yup component located in the current directory (relative to the html page) from the **test1.js** file.

### Implicit loading

When a **data-yup** attribute is found, yupee will load a Yup component related to the **id** attribute inside a sub directory **yups**.

```html
<html>
    <head>
        <script src="yupee.js"></script>
    </head>
    <body id="test1" data-yup>
    </body>
</html>
```

In this example, a yup component will be loaded inside the **yups/test1.js** file. The HTML part containing the **data-yup** attribute is a container for the Yup component.

Sometimes you can't use an id attribute for the component's filename. However you can choose your component id using either the **data-yupid** or the **yupid** attribute.

### Explicit loading

If you want to skip the data-yup attribute, the **$$.load** method is available for loading a Yup component

```html
 <html>
   <head>
       <script src="yupee.js"></script>
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

You can load multiple components for the same page using using a **data-yup** attribute, then it will use the html attribute **id** or **data-yupid** for loading automatically the yup component inside a **yups** subdirectory.

Each Yup component will have a specific container depending the location of the **data-yup** attribute.

Example

```html
<html>
    <head>
        <script src="yupee.js"></script>
    </head>

    <body id="mytest" data-yup>

        <div>Starting zones</div>

        <div id="part1" data-yup></div>

        <div id="part2" data-yup></div>

        <div id="part3" data-yup></div>

        <div>Stopping zones</div>

    </body>

</html>
```

In this example, we have a main **mytest** yup component. It will be loaded using the path **yups/mytest.js**.

However, the 3 yup components inside will be loaded from these paths **yups/mytest/part1.js**, **yups/mytest/part2.js** and **yups/mytest/part3.js**.

You can choose your own path giving a value to the **data-yup** attribute.

Example

```html
<div id="part2" data-yup="test3b"></div>
```

In this case, the Yup component will be loaded from the test3b path.

### Use your own rule

You may also choose another rule for loading a Yup component from a DOM node using the $$.pathResolver attribute with a delegate function.

Example

```javascript
$$.pathResolver = ( node ) => {
    if ( node.id ) 
        return `all/${node.id}`;
}
```

In this case each time a node has an id attribute, then Yupee will be loaded inside a "all" directory. If a null value is returned, then no component
will be loaded.

### yupbase

A **data-yupbase** attribute can be set for adding a default path to any descendants.

```html
    <body data-yup="main" data-yupbase="yups/actions">

        <div id="notes" data-yup></div>

        <div id="actions" data-yup></div>

    </body>
```

In the previous example a **data-yupbase** attribute is located to the body tag.

The **main** component will be loaded from the **yups/actions/main.j** file
The **notes** component will be loaded from the **yups/actions/notes.js** file, 
The **actions** component will be loaded from the **yups/actions/actions.js** file.

### Explicit loading

If you want to skip the **data-yup** attribute, you can use explicit loading here

```html
<html>
    <head>
        <script src="yupee.js"></script>
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

When using the **$$.load** method, the container for the Yup component is unknown. This allows the Yup component
to choose its own container using the **newContainer** method.

```javascript
( () => {
    const yup = $$.start();
    yup.newContainer( "#part1" );   // Only for explicit loading !
    yup.paint( "<div>Content 1 !</div>" );
} )();
```

When loading the html page, the end user will see ***Content 1***, ***Content 2*** and ***Content 3**. Each Yup component paints a content in a part of the HTML page.

## Using Parameters

### Implicit loading

Any attribute for a Yup container become a parameter for the Yup component.

```html
<html>
    <head>
        <script src="yupee.js"></script>
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
        <script src="yupee.js"></script>
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

## Using DOM Events

Yup components can catch DOM events using the **event** method.

This Yup component will catch the **click** event using the **event** method. For accessing to the container of the Yup component, calling **container()** is required.

```javascript
( () => {

    // Start the yup component and get a reference to the yup component
    const yup = $$.start();

    // With arrow functions : Note no "this" usage.
    yup.event(
        "click",
        () => { 
            yup.style( { color : "red" } );
        }        
    );

    // Or with standard functions : Note the "this" usage
    yup.click(
        function() { 
            yup.style( { fontWeight : "bold" } );
        } 
    );

    // Paint the yup component
    yup.paint( "<div>Click here for Bold and Red</div>" );

} )();
```

With this Yup component, when the user will click on the black message "Click here for Bold and Red", the message will be rendered in **bold** with a **red** color.

## Using a DOM node and repainting a Yup component

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

When painting a component, the content is automatically cleared.

## Adding a child

 Yup component can also have child components. A child component can be either new content or existing content.

If you add HTML content or a DOM node, it will be treated as new content. However, if you select part of the current container, it will be used as-is.

You have two methods: **addChild** or **addChildren**. In both cases, you can provide an object with a **select** attribute to choose a set of nodes using a CSS selector.

```html
<html>
    <head>
        <script src="yupee.js"></script>
        <script>
            const test10 = () => {
                const yup = $$.start( { container:document.body } );
                yup.addChildren( { select: "div" } ).forEach(
                    ( yup ) => {
                        yup.style( { "color" : yup.container().textContent() } );
                    }
                );
				yup.addChild( "<div>This is the end</div>" );
            }
        </script>
    </head>
    <body onload="test10()">
        <div>Red</div>
        <div>Green</div>
        <div>Blue</div>
    </body>
</html>
```

In this example, we use a specific node container for the **start** method. To ensure the DOM content is available, so we use a simple **onload** attribute to initialize our component (for demonstration purposes).

Using **addChildren**, we select the **div** node from the **body** node. By default, the **select** attribute targets the current container (here document.body). This method returns an array with all the new Yup component children, which can then be used  to update a child's color using the text content.

In the last example, we add a new Yup child containing the message "This is the end".

You can also target a child anywhere in the document by starting the CSS Selector with "/".

Note :

If no **yupid** is specified, the library will automatically detect a yupid using a yupid/data-yupid or id attribute. However you can manually set a yupid including a **yupid** attribute inside the **addChild** parameters.

```javascript
yup.addChild( { yupid : "end", html : "<div>-----------------</div>" } );
```

Thus you can get this component with the **child** method and the right yupid.

```javascript
yup.child( "end" ).style( { "color": "red" } );
```

## Template

A template can be defined within the **$$.application.templates** object by a unique name. A yup component can then use this template to render its content. To populate the template with dynamic values, you can provide
a literal object containing the required data.

### Explicit usage

In the following example, we declare an **hello** template. It has a **name** parameter.

```javascript
const template1 = "<div>Hello {name}</div>";
$$.application.templates[ "hello"] = template1;
```

The **yup1** component is initialized using the **hello** template.

```javascript
const yup1 = $$.start( { template : "hello" });
yup1.newContainer( document.body );
yup1.paint( { name : "alex"} );
```

When rendering the component with the paint method, the template parameters are passed as arguments.

### Implicit usage

In implicit usage, the template name is specified using either the **data-template** or **template** attribute.

```html
<html>
    <head>
        <script src="yupee.js"></script>
        <script>
            // Declare a global template to the application
            const template1 = "<div>Hello {name}</div>";
            $$.application.templates[ "hello"] = template1;
        </script>
    </head>
    <body id="test9" data-yup data-template="hello">
    </body>
</html>
```

In this sample, we declare a **test9** yup component using the **hello** template. We just have to provide the parameters to the paint method.

```javascript
( () => {
    const yup = $$.start();
    yup.paint( { name : "alexandre"} );
} )();
```

## Debugging

Each yup component can use a **trace** method to send application output messages. Every
yup operation such as loading a component, handling an event... is traced.

By default, traces are disabled. To display all traces, you must use the **$$.debugMode** method. By default, traces are output to the console. However, you can use a parameter to redirect to the
HTML page instead.

```html
<html>
    <head>
        <script src="yupee.js"></script>
        <script>
            $$.debugMode( $$.KEYS.DEBUG_BODY );
        </script>
    </head>

    <body id="myerror" data-yup>
    </body>

</html>
```

In this example, we enable traces inside the HTML body using the **$$.KEYS.DEBUG_BODY** parameter. The HTML page loads a Yup component named 'myerror', which is unknown. As a result, the error trace appears at the end of the HTML page.

## Building a Calculator application

Here’s a way to build a Calculator using two Yup components. The first one **buttons**, will manage all the buttons of the calculator, the second one **screen** will display the result.

Yup components can communicate with each other using events. Thus the **buttons** will send event and the **screen** will catch this event.

Here the template of the HTML calculator page

```html
<!DOCTYPE html>
<html>
    <head>
        <script src="yupee.js"></script>
    </head>
    <body>
        <h1>Simple calculator using Yupee</h1>
        <hr>
        <div id="calc">
            <div id="screen" data-yup>
                <input type="textfield" id="screenfield">
            </div>
            <div id="buttons" data-yup>
                <div class="row">
                    <div class="btn" yupid="C">C</div>
                    <div class="btn" yupid="1/x">1/x</div>
                    <div class="btn" yupid="x^2">x^2</div>
                    <div class="btn" yupid="%">%</div>
                </div>
                <div class="row">
                    <div class="btn" yupid="7">7</div>
                    <div class="btn" yupid="8">8</div>
                    <div class="btn" yupid="9">9</div>
                    <div class="btn" yupid="*">*</div>
                </div>
                <div class="row">
                    <div class="btn" yupid="4">4</div>
                    <div class="btn" yupid="5">5</div>
                    <div class="btn" yupid="6">6</div>
                    <div class="btn" yupid="-">-</div>
                </div>
                <div class="row">
                    <div class="btn" yupid="1">1</div>
                    <div class="btn" yupid="2">2</div>
                    <div class="btn" yupid="3">3</div>
                    <div class="btn" yupid="+">+</div>
                </div>
                <div class="row">
                    <div  class="btn" yupid="0">0</div>
                    <div  class="btn" yupid=".">.</div>
                    <div  class="btn" yupid="=">=</div>
                </div>                
            </div>
        </div>
    </body>
</html>
```

Note that we added a **yupid** attribute, we could also use "**data-yupid**". It will be used for adding an ID for
yup children.

### Managing the buttons

To manage the buttons, we will create a Yup component (**buttons**) getting all the buttons with the **div.btn** selector.

```javascript
( () => {

    const yup = $$.start();
    yup.addChildren( { select : "div.btn", click : $$.KEYS.AUTO_HANDLER } );

} )();
```

Using **addChildren** we add new Yup children to the **buttons** Yup component. We add a CSS selector parameter and a **click** parameter.
The **click** parameter has a **$$.KEYS.AUTO_HANDLER** which means "When clicking on a button, send an event using the ID of the component". In this sample, it means, send an event using the **yupid** attribute value.

Each time a button is clicked, it generated an event **$$.KEYS.AUTO_HANDLER** using the **produce** method. A button produces an event with by default its ID.

### Displaying the result

We add another Yup component as the **screen** part. We get each button pressed event using the **$$.KEYS.EVENT_YUPID** event.

We just have to **consume** a $$.KEYS.AUTO_HANDLER event for getting each button pressed an display the result inside the screen.

```javascript
( () => {

   const yup = $$.start();
   const screen = yup.addChild( { yupid:"toto", selector : "input[id=screenfield]" } );

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
    yup.consume( $$.KEYS.EVENT_YUPID, handleEvent );

} )();
```

## Creating a complete Yup application

First we need to build our application model. This is the model of data for your whole application.

### The Model part

We build a main Yup component for defining the data model and all the method for modifying this model.

```javascript
( () => {

    const yup = $$.start();
    $$.application.initModel( { notes: []} );   // Whole data

    $$.application.newNote = () => {            // Add a new note
        const note = prompt( "Your note" );
        if ( note ) {
            $$.application.model().data( "notes" ).push( note );    // Modify the model
            $$.application.model().update();    // Notify all the users
        }
    };

    $$.application.removeNote = ( note ) => {   // Remove a note
        const newNotes = $$.application.model().data( "notes" ).filter( n => n != note );
        $$.application.model().data( "notes", newNotes );   // Modify the model
        $$.application.model().update();    // Notify all the users
    }

} )();
```

By calling the **initModel** to define your application model, we have here only one array of notes.

We add a shared method **newNote** for adding a value inside your model. And another one **removeNote"** for remove one note. Each time
the application model $$.application.model() is updated, we need to call the **update** method.

Here a part of your HTML page, we decide to load explicitly a **yups/main** file.

```html
<body data-yup="yups/main">
    ...
</body>
```

### The View part

Now we need to decide how to display our data model. We need another Yup component for the rendering.

```javascript
( () => {

    const yup = $$.start();

    // Set a renderer for the model of notes
    yup.renderer(
        ( { model, container } ) => {
            const notes = model.data( "notes" );
            notes.forEach( note => {
                yup.addChild( "<div>" + note + " <button>-</button></div>" ).addChild( { "select" : "button" }).click( () => $$.application.removeNote( note ) );
            });
    } );

} )();
```

By default, our Yup component uses the application model. If you define a renderer method, you will receive the current model and the container as parameters

We then need to retrieve all the notes from your data model. Next, we iterate through the array, and for each note, we add a new Yup component as a child using **addChild**.

We also include a button for removing a note. To detect when the button is pressed, we add another child component with { "select": "button" } to target the button as a sub-child. In the click action, we simply call the **removeNote** method from the application model."

### The action part

We build a last Yup component for adding a new note. It just call the **newNote** of our application. We use **event** it rather than **click** as an example.

```javascript
( () => {
    const yup = $$.start();
    yup.event( "click",
            () => {
                $$.application.newNote();
            } );
    yup.paint( "<input type='button' value='Add a note' id='add'>" );
} )();
```

Here the final HTML 

```html
<html>
    <head>
        <title>Simple Notes</title>
        <script src="yupee.js"></script>
    </head>
    <body data-yup="yups/main">
        <h1>Simple Notes using Yupee</h1>
        <hr>
        <div id="notes" data-yup>
        </div>
        <hr>
        <div id="actions" data-yup>
        </div>
    </body>
</html>
```

We load these Yup components :
- yups/main.js
- yups/notes.js
- yups/actions.js

## Using your own classes

By default, Yupee uses the following classes to build each part:

- **Yup** : The main class for a Yup component, each time you call **$$.start**, it creates a new **Yup** instance.
- **YupContainer** : An inner class of a Yup component, it manages the DOM container (the location of a Yup component) and provides tools for updating CSS, etc.
- **YupModel** : The data model for either the whole application or a specific Yup component when using a renderer to paint a Yup component.
- **Driver** : A class for managing pages when switching between them. It can read and store the application context.

You can extend any class using the following keys :

```javascript
$$.classes = {       
    Driver : Driver,
    Yup : Yup,
    YupContainer : YupContainer,
    YupModel : YupModel
};
```

When using your own class, you can refererence it with :

```javascript
$$.yupClass = YOUR_CLASS;
$$.yupContainerClass = YOUR_CLASS;
$$.yupModelClass = YOUR_CLASS
$$.driverClass = YOUR_CLASS;
```

Note: This must be set before loading your Yup component.

Another option is to set your own class when starting your Yup component. In the following example, a new Yup component class is created. Each time a Yup component is painted, it will apply a green color to both the text and the border:

```javascript
class MyYupComponent extends $$.classes.Yup {
    constructor( config ) {
        super( config );
    }

    paint( config ) {
        this.container().style( { color : "green", borderColor:"green" }, );
        super.paint( config );
    }
}       
```

Here’s how to load your class when starting your Yup component:

```javascript
const yup = $$.start( { class:MyYupComponent } );
yup2.paint( "My new component" );
```

In this another example, a YupContainer class is extended for all yup components.

```javascript
$$.yupContainerClass = class MyYupContainer extends $$.classes.YupContainer {
    constructor( container ) {
        super( container );
        this.style( { border : "2px solid red"} );
    }
};
```

Thus, every time a Yup component is built, it will use this **MyYupContainer** class for internal DOM usage, and every Yup component will have a red border.

## Page

A page is any HTML page that uses Yup components. You can switch to another page using 
**$$.loadPage** :
- A first parameter is simply the path to the new HTML page of your 
application.
- A second parameter (by default to true) decide to save the context of the
application.

Saving a context means storing the application model data before changing pages.

When a new page loads, the application model data is automatically restored. If you
use MVC for all your components, then the application state will be preserved.

## Conclusion

Yupee is a lightweight library for creating complex and modular web applications with ease. It is designed to be simple, flexible, and easy to use.

(c) 2025 - Alexandre Brillant
