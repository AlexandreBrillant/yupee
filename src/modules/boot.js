/**
 * This is the main function of Yupee
 * It is called both for loading Yup components and for managing each one
 */
const boot = (...args) => {
    ready = document.body ? true : false;

    init = () => {
            let usage = null;
            if ( args.length ) 
                usage = args[ 0 ];
        
            const yupees = Yupees.instance();

            if ( typeof usage == "object" ) { 
                const { load, params } = usage;
                yupees.loadComponent( load, params );
            }
    };

    if ( ready )    // Run now
        init();
    else {          // Wait until the html page is loaded
        starting.push(init);
        document.addEventListener( "DOMContentLoaded", () => {
            ready = true;
            _startingAll();
        } );
    }

}