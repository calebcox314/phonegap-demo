'use strict';

// Load jQuery and configure and load jQuery Mobile
import $ from 'jquery';
import './jquery-mobile-config';

// Load CanJS and globally used plugins
import can from 'can';
import 'can/construct/proxy';

import Controls from './controls';
import Models from './models';
import Navigator from './navigator';
import TransactionMonitor from './transaction-monitor';

const app = {
  // Initialize the applications
  initialize() {
    // Bind to startup events
    document.addEventListener('deviceready', this.onDeviceReady, false);
  },

  // Install the application
  install() {
    // Install all models
    return can.when.apply(can, can.map(Models, function(Model, name) {
      return Model.install();
    }));
  },

  // Load all models
  loadModels() {
    return can.when.apply(can, can.map(Models, function(Model, name) {
      const dfd = Model.findAll({});
      Model.list = new Model.List(dfd);
      Model.bind('created', function(event, model) {
        Model.list.push(model);
      });

      // HACK: CanJS does not automatically remove destroyed models from the
      // list without this hack
      Model.list.bind('remove', function() {});

      return dfd;
    }));
  },

  // "deviceready" event handler
  onDeviceReady() {
    console.log('Device is ready');
    app.install().done(function() {
      console.log('Models installed');
      app.loadModels().done(function() {
        console.log('Models loaded');

        // Create all application control instances
        [Controls.Contacts, Controls.EditContact].forEach(function(Control) {
          const controlName = can.hyphenate(Control.fullName).toLowerCase();
          const control = new Control('[data-control=' + controlName + ']', {}); // jshint ignore:line
        });

        // Initialize the jQuery Mobile widgets
        $.mobile.initializePage();

        // Activate the Navigator, which will setup routing and load the initial page
        Navigator.activate('contacts');

        // Initialize the transaction monitor
        app.transactionMonitor = new TransactionMonitor({ monitoredModels: ['Contact'] });

        console.log('Finished initialization');
      }).fail(function() {
        console.error('Failed to load models!');
      });
    }).fail(function() {
      console.error('Failed to install models!');
    });
  },
};

export default app;
