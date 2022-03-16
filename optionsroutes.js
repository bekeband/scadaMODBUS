

const express = require('express');
const controller = express.Router();
const serialPort = require('./serialport');

/**Getting serial port status.  */
controller.get('/status', (req, res) => {

    var dataTable = [];

    var obj = {
        "port": serialPort.portName,
        "baud": serialPort.baudRate,
        "dataBits": serialPort.dataBits,
        "stopBits": serialPort.stopBits,
        "parity": serialPort.parity,
        "rtscts": serialPort.rtscts,
        "xon": serialPort.xon,
        "xoff": serialPort.xoff,
        "xany": serialPort.xany,
        "isOpened": serialPort.isOpenPort()
    }
    dataTable.push(obj);
    res.json(dataTable);
});



/*controller.get('/', (req, res) => {

    var resultText = "N/A";

    console.log(req.body);
    switch (req.body.options) {
        case 'portname': console.log("ask portname require.");
            resultText = "ask portname require.";
            break;
        case 'status':
            resultText = "status command require.";
            break;
    }

    res.json(resultText);
});*/

controller.put('/start', (req, res) => {
    if (serialPort.openPort()) {
        resultText = "openPort command succesfully runned.";
    } else {
        resultText = "openPort did not succesfully.";
    }
    res.json(resultText);
});

controller.put('/stop', (req, res) => {

    if (serialPort.closePort()) {
        resultText = "closePort command successfully maked.";
    }else {
        resultText = "closePort did not successfully.";
    }

    res.json(resultText);
});


/**Setting serial port features. */
controller.put('/', (req, res) => {
    const newOptions = req.body;
    if (newOptions.port) serialPort.portName = newOptions.port;
    if (newOptions.baudRate) serialPort.baudRate = newOptions.baudRate;
    if (newOptions.dataBits) serialPort.dataBits = newOptions.dataBits;
    if (newOptions.stopBits) serialPort.stopBits = newOptions.stopBits;
    if (newOptions.parity) serialPort.parity = newOptions.parity;
    if (newOptions.rtscts) serialPort.rtscts = newOptions.rtscts;
    if (newOptions.xon) serialPort.xon = newOptions.xon; 
    if (newOptions.xoff) serialPort.xoff = newOptions.xoff;
    if (newOptions.xany) serialPort.xany = newOptions.xany;

    console.log(newOptions);

    res.json(newOptions);
});

module.exports = controller;