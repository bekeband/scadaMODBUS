

var express = require('express');
const { json } = require('express/lib/response');
var app = express();
var PORT = 3000;

let cors = require("cors");
app.use(cors());

/* Serial port open */
const SerialPort = require('serialport');

SerialPort.list().then(

    ports => ports.forEach(port => console.log(port.path, port.manufacturer)),
    err => console.log(err)
)

const port = new SerialPort('COM2')

/**
 * Max outbuffer size.
 */

const MODBUS_OUT_BUFFER_SIZE = 50;
/** 
 * Outbuffer to serial port 
 * */

const outBuffer = Buffer.alloc(MODBUS_OUT_BUFFER_SIZE);

// Compute the MODBUS RTU CRC
function ModRTU_CRC(buf, len) {
    var crc = 0xFFFF;

    for (pos = 0; pos < len; pos++) {
        crc ^= buf[pos];          // XOR byte into least sig. byte of crc

        for (i = 8; i != 0; i--) {    // Loop over each bit
            if ((crc & 0x0001) != 0) {      // If the LSB is set
                crc >>= 1;                    // Shift right and XOR 0xA001
                crc ^= 0xA001;
            }
            else                            // Else LSB is not set
                crc >>= 1;                    // Just shift right
        }
    }
    // Note, this number has low and high bytes swapped, so use it accordingly (or swap bytes)
    return parseInt(crc);
}
/* MODBUS function codes. */
const READ_COILS = 0x01;
const READ_DISCRETE_INPUTS = 0x02;
const READ_HOLDING_REGISTERS = 0x03;
const READ_INPUT_REGISTERS = 0x04;
const WRITE_SINGLE_COIL = 0x05;
const WRITE_SINGLE_REGISTER = 0x06;
const READ_EXCEPTION_STATUS = 0x07;
const GET_COMM_EVENT_COUNTER = 0x0B;
const GET_COMM_EVENT_LOG = 0x0C;
const WRITE_MULTIPLE_COILS = 0x0F;
const WRITE_MULTIPLE_REGISTERS = 0x10;
const REPORT_SERVER_ID = 0x11;
const READ_FILE_RECORD = 0x14;
const WRITE_FILE_RECORD = 0x15;
const MASK_WRITE_REGISTER = 0x16;
const READ_WRITE_MULTIPLE_REGISTERS = 0x17;
const READ_FIFO_QUEUE = 0x18;
const ENCAPSULATED_INTERFACE_TRANSPORT = 0x2B;

modbusDeviceAddress = 1;

const MAX_READ_TRYCOUNT = 0;

/**
 * @param {*} buffer
 * @param {*} deviceAddress 
 * @param {*} functionCode 
 */

function makeCommandBuffer(buffer, deviceAddress, functionCode) {
    var i;
    var bufferPtr = 0;
    buffer[bufferPtr++] = deviceAddress;
    buffer[bufferPtr++] = functionCode;
    /** getting arguments from argument list.  */
    for (i = 3; i < arguments.length; i++) {
        buffer[bufferPtr++] = (arguments[i] >>> 8) & 0xFF;
        buffer[bufferPtr++] = arguments[i] & 0xFF;
        //        console.log("arguments[" + i + "] = ", arguments[i]);
    }
    return bufferPtr;
}
/**
 * 
 * @param {*} buffer 
 * @param {*} nextData 
 * @returns 
 */
function storeCRCOnBufferTail(buffer, nextData) {
    var CRC = ModRTU_CRC(buffer, nextData);
    outBuffer[nextData++] = CRC & 0xFF;
    outBuffer[nextData++] = (CRC >>> 8) & 0xFF;
    return nextData;
}

/**
 * 
 * @param {*} deviceAddress 
 * @param {*} commandCode 
 * @param {*} firstWord 
 * @param {*} secondWord 
 */

function assemblyTwoWordsCommand(deviceAddress, commandCode, firstWord, secondWord) {
    nextData = makeCommandBuffer(outBuffer, deviceAddress, commandCode, firstWord, secondWord);
    storeCRCOnBufferTail(outBuffer, nextData);
}

/**
 * @param {*} deviceAddress 
 * @param {*} regAddress 
 * @param {*} value 
 */
function assemblyWriteRegisterCommand(deviceAddress, regAddress, value) {
    nextData = makeCommandBuffer(outBuffer, deviceAddress, WRITE_SINGLE_REGISTER, regAddress, value);
    storeCRCOnBufferTail(outBuffer, nextData);
}

// Open errors will be emitted as an error event
port.on('error', function (err) {
    console.log('Error: ', err.message)
})

/**Processing readed datas. */
/**
 * 
 * @param {*} readBuffer   The reading datas.
 * @returns 
 */
function processData(readBuffer) {
//    console.log("READBUFFER = ", readBuffer);
    if (readBuffer.length > 2) {
        CRCLength = readBuffer.length - 2;
        var CRC = ModRTU_CRC(readBuffer, CRCLength);

        if (((CRC & 0xFF) == readBuffer[readBuffer.length - 2]) && ((CRC >>> 8) & 0xFF) == readBuffer[readBuffer.length - 1]) {
            //      console.log('CRC LO = ', (CRC & 0xFF))
            //      console.log("CRC HI = ", (CRC >>> 8) & 0xFF);
//            console.log("Reading data\'s CRC OK")
            return true;
        } else {
//            console.log("Bad CRC of Reading data\'s")
            return false;
        }

    } else {
//        console.log("readBuffer.length <= 2)")
        return false;
    }
    return false;
}

/**App.get get the MODBUS register data. These are read commands. */

app.get('/:reg_type/:address/:quantity', function (req, res, next) {

    p = new Promise((resolve, reject) => {
        
        if (req.params.reg_type === "RC") {
            /**Read coils. */
            assemblyTwoWordsCommand(modbusDeviceAddress, READ_COILS, req.params.address, req.params.quantity);
        } else
        /**Read discrete inputs.  */
        if (req.params.reg_type === "RDI") {
            assemblyTwoWordsCommand(modbusDeviceAddress, READ_DISCRETE_INPUTS, req.params.address, req.params.quantity);
        } else 
        /**Read input registers. */
        if (req.params.reg_type === "RIR") {
            assemblyTwoWordsCommand(modbusDeviceAddress, READ_INPUT_REGISTERS, req.params.address, req.params.quantity);
        } else         
        if (req.params.reg_type === "RHR") {
            /**Read holding registers. */
            assemblyTwoWordsCommand(modbusDeviceAddress, READ_HOLDING_REGISTERS, req.params.address, req.params.quantity);
        };
//        assemblyReadHoldingRegistersCommand(modbusDeviceAddress, req.params.address, req.params.quantity);
//     console.log("WRITEBUFFER = ", outBuffer);    

        /**Write MODBUS outbuffer to serial. */
        port.write(outBuffer);

        /**Read the answer.  */
        port.once('data', (data) => {
            /**Process the reading datas. */
            if (processData(data)) {
                resolve(data);

            }

        });

        port.once('error', (err) => {
            reject(err);
        });
    });

    p.then((data) => {

//        console.log("READBUFFER AWAIT = ", data);
//        console.log('address', req.params.address);

        var dataTable = [];

        var regLength = data[2];
        for (j = 0; j < (regLength / 2); j++) {
            var valHi = data[3 + (j * 2)];
            var valLow = data[4 + (j * 2)];
            var readValue = (valHi * 256) + valLow;

            var obj = {
                register: +req.params.address + j,
                value: readValue
            }
            dataTable.push(obj);

        }
        console.log("dataTable = ", dataTable);

        res.json(dataTable)
        res.end();

    });

});

/**App.put set the MODBUS address register data. Theses are the write commands.*/
app.put('/test/holding/set/:address/:value', function (req, res, next) {

    console.log('address', req.params.address);
    console.log('value', req.params.value);

    p = new Promise((resolve, reject) => {
        assemblyWriteRegisterCommand(modbusDeviceAddress, req.params.address, req.params.value);
        console.log("WRITEBUFFER = ", outBuffer);
        /**Write MODBUS outbuffer to serial. */
        port.write(outBuffer);
        port.once('error', (err) => {
            reject(err);
        });
    });

    res.end();
})

app.listen(PORT, function (err) {
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
});
