/* global __dirname, module, require */

module.exports = function(grunt) {
  'use strict';

  // Project configuration
  var srcFiles = ['Gruntfile.js', 'www/js/**/*.js'];
  grunt.initConfig({

    jshint: {
      src: srcFiles,
      options: {
        jshintrc: true
      }
    },

    jscs: {
      src: srcFiles,
      options: {
        preset: 'airbnb'
      }
    },

    watch: {
      files: srcFiles,
      tasks: ['jshint', 'jscs']
    }
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
    var app = express();

    // Log all GET requests
    app.get('*', function(req, res, next) {
      grunt.log.writeln(req.url);
      next();
    });

    // The core of this express server is a simple static file server. It serves BOTH the www/ and platforms/browser/www/
    // directories to the same /browser/www/ route. This efficiently emulates the behavior of "cordova serve" without the
    // inconvenience of having to run "cordova prepare browser" after every file modification.
    var path = require('path');
    var projectRoot = __dirname;
    app.use('/browser/www/', express.static(path.join(projectRoot, 'www')));
    app.use('/browser/www/', express.static(path.join(projectRoot, 'platforms', 'browser', 'www')));

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
