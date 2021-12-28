


function setupSerialPort() {

}

/**
 * 
 */

function MODBUSWriteHandle() {
  var addressOutputLine = document.getElementById("outAddress");
  var dataOutputLine = document.getElementById("outData");

  axios.put("http://localhost:3000/test/holding/set/" + addressOutputLine.value + "/" + dataOutputLine.value, { name: "data" }).then(function (response) {

      // do whatever you want if console is [object object] then stringify the response

      /*                var myRect = document.getElementById("LEDRECT");
                      myRect.style.stroke = "red";*/

  })
}

/**
 * 
 * @param {*} data 
 * @param {*} length 
 * @returns 
 */

function writeAndExpect(data, length) {
    return new Promise((resolve, reject) => {
      const buffer = new Buffer(length);
      this._port.write(data, (error) => {
        if (error) {
          reject(error);
          return;
        }
      });
      let offset = 0;
      let handler = (d) => {
        try {
          Uint8Array.from(d).forEach(byte => buffer.writeUInt8(byte, offset));
          offset += d.length;
        } catch (err) {
          reject(err);
          return;
        }
        if (offset === length) {
          resolve(buffer);
          this._port.removeListener("data", handler);
        };
      };
      this._port.on("data", handler);
    });
  }
