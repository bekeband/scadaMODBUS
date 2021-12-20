var express = require('express');
var app = express();
var PORT = 3000;

/* Serial port open */
const SerialPort = require('serialport');

SerialPort.list().then(

    ports => ports.forEach(port => console.log(port.path, port.manufacturer)),
    err => console.log(err)
)

const port = new SerialPort('COM2')

/* Outbuffer to serial port */

const outBuffer = Buffer.from([0x01, 0x03, 0x00, 0x00, 0x00, 0x0A, 0xC5, 0xCD]);

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
/* MODBUF function codes. We use the 03, and 06 fiunctions now. The 03 function's register count is one for simplicity. */

const READ_COILS_FUNCTION_CODE = 0x01;
const READ_DISCRETE_INPUTS_FUNCTION_CODE = 0x02;
const READ_HOLDING_REGISTERS_FUNCTION_CODE = 0x03;
const READ_INPUT_REGISTERS_FUNCTION_CODE = 0x04;
const WRITE_SINGLE_COIL_FUNCTION_CODE = 0x05;
const WRITE_SINGLE_REGISTER_FUNCTION_CODE = 0x06;
const READ_EXCEPTIOS_STATUS_CODE = 0x07;
const DIAGNOSTIC_CODE = 0x08;
const GET_COMM_EVENT_CODE = 0x0B;
const GET_COMM_EVENT_LOG = 0x0C;
const MODBUS_DEVICE_ADDRESS = 1;

const MAX_READ_TRYCOUNT = 0;


function assemblyCommandBufferHeader(deviceAddress, functionCode) {
    
} 

function assemblyWriteRegisterCommand(deviceAddress, regAddress, value) {
    outBuffer[0] = deviceAddress;
    outBuffer[1] = WRITE_SINGLE_REGISTER_FUNCTION_CODE;
    outBuffer[2] = (regAddress >>> 8) & 0xFF;
    outBuffer[3] = regAddress & 0xFF;
    outBuffer[4] = (value >>> 8) & 0xFF;
    outBuffer[5] = value & 0xFF;
    var CRC = ModRTU_CRC(outBuffer, 6);
    outBuffer[6] = CRC & 0xFF;
    outBuffer[7] = (CRC >>> 8) & 0xFF;
}

function assemblyReadHoldingRegistersCommand(deviceAddress, startAddress) {
    outBuffer[0] = deviceAddress;
    outBuffer[1] = READ_HOLDING_REGISTERS_FUNCTION_CODE;
    outBuffer[2] = (startAddress >>> 8) & 0xFF;
    outBuffer[3] = startAddress & 0xFF;
    outBuffer[4] = 0;
    outBuffer[5] = 1;
    //  outBuffer[4] = (regQuantity >>> 8) & 0xFF;
    //  outBuffer[5] = regQuantity & 0xFF;
    var CRC = ModRTU_CRC(outBuffer, 6);
    outBuffer[6] = CRC & 0xFF;
    outBuffer[7] = (CRC >>> 8) & 0xFF;

}

// Open errors will be emitted as an error event
port.on('error', function (err) {
    console.log('Error: ', err.message)
})

/**Processing readed datas. */
function processData(readBuffer) {
    console.log("READBUFFER = ", readBuffer);
    if (readBuffer.length > 2) {
      CRCLength = readBuffer.length - 2;
      var CRC = ModRTU_CRC(readBuffer, CRCLength);
  
      if (((CRC & 0xFF) == readBuffer[readBuffer.length - 2]) && ((CRC >>> 8) & 0xFF) == readBuffer[readBuffer.length - 1]) {
        //      console.log('CRC LO = ', (CRC & 0xFF))
        //      console.log("CRC HI = ", (CRC >>> 8) & 0xFF);
        console.log("Reading data\'s CRC OK")
        return true;
      } else {
        console.log("Bad CRC of Reading data\'s")
        return false;
      }
  
    } else {
      console.log("readBuffer.length <= 2)")
      return false;
    }
    return false;
    //  resolve(data);
  }

/**App.get get the MODBUS register data. */

app.get('/test/holding/get/:address', function (req, res, next) {

    p = new Promise((resolve, reject) => {
        assemblyReadHoldingRegistersCommand(MODBUS_DEVICE_ADDRESS, req.params.address);
        console.log("WRITEBUFFER = ", outBuffer);
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

        console.log("READBUFFER AWAIT = ", data);
        console.log('address', req.params.address);

        var valHi = data[3 + (0 * 2)];
        var valLow = data[4 + (0 * 2)];
        var readValue = (valHi * 256) + valLow;
        res.json({ register: req.params.address, value: readValue })
        res.end();
    });

});

/**App.put set the MODBUS address register data. */
app.put('/test/holding/set/:address/:value', function (req, res, next) {

    console.log('address', req.params.address);
    console.log('value', req.params.value);

    p = new Promise((resolve, reject) => {
        assemblyWriteRegisterCommand(MODBUS_DEVICE_ADDRESS, req.params.address, req.params.value);
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