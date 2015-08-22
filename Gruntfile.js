/* global __dirname, module, require */

module.exports = function(grunt) {
  'use strict';

  // Project configuration
  var srcFiles = ['Gruntfile.js', 'www/js/**/*.js'];
  grunt.initConfig({
    jshint: {
      src: srcFiles,
      options: {
        jshintrc: true,
      },
    },

    jscs: {
      src: srcFiles,
    },

    watch: {
      files: srcFiles,
      tasks: ['jshint', 'jscs'],
    },
  });

  // Load grunt plugins
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-jscs');

  // This custom task starts a simple express server that allows the application to be run in a browser for rapid development
  grunt.registerTask('serve', 'Start server for browser-based app', function(port) {
    // This task is asynchronous and never completes (it must be terminated by manually terminating the grunt process)
    var done = this.async(); // jshint ignore:line

    var express = require('express');
    var bodyParser = require('body-parser');
    var app = express();
    app.use(bodyParser.json()); // for parsing application/json

    // Log all GET requests
    app.get('*', function(req, res, next) {
      grunt.log.writeln(req.url);
      next();
    });

    // The core of this express server is a simple static file server. It serves BOTH the www/ and platforms/<platform>/www/
    // directories to the same /<platform>/www/ route. This efficiently emulates the behavior of "cordova serve" without the
    // inconvenience of having to run "cordova prepare <platform>" after every file modification.
    var path = require('path');
    var projectRoot = __dirname;
    var wwwRoute = express.static(path.join(projectRoot, 'www'));
    ['browser', 'ios', 'android'].forEach(function(platform) {
      var platformPath = '/' + platform + '/www/';
      app.use(platformPath, wwwRoute);
      app.use(platformPath, express.static(path.join(projectRoot, 'platforms', platform, 'www')));
    });

    var transactions = [];
    app.post('/sync', function(req, res) {
      var lastSyncTimestamp = req.body.lastSyncTimestamp;
      var now = Date.now();
      res.send({
        status: 'success',
        data: {
          lastSyncTimestamp: now,
          transactionLog: transactions.filter(function(transaction) {
            return transaction.timestamp === null || transaction.timestamp > lastSyncTimestamp;
          }),
        },
      });
      req.body.transactionLog.forEach(function(transaction) {
        transaction.timestamp = now;
        transactions.push(transaction);
      });

      console.log(transactions);
    });

    // Print the list of transactions
    app.get('/sync/dump', function(req, res) {
      res.json({ transactions: transactions });
    });

    // Clear the list of transactions
    app.get('/sync/reset', function(req, res) {
      transactions = [];
      res.send('Cleared transaction list');
    });

    // Listen on the provided port, defaulting to 8000
    var server = app.listen(port || 8000, function() {
      var serverPort = server.address().port;
      grunt.log.ok('Started app browser server running on port %s', serverPort);
      grunt.log.ok('Run from http://localhost:%s/browser/www/', serverPort);
    });
  });

  // Define default task
  grunt.registerTask('default', ['jshint', 'jscs']);
};
