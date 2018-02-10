'use strict';

var cast = require('./cast');

exports.screens = function(req, res) {
  var returnedDevices = cast.findDevices().map(function(item) {
    return {
      'address': item.address,
      'name': item.name,
      'host': item.host,
      'port': item.port
    }
  });

  res.json(returnedDevices);
}

exports.content = function(req, res) {
  cast.setContent(req, res);
}
