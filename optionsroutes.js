/** 
 * optionsroutes route the options requires.
*/

const express = require('express');
const controller = express.Router();
const serialPort = require('./serialport');

var serialPorts = new Array();

function insertSerialPort(serialPortObject) {
    serialPorts.push(serialPortObject);
    return serialPorts;
}

function openSerialPort(index) {

    if (serialPorts[index] != null) {
        serialPorts[index].SerialPort = new SerialPort(serialPorts[index].name, 
            {baudRate: serialPorts[index].baudRate, stopBits: serialPorts[index].stopBits,
                parity: serialPorts[index].parity
        });
    } else {
        
    }

}

/**
 * 
 * @param {*} portdID 
 * @returns 
 */
function searchSerialPort(portdID) {
//    console.debug("Search in serialPorts:", portdID);
    for (let index = 0; index < serialPorts.length; index++) {
        if (portdID === serialPorts[index].name) {
//            console.debug("serialPorts[index].name : ", serialPorts[index].name);
            return index;
        }
    }
}

/** Getting serial port status.  */
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

controller.get('/listports', (req, res) => {
    res.json(serialPorts);
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

/**
 * open the port and start the serial port communication. 
 */
controller.put('/start', (req, res) => {

    const newOptions = req.body;



    if (serialPort.openPort()) {
        resultText = "openPort command succesfully runned.";
    } else {
        resultText = "openPort did not succesfully.";
    }
    res.json(resultText);
});

/**
 * stop the serial port communication, and close the port.
 */
controller.put('/stop', (req, res) => {

    if (serialPort.closePort()) {
        resultText = "closePort command successfully maked.";
    } else {
        resultText = "closePort did not successfully.";
    }

    res.json(resultText);
});


/**Create the new serial port object, and setting features. */
controller.put('/create', (req, res) => {

    const newOptions = req.body;

    let serialPortObject = { name: newOptions.name, options: newOptions, serialPortObject: null };

    console.debug("Create new name: ", serialPortObject.name);

    if (searchSerialPort(serialPortObject.name) == 0) {
        console.debug("Already exists the port: ", serialPortObject.name);
        res.status(500);
        res.json("Already exists the port: " + serialPortObject.name, 500);
    } else {
        if (newOptions.port) serialPort.portName = newOptions.port;
        if (newOptions.baudRate) serialPort.baudRate = newOptions.baudRate;
        if (newOptions.dataBits) serialPort.dataBits = newOptions.dataBits;
        if (newOptions.stopBits) serialPort.stopBits = newOptions.stopBits;
        if (newOptions.parity) serialPort.parity = newOptions.parity;
        if (newOptions.rtscts) serialPort.rtscts = newOptions.rtscts;
        if (newOptions.xon) serialPort.xon = newOptions.xon;
        if (newOptions.xoff) serialPort.xoff = newOptions.xoff;
        if (newOptions.xany) serialPort.xany = newOptions.xany;    
        console.debug(serialPortObject);
        insertSerialPort(serialPortObject)
    //    console.debug("Serial Ports: ", serialPorts);
        res.json(serialPortObject);
    }
});

module.exports = controller;