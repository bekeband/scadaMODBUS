
const serialPortObject = require('serialport');

var portName = 'COM2';
var baudRate = 9600;    /** The baud rate of the port to be opened. This should match one of the commonly available baud rates, such as 110, 300, 1200, 2400, 4800, 9600, 14400, 
                        19200, 38400, 57600, or 115200. Custom rates are supported best effort per platform. The device connected to the serial port is not guaranteed to 
                        support the requested baud rate, even if the port itself supports that baud rate.*/ 
var dataBits = 8;       // Must be one of these: 8, 7, 6, or 5.
var stopBits = 1;       // Must be one of these: 1 or 2.
var parity = "none";      // Must be one of these: 'none', 'even', 'mark', 'odd', 'space'.
var rtscts = false;     // flow control setting
var xon = false;        // flow control setting
var xoff = false;       //
var xany = false;       //

/**Don't open the port automatically. */
var port = new serialPortObject(portName, { autoOpen: false, baudRate: baudRate });
//var port = null;

var attemptTimeout;

/**
 * 
 * @returns 
 */

function openPort() {
    port.open(function (err) {

        console.log('Port is not open: ' + err.message);
        return false;
        //        attemptTimeout = setTimeout(openPort, 10000); // next attempt to open after 10s
    });
}

function closePort() {
    if (port.isOpen) {
        port.close();
    }
}

port.on('open', function () {
    //    function send() {
    if (port.isOpen) {
        return console.log('Port is opened.');
    } else {
        return console.log('Port closed. Data is not sent.');
    }


    /*        port.write(123, function (err) {
                if (err)
                    console.log('Error on write: ' +  err.message)
    
                port.drain(() => console.log('DONE'));
            });*/
    //    }

    //    setInterval(send, 1000);
});

port.on('close', function () {
    console.log('CLOSE');
    /* Clear the timeout intervel. */
    //    clearTimeout(attemptTimeout);
    //    open(); // reopen 
});

function isOpenPort() {
    return port.isOpen;
}
module.exports = { openPort, closePort, portName, baudRate, dataBits, stopBits, parity, rtscts, xon, xoff, xany, isOpenPort};