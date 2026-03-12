/**
 * Simple preprocessor for JavaScript
 * @url https://github.com/AlexandreBrillant/yupee
 * @author Alexandre Brillant 
 */

const fs = require('fs/promises');
const path = require('path');

mainFile = "main.js";
outputFile = "test.js"
const argv = process.argv;
let addit = "";

for ( let i = 0; i < argv.length; i++ ) {
    if ( argv[ i ] == "-a" || argv[ i ] == "--add" )
        addit = argv[ i + 1 ];
    if ( argv[ i ] == "-i" || argv[ i ] == "--input" )
        mainFile = argv[ i + 1 ];
    if ( argv[ i ] == "-o" || argv[ i ] == "--output" )
        outputFile = argv[ i + 1 ];
    if ( argv[ i ] == "-h" || argv[ i ] == "--help" ) {
        console.log( "node module.js -i inputfile -a addthis -o outputfile" );
        console.log( "or" );
        console.log( "node module.js --input inputfile --add addthis --output outputfile" );
    }
}

console.log( `Processing ${mainFile}` );
addit && ( addit = "\n" + addit );
console.log( addit );

const files = {};

async function processMain() {
    const mainContent = await fs.readFile( mainFile, 'utf8');
    const mustread = [];

    mainContent.replace( /\/\/#include\s+"([\w\.]+)"/g,     
        ( match, filename ) => mustread.push( filename ) );

    
    for ( const file of mustread ) {
        await readFile( file );
    }

    return mainContent.replace( /\/\/#include\s+"([\w\.]+)"/g, 
        ( match, filename ) => {
            return files[ filename ];
        }
    )
}

async function readFile( filename ) {
    const file = path.dirname( mainFile ) + "/" + filename;
    const content = await fs.readFile( file, 'utf8');
    files[ filename ] = content.replace( /\/\/#start(.*)\/\/#end/gs, "" );
}

async function writeMain( content ) {
    console.log( "Write to " + outputFile );
    await fs.writeFile( outputFile, content, 'utf8');
}

processMain().then(
    () => {
        processMain(false).then(
            ( fileContent ) => {
                writeMain( fileContent + addit );
            } );
    }
)
