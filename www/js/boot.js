/* global require */

// Configure Require.JS
// jscs:disable disallowQuotedKeysInObjects
require.config({
  paths: {
    'jquery': '../bower_components/jquery/jquery',
    'jquery-mobile': '../bower_components/jquery-mobile/jquery.mobile-1.4.5',
    'can': '../bower_components/canjs/amd/can',
    'chance': '../bower_components/chance/chance',
    'es6-collections': '../bower_components/es6-collections/index'
  },
  shim: {
    'jquery-mobile': {
      deps: ['jquery-mobile-config', 'jquery']
    }
  }
});
// jscs:enable disallowQuotedKeysInObjects

define(function(require) {
  'use strict';

  // Load the es6-collections polyfill
  require('es6-collections');

  // Load and run the application
  var app = require('app');
  app.initialize();
});
