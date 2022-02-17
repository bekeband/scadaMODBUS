

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


/**Setting serial port features. */
controller.get('/', (req, res) => {

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
});

controller.put('/start', (req, res) => {
    if (serialPort.openPort()) {
        resultText = "openPort command succesfully runned.";
<<<<<<< HEAD
    };
    res.json("Port is opened succesfully.")
=======
    } else {
        resultText = "openPort did not succesfully.";
    }
    res.json(resultText);
>>>>>>> 149da077b0dfa0edb83c5b5e62355879ad0fc583
});

controller.put('/stop', (req, res) => {

    if (serialPort.closePort()) {
        resultText = "closePort command successfully maked.";
    }else {
        resultText = "closePort did not successfully.";
    }

    res.json(resultText);
});

module.exports = controller;