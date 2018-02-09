'use strict';

var _ = require('lodash');
var mdns = require('mdns-js');
var Client                = require('castv2-client').Client;
var Youtube               = require('youtube-castv2-client').Youtube;
var Web                   = require('castv2-web').Web;
var DefaultMediaReceiver  = require('castv2-client').DefaultMediaReceiver;

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
      curatedDevices.push(newDevice);
    }
  }
});

function getValueFromArray(key, list){
  for(var index in list){
    var value = list[index];
    if(value.startsWith(key)) return value.substr(3);
  }
}

exports.findDevices = function(callback){
  callback(curatedDevices);
}

exports.setContent = function setContent(content){
  var filteredDevices = [];
  if(content.screen){
    curatedDevices.forEach(function(item){
      if(item.name.toLowerCase().indexOf(content.screen.toLowerCase()) > -1){
        filteredDevices.push(item);
      }
    });
  }
  else filteredDevices = curatedDevices.slice(0);
  filteredDevices.forEach(function(item){
    var client = new Client();
    client.connect(item.address, function() {
      launchPlayer(client, content);
      client.on('error', function(err) {
        client.close();
      });
    });
  });
}

function launchPlayer(client, content){
  if(content.type === 'image' || content.type === 'video')
    launchDefaultMediaPlayer(client, content);
  else if(content.type === 'youtube')
    launchYoutube(client, content);
  else launchWeb(client, content);
}

function launchWeb(client, content){
  client.launch(Web, function(err, manager) {
    if (!err) {
      manager.load(content.content);
    }
  });
}

function launchYoutube(client, content){
  client.launch(Youtube, function(err, manager) {
    if (!err) {
      manager.load(youtube_parser(content.content));
    }
  });
}

function youtube_parser(url){
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    return (match&&match[7].length==11)? match[7] : false;
}

function launchDefaultMediaPlayer(client, content){
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
    }
  });
}
