'use strict';

var cast = require('./cast');

exports.screens = function(req, res) {
  cast.findDevices(function(devices){
    res.send(devices);
  })
}

exports.content = function(req, res) {
  cast.setContent(req.body);
  res.sendStatus(200);
}
