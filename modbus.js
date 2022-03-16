

/* Serial port open */
const SerialPort = require('serialport');
const util = require('util');

const port = new SerialPort('COM2')

/**
 * Max outbuffer size.
 */

const MODBUS_OUT_BUFFER_SIZE = 50;


/** 
 * Outbuffer to serial port 
 * */

 const outBuffer = []; // = Buffer.alloc(MODBUS_OUT_BUFFER_SIZE);

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

const MODBUS_ERROR_CODE_SHIFT = 0x80;


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
 

/**
 * 
 * @param {*} input1 
 * @param {*} input2 
 * @returns 
 */

 function isEqualBuffers(input1, input2) {
    result = false;
    if ((input1.length === input2.length) && (input1.length > 0)) {
        for (i = 0; i < input1.length - 1; i++) {
            if (input1[i] === input2[i]) {
                result = true;
            }
        }
    }
    return result;
}

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



module.exports = { processData };