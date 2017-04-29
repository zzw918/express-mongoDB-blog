var express = require("express");
var path = require("path");
var app = express();

module.exports =  app;

var route = require('./routes/index.js');
app.use('/', route);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

