const express = require('express');
const controller = express.Router();
const modbus = require('./modbus');

/**datas routes file. */

controller.get('/coils', (req, res) => {

    var currentModbusCommand;
    p = new Promise((resolve, reject) => {

        currentModbusCommand = getCommandCode(req.params.reg_type);

        assemblyTwoWordsCommand(modbusDeviceAddress, currentModbusCommand, req.params.address, req.params.quantity);
        //  console.log("WRITEBUFFER = ", outBuffer);    

        /**Write MODBUS outbuffer to serial. */
        port.write(outBuffer);

        port.on('data', (data) => {
            if (modbus.processData(data)) {
                resolve(data);
            }
        });

        port.on('error', (err) => {
            reject(err);
        });
    });

    //    p.then(readSerial(data));

    p.then((data) => {

        //        console.log("READBUFFER AWAIT = ", data);
        //        console.log('address', req.params.address);

        var dataTable = [];
        var errorString;
        if (modbusDeviceAddress != data[0]) {

            res.json("Response with wrong MODBUS address.");
            res.end();
        }
        if (currentModbusCommand === data[1]) {

            if (currentModbusCommand <= READ_DISCRETE_INPUTS) {
                dataTable = makeByteDataTable(data, req);
            } else {
                dataTable = makeWordDataTable(data, req);
            }

            console.log("dataTable = ", dataTable);
            res.json(dataTable)
            res.end();
        } else {
            errorString = getErrorCodeString(currentModbusCommand, data);
            res.json(errorString);
            res.end();
        };
    });
});

controller.put('/coils', (req, res) => {
    console.log(req.body);
    res.json("DATAS PUT COMMAND RESPONSE.");
});

//

module.exports = controller;