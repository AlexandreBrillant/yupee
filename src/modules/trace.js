/**
 * Inner function for tracing the main action
 * @param {*} actionId an actionId key
 * @param  {...any} params a set of values to trace
 */
function _trace( actionId, ...params ) {
    if ( debugMode ) {
        const paramstr = params.join( "," );
        const log = `** [${actionId}] ** ${paramstr}`
        if ( traceMode == $$.KEYS.DEBUG_CONSOLE )
            console.log( log );
        else {
            document.body.insertAdjacentHTML( "beforeend", `<div class='yuptrace'>${log}</div>` );
        }
        if ( deepTrace ) {
            params.forEach( ( element ) => {
                if ( typeof element == "object" ) {
                    if ( traceMode == $$.KEYS.DEBUG_CONSOLE )
                        console.log( element );
                    else {
                        document.body.insertAdjacentHTML( "beforeend", `<div class='yuptrace'>${log}</div>` );
                    }
                }
            } );
        }
    }
}