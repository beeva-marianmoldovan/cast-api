'use strict';

var _                     = require('lodash');
var mdns                  = require('mdns-js');
var Client                = require('castv2-client').Client;
var Youtube               = require('youtube-castv2-client').Youtube;
var Web                   = require('castv2-web').Web;
var DefaultMediaReceiver  = require('castv2-client').DefaultMediaReceiver;
var async                 = require('async');
var options               = require('./options');

var devices = {};
var curatedDevices = [];

var browser = mdns.createBrowser('_googlecast._tcp');

browser.once('ready', function () {
  browser.discover();
});

browser.on('update', function (data) {
  if(!devices[data.addresses[0]] && getValueFromArray('ca', data.txt) === '4101'){
    
    devices[data.addresses[0]] = data;
    var newDevice = _.pick(data, ['host', 'port']);
    newDevice['address'] = data.addresses[0];
    
    if(data['host']){
      newDevice['name'] =  getValueFromArray('fn', data.txt);
      // One client by ChromeCast!
      newDevice['client'] = getClient(newDevice["address"]);
      curatedDevices.push(newDevice);
    }
  }
});

function getClient(address) {
  var client = new Client();
  client.connected = false;

  client.connect(address, function() {
    client.connected = true;
    launchPlayer(client, getCurrentContent(), function() {
      // No action required!!
    });
  });

  client.on('error', function() {
    // Client Error arises when the client has been swtiched off! 
    // So we can safely remove the chromecast from the list!! :)
    client.connected = false;
    client.close();
    curatedDevices = curatedDevices.filter(function(item) {
      return item.address != address;
    });
    delete devices[address];
  });

  return client;
}

function getCurrentContent() {
  var currentDate = new Date();
  var defaultContent = options.defaultContent;

  var actualSchedule = options.cronSchedule.find(function(item) {
    var parsedInitHour = parseHour(item.startTime);
    var parsedEndHour = parseHour(item.endTime);
    return currentDate >= parsedInitHour && currentDate <= parsedEndHour;
  });

  return actualSchedule != undefined ? actualSchedule["content"] : defaultContent;
}

function parseHour(rawHour) {
  var date = new Date();
  date.setHours(rawHour.split(":")[0]);
  date.setMinutes(rawHour.split(":")[1]);
  return date;
}

function getValueFromArray(key, list){
  for(var index in list){
    var value = list[index];
    if(value.startsWith(key)) return value.substr(3);
  }
}

exports.findDevices = function(callback){
  return curatedDevices;
}

exports.setContent = function setContent(req, res){

  var content = req.body;
  var filteredDevices = [];
  if(content.screen){
    curatedDevices.forEach(function(item){
      if(item.name.toLowerCase().indexOf(content.screen.toLowerCase()) > -1){
        filteredDevices.push(item);
      }
    });
  } else {
    filteredDevices = curatedDevices.slice(0);
  }

  async.forEach(filteredDevices, function(element, callback) {
    launchPlayer(element.client, content, callback);
  }, function(err) {

    if (err) {
      res.status(500).json({"errors": err});
    } else {
      res.status(200).json({"status": "OK!"});
    }

  });
}

function launchPlayer(client, content, callback){
  if (client.connected) {
    if(content.type === 'image' || content.type === 'video') {
      launchDefaultMediaPlayer(client, content, callback);
    } else if(content.type === 'youtube') {
      launchYoutube(client, content, callback);
    } else {
      launchWeb(client, content, callback);
    }
  } else {
    callback('ChromeCast is not connected...');
  }
}

exports.launchPlayer = launchPlayer;

function launchWeb(client, content, callback){
  client.launch(Web, function(err, manager) {
    if (!err) {
      callback();
      manager.load(content.content);
    } else {
      callback(err);
    }
  });
}

function launchYoutube(client, content, callback){
  client.launch(Youtube, function(err, manager) {
    if (!err) {
      manager.load(youtube_parser(content.content));
      callback();
    } else {
      callback(err);
    }
  });
}

function youtube_parser(url){
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    return (match&&match[7].length==11)? match[7] : false;
}

function launchDefaultMediaPlayer(client, content, callback){
  client.launch(DefaultMediaReceiver, function(err, player){
    var media = {
      // Here you can plug an URL to any mp4, webm, mp3 or jpg file with the proper contentType.
      contentId: content.content,
      // Title and cover displayed while buffering
      metadata: {
        type: 0,
        metadataType: 0,
        title: "OPENLABS",
        images: [
          { url: 'https://pbs.twimg.com/profile_images/452052193198104577/cARTCYW__400x400.png' }
        ]
      }
    };
    
    if (!err) {
      player.on('status', function(status) {
        console.log('status broadcast playerState=%s', status.playerState);
      });

      player.load(media, { autoplay: true, loop: 1  }, function(err, status) {
        console.log('media loaded playerState=%s', err, status);
      });

      callback();

    } else {
      callback(err);
    }
  });
}
