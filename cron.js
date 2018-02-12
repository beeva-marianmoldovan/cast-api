var cast = require('./cast');
var options = require('./options');
var schedule = require('node-schedule');

var scheduleCrons = function() {

  options.cronSchedule.forEach(function(item) {
    schedule.scheduleJob(getScheduleString(item.startTime), function() {
      castToAllDevices(item.content);
    });

    schedule.scheduleJob(getScheduleString(item.endTime), function(item) {
      castToAllDevices(options.defaultContent);
    });
  });
};

function getScheduleString(time) {
  var minute = time.split(":")[1];
  var hour = time.split(":")[0];
  return minute + " " + hour + " * * *";
}

function castToAllDevices(content) {
  cast.findDevices().forEach(function(device) {
    cast.launchPlayer(device.client, content, function() {
      // No action required...
    });
  });
}

exports.scheduleCrons = scheduleCrons;
