/**
* This is the class for managing the container of the Yup component, it adds tools
* for managing the DOM. It can be considered as a Proxy for a DOM node.
*
* @author Alexandre Brillant (https://github.com/AlexandreBrillant/)
*/

class YupContainer {
    #$

    constructor( node ) {
        this.#$ = node;
    }

    /**
     * @param newContainer optional value for updating the dom node of this container
     * @returns The DOM node
     */
    node( newContainer ) {
        newContainer && ( this.#$ = newContainer );
        return this.#$;
    }

    /**
     * @returns The DOM ID
     */
    id( newId ) {
        newId && ( this.#$.id = newId );
        return this.#$.id;
    }

    /**
     * Set attribute of the DOM node
     * @param {*} key 
     * @param {*} value 
     */
    setAttribute( key, value ) {
        this.#$.setAttribute( key, value );
    }

    /*** 
     * "data-key" is managed in the same way as "key"
     * @param {*} key 
     * @returns an attribute or a dataset
     */
    getAttribute( key ) {
        return this.#$.dataset[ key ] || this.#$.getAttribute( key );
    }

    /**
     * Has attribute for the key or a data-key attribute
     * @param {*} key 
     * @returns 
     */
    hasAttribute( key ) {
        return ( key in this.#$.dataset ) || this.#$.hasAttribute( key );
    }

    attributes() {
        return this.#$.attributes;
    }

    /**
     * @returns The DOM parent node
     */
    parentNode() {
        return this.#$.parentNode;
    }

    /**
     * Check if the container is a parent of this one
     * @param {*} container a Yup Container
     */
    isParent( container ) {
        return container.node() == this.parentNode();
    }

    lastChild() {
        return this.#$.lastChild;
    }

    /**
     * Add a new DOM child for this container
     * @param {*} newChild can be a yupcontainer, a string or a dom node
     * @param {*} autoscroll false by default, else scroll to the end
     */
    appendChild( newChild, autoscroll = false ) {
        if ( newChild instanceof YupContainer ) {
            newChild = newChild.node();
        }
        if ( typeof newChild == "string" ) {
            this.appendHTML( newChild );
        } else
        this.#$.appendChild( newChild );
        autoscroll && this.scrollToEnd();
    }

    /**
     * Put inside at the end of this container the HTML code
     * @param {*} html HTML code
     * @param autoscroll force a scrolling if required to the end of the container
     */
    appendHTML( html, autoscroll = false ) {
        this.#$.insertAdjacentHTML( 'beforeend', html );
        autoscroll && this.scrollToEnd();
    }

    /**
     * Scroll to the end of the container
     */
    scrollToEnd() {
        this.#$.scrollTop = this.#$.scrollHeight;        
    }

    /**
     * Remove a child
     * @param {*} child can be a DOM node or a YupContainer
     */
    removeChild( child ) {
        if ( child instanceof YupContainer ) {
            child = child.node();
        }
        this.#$.removeChild( child );
    }

    /**
     * Swap a child by another one
     * @param {*} oldChild old DOM node
     * @param {*} newChild new DOM node
     */
    replaceChild( newChild, oldChild ) {
        this.#$.replaceChild( newChild, oldChild );
    }

    querySelector( selector ) {
        return this.#$.querySelector( selector );
    }

    querySelectorAll( selector ) {
        // Work for the whole document rathen than this container
        let finalContainer = this.#$;
        if ( selector.startsWith( "/" ) ) {
            finalContainer = document;
            selector = selector.substring( 1 );
        }
        return finalContainer.querySelectorAll( selector );
    }

    style( values ) {
        for ( let property in values ) {
            this.#$.style[ property ] = values[ property ];
        }
        return this;
    }

    event( evt, handler ) {
        this.#$.addEventListener( evt, handler );
    }

    textContent() {
        return this.#$.textContent;
    }

    value(content) {
            if ( typeof content == "undefined" )
            return this.#$.value;
        else
            this.#$.value = content;
    }

    hasClass( className ) {
        return this.#$.classList.contains( className );
    }

    addClass( className ) {
        !this.#$.classList.contains( className ) && this.#$.classList.add( className );
        return this;
    }

    removeClass( className ) {
        this.#$.classList.remove( className );
        return this;
    }

    /**
     * Clean the DOM content
     */
    clean() {
        while ( this.#$.firstChild )
            this.#$.removeChild( this.#$.firstChild );
    }
}