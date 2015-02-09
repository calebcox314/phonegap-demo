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
  var Components = require('components');
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

          // Render the main application template
          $('div#app').append(can.view('app-main', {}));
          $('div#edit-contact').append(can.view('app-contact', {}));

          // Links with a data-rel="back" attribute function as "back" buttons
          $('body').on('click', 'a[data-rel=back]', function() {
            window.history.back();
          });

          // Initialize the jQuery Mobile widgets
          $.mobile.initializePage();

          // This will load the initial page, and therefore must be called after jQuery Mobile has been initialized
          can.route.ready();

          // Load the ChanceJS library
          var Chance = require('chance');
          var chance = new Chance();

          setInterval(function() {
            var nameParts = chance.name().split(' ');
            var contact = new Contact({
              first_name: nameParts[0],
              last_name: nameParts[1],
              email_address: nameParts.join('.').toLowerCase() + '@gmail.com',
              phone_number: chance.phone()
            });
            contact.save();
          }, 5000);

          console.log('Finished initialization');
        }).fail(function() {
          console.error('Failed to load models!');
        });
      }).fail(function() {
        console.error('Failed to install models!');
      });
    },

    navigateToPage: function(pageId) {
      $(':mobile-pagecontainer').pagecontainer('change', '#' + (pageId || 'main'), { changeHash: false });
    }
  };

  // Boot the application
  app.initialize();

  return app;
});
