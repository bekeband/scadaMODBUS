const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');

/* Serial port open */
const SerialPort = require('serialport');

/**JSON body parser for the data exchange. */

app.use(bodyParser.json());

/**
 * options for serial options settings.
 */

app.use('/options', require('./optionsroutes'));

/**
 * datas for datas reading and writing.
 */

app.use('/datas', require('./datasroutes'));



app.listen(port, () =>  {
    console.log("bandiSCADA simple scada backend for MODBUS datas.");
    console.log(`App listening at http://localhost:${port}`);
})