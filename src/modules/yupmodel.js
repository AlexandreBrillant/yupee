/**
 * A Yup model manages data for a Yup component. A Yup component can only have one Yup model, but a 
 * yup model can be for multiple Yup component
 */
class YupModel {
    #content = {};
    #yups = [];

    constructor( content ) {
        content && ( this.#content = content );
    }

    #submodels = {};

    /**
     * Create a sub model for this model. It means with the majorkey argument, all the
     * sub model will work only with this majorkey sub object. This is useful for avoiding
     * to share all the model, by only a subset to a Yup component.
     * @param {*} majorKey 
     */
    subModel( majorKey ) {
        if ( this.#submodels[ majorKey ] ) {
            return this.#submodels[ majorKey ];
        }
        !this.#content[majorKey] && ( this.#content[majorKey] = {} );
        const submodel = new YupModel( this.#content[majorKey] );
        this.#submodels[ majorKey ] = submodel;
        return submodel;
    }

    // For inner usage
    _addYup( yupcomponent ) {
        this.#yups.push( yupcomponent );
    }

    // For inner usage
    _removeYup( yupcomponent ) {
        const index = this.#yups.indexOf( yupcomponent );
        index > -1 && this.#yups.splice( index, 1 );
    }

    /**
     * Add data for an array of the current model. A key is required
     * @param {*} key The key for the datamodel
     * @param {*} data The data to be pushed
     * @param {*} update "false" by default to update all the Yup components using this model
     */
    pushData( key, data, update = false ) {
        this.#content[key] = this.#content[key] ?? [];
        this.#content[key].push( data );
        if ( update ) {
            this.update( key );
        }
    }

    /** Notify to all the Yup component using this model to repaint 
     *  @param flags optional for all the renderers, it can be used for optimization
     *  @param includeSubModel "false" by default, if true then the update contains also the sub models
     */
    update( flags, includeSubModel = false ) {
        this.#yups.forEach( yup => yup.paint( { flags }) );
        if ( includeSubModel && this.#submodels ) {
            for ( const key in this.#submodels ) {
                this.#submodels[ key ].update( flags, includeSubModel );
            }
        }
    }

    /**
     * Read or Write a data inside this current model. By default it will ask to all the concerned yup components to repaint
     * @param {*} key A key for this data
     * @param {*} value Optional value to write
     * @param {*} update "false" By default to update all the Yup component using this model
     * @returns a data value
     */
    data( key, value, update = false ) {
        if ( !value ) {
            return this.#content[ key ];
        }
        this.#content[ key ] = value;
        if ( update )
            this.update( key );
        return value;
    }

    /**
     * Trace to the console the content of this model
     */
    dump() {
        console.log( "*** Start Dump Model ***")
        console.log( this.#content );
        this.#yups.forEach(
            yup => console.log( "-> Yup user [" + yup.yupid() + "]" ) );
        
        console.log( "*** End Dump Model ***")
    }

    /**
     * Convert data model object to a JSON string
     */
    toJSON() {
        return JSON.stringify( this.#content );
    }

    /**
     * Update all the data of this model using a JSON String
     * @param jsonStr 
     */
    fromJSON(jsonStr) {
        this.#content = JSON.parse( jsonStr );
    }

}
