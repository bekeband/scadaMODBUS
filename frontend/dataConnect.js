


function setupSerialPort() {

}

function StartDataRead() {

}

function EndDataRead() {
  
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
 * @param {*} readHoldingRegisterStartAddress   The Holding start register address.
 * @param {*} readHoldingRegistersQuantity   Quantity the consequent registers.
 * @returns 
 */
async function fetchAsync(readHoldingRegisterStartAddress, readHoldingRegistersQuantity) {

  urlSTring = "http://localhost:3000/test/holding/get/" + readHoldingRegisterStartAddress + "/" + readHoldingRegistersQuantity;

  var result;

  try {

      let response = await fetch(urlSTring);
      result = await response.json();

  } catch (error) {
      console.error(error);
      return null;
  };

  var resultsList = document.getElementById("resultsList");
  resultsList.innerHTML = '';

  for (i = 0; i < result.length; i++) {

      var address = Number(readHoldingRegisterStartAddress) + i;
      var resultValue = result[i].value;
      resultsList.innerHTML += `<li> Data[${address}] = ${resultValue} </li>`;
  }
  return result;
}
