/* global require */

// Configure Require.JS
// jscs:disable disallowQuotedKeysInObjects
require.config({
  paths: {
    'jquery': '../bower_components/jquery/jquery',
    'jquery-mobile': '../bower_components/jquery-mobile/jquery.mobile-1.4.5',
    'can': '../bower_components/canjs/amd/can',
    'chance': '../bower_components/chance/chance'
  },
  shim: {
    'jquery-mobile': {
      deps: ['jquery-mobile-config', 'jquery']
    }
  }
});
// jscs:enable disallowQuotedKeysInObjects

define(function(require, exports, module) {
  'use strict';

  var $ = require('jquery');
  require('jquery-mobile');
  var can = require('can');
  // Load the CanJS proxy plugin
  require('can/construct/proxy');
  var Controls = require('controls');
  var Models = require('models');

  var app = module.exports = {
    // Initialize the applications
    initialize: function() {
      // Bind to startup events
      document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    // Install the application
    install: function() {
      // Install all models
      return can.when.apply(can, can.map(Models, function(Model, name) {
        return Model.install();
      }));
    },

    // Load all models
    loadModels: function() {
      return can.when.apply(can, can.map(Models, function(Model, name) {
        var dfd = Model.findAll({});
        Model.list = new Model.List(dfd);
        Model.bind('created', function(event, model) {
          Model.list.push(model);
        });
        return dfd;
      }));
    },

    // "deviceready" event handler
    onDeviceReady: function() {
      console.log('Device is ready');
      app.install().done(function() {
        console.log('Models installed');
        app.loadModels().done(function() {
          console.log('Models loaded');

          // Create all application control instances
          [Controls.Contacts, Controls.EditContact].forEach(function(Control) {
            var controlName = can.hyphenate(Control.fullName).toLowerCase();
            var control = new Control('[data-control=' + controlName + ']', {}); // jshint ignore:line
          });

          // Initialize the jQuery Mobile widgets
          $.mobile.initializePage();

          // Load and activate the Navigator, which will setup routing and load the initial page
          var Navigator = require('navigator');
          Navigator.activate('contacts');

          console.log('Finished initialization');
        }).fail(function() {
          console.error('Failed to load models!');
        });
      }).fail(function() {
        console.error('Failed to install models!');
      });
    }
  };

  // Boot the application
  app.initialize();
});
