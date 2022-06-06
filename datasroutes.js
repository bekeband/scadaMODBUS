
/**
 * dataroutes route the all datas reading or witing require.
 */

const express = require('express');
const modbus = require('./modbus');
const controller = express.Router();

/**datas routes file. */

controller.get('/', (req, res) => {

    var currentModbusCommand = req.body.code;
    console.debug("Current MODBUS command = ", currentModbusCommand); 

//    modbus.assemblyTwoWordsCommand(modbusDeviceAddress, currentModbusCommand, req.body.start_address, req.body.quantity);

//    console.debug("WRITEBUFFER = ", outBuffer); 

    switch (currentModbusCommand) {

        case modbus.READ_COILS: 
        var start_address = req.body.start_address;
        console.debug("start_address = ", start_address); 
        var quantity = req.body.quantity;
        console.debug("quantity = ", quantity); 


//        modbus.getDatas();
        break;
    }

    res.json("DATAS GET COMMAND.");
});

controller.put('/coils', (req, res) => {
    console.log(req.body);
    res.json("DATAS PUT COMMAND RESPONSE.");
});

//

module.exports = controller;