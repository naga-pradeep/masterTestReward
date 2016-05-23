/// <reference path="typings/_references.d.ts" />
//var newRelic = require("newrelic");
//var nani is king number 3
var express = require('express');
var http = require('http');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/routes');
var bunyan = require('bunyan');
var _ = require('lodash');
var auth = require('./auth/auth');
var passport = require("passport");
var helmet = require("helmet");
var hbs = require('express-hbs');
var csrfCrypto = require('csrf-crypto');
var app = express();
var config = require('./config/config.json');
app.locals.logging = (app.get('env') === 'development') ? [{ "level": "error", "stream": process.stdout }, { "level": "debug", "stream": process.stdout }, { "level": "info", "stream": process.stdout }] : [];
var logger = bunyan.createLogger({
    name: 'Application',
    streams: _.union(app.locals.logging, config.Logging.streams)
});
// Use `.hbs` for extensions and find partials in `views/partials`.
app.engine('hbs', hbs.express4({
    partialsDir: __dirname + '/views/partials'
}));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(csrfCrypto({ key: config.Application.csrfKey }));
app.use(function (request, response, next) {
    if (request.url.toLowerCase().indexOf("/order/success") > -1 || request.url.toLowerCase().indexOf("/order/cancel") > -1 || request.url.toLowerCase().indexOf("/order/error") > -1 || request.url.toLowerCase().indexOf("/orderprocessing/success") || request.url.toLowerCase().indexOf("/orderprocessing/cancel") || request.url.toLowerCase().indexOf("/orderprocessing/error")) {
        request.allowCsrf();
    }
    next();
});
app.use(csrfCrypto.enforcer());
app.use(helmet.hidePoweredBy({ setTo: 'R360 Rewards Platform' }));
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.frameguard('sameorigin'));
app.use(helmet.xssFilter());
app.use(helmet.ieNoOpen());
app.use(helmet.nocache());
var setupAuth = auth;
app.use('/app', express.static(path.join(__dirname, 'public')));
routes.setupRoutes(app);
/*
 // catch 404 and forward to error handler
 app.use(function(req, res, next) {
 var err = new Error('Not Found');
 next(err);
 });

 // error handlers

 // development error handler
 // will print stacktrace
 if (app.get('env') === 'development') {
 app.use(function(err, req, res, next) {
 res.status(err.status || 500);
 res.render('error', {
 message: err.message,
 error: err
 });
 });
 }

 // production error handler
 // no stacktraces leaked to user
 app.use(function(err, req, res, next) {
 res.status(err.status || 500);
 res.render('error', {
 message: err.message,
 error: {}
 });
 });
 */
var server = http.createServer(app);
server.listen(config.Application.Port, function () {
    logger.info("App server listening on port " + config.Application.Port);
});
