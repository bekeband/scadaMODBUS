const express = require('express');
const modbus = require('./modbus');
const controller = express.Router();
const modbus = require('./modbus');

/**datas routes file. */

controller.get('/', (req, res) => {

    var code = req.body.code;
    switch (code) {
        case modbus.READ_COILS: 
        var start_address = req.body.start_address;
        var quantity = req.body.quantity;
        modbus.getDatas();
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