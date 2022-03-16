
var fs = require('fs');
var parse = require('xml-parser');
var xml = fs.readFileSync('../projects/test.xml', 'utf8');
var inspect = require('util').inspect;
 
var obj = parse(xml);
console.log(inspect(obj, { colors: true, depth: Infinity }));

function saveTestXMLFile() {
    
}


/*const xml = require("xml-parse");

// Valid XML string
var parsedXML = xml.parse('<?xml version="1.0" encoding="UTF-8"?>' +
                          '<root>Root Element</root>');

console.log(parsedXML);*/