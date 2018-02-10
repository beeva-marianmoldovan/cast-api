'use strict'

var express = require('express');
var bodyParser = require('body-parser')

var app = express();
var controller = require('./controller');
var cron = require('./cron');

app.use(bodyParser.json())
app.get('/screens', controller.screens);
app.post('/content', controller.content);

app.listen(process.env.PORT || 3000);

cron.scheduleCrons();
