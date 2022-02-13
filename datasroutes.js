const express = require('express');
const controller = express.Router();



/**datas routes file. */

controller.get('/', (req, res) => {
    res.json("DATAS GET COMMAND.");
});

controller.put('/', (req, res) => {
    console.log(req.body);
    res.json("DATAS PUT COMMAND RESPONSE.");
});

//

module.exports = controller;