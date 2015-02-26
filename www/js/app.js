// Configure Require.JS
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

define(function(require) {
  'use strict';

  var $ = require('jquery');
  var jqm = require('jquery-mobile');
  var can = require('can');
  // Load the CanJS proxy plugin
  require('can/construct/proxy');
  var Controls = require('controls');
  var Models = require('models');

  var app = {
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

          // Initialize CanJS routing
          require('routes').setupRoutes();
          can.route.bind('page', function(event, page) {
            // Navigate to the new page whenever the active page changes
            app.navigateToPage(page);
          });

          // Create all application control instances
          var contactsControl = new Controls.Contacts('[data-control=contacts]', {});
          var editContactControl = new Controls.EditContact('[data-control=edit-contact]', {});

          // Initialize the jQuery Mobile widgets
          $.mobile.initializePage();

          // This will load the initial page, and therefore must be called after jQuery Mobile has been initialized
          can.route.ready();

          if (!can.route.attr('page')) {
            // Load the initial page
            location.hash = can.route.url({ page: 'contacts' });
          }

          console.log('Finished initialization');
        }).fail(function() {
          console.error('Failed to load models!');
        });
      }).fail(function() {
        console.error('Failed to install models!');
      });
    },

    navigateToPage: function(pageId) {
      $(':mobile-pagecontainer').pagecontainer('change', '#' + pageId, { changeHash: false });
    }
  };

  // Boot the application
  app.initialize();

  return app;
});
