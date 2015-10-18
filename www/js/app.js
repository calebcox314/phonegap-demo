/* global System */

'use strict';

// Load jQuery and configure and load jQuery Mobile
import $ from 'jquery';
import './jquery-mobile-config';

// Load CanJS and globally used plugins
import can from 'can';
import 'can/construct/proxy';
import 'can/map/backup';

import Controls from './controls';
import Models from './models';
import Navigator from './navigator';
import TransactionMonitor from './transaction-monitor';
import { register as registerPlugin } from './plugins';

// Load the configuration file
import config from 'config.json';

const app = {
  // Initialize the applications
  initialize() {
    // Bind to startup events
    document.addEventListener('deviceready', this.onDeviceReady, false);
  },

  // Load all plugins
  loadPlugins() {
    return Promise.all(config.plugins.map(pluginName => {
      console.log(`Loading plugin ${pluginName}`);
      return System.import(`./plugins/${pluginName}/main`).then(module => {
        const plugin = module.default;

        // Register the plugin with the system
        registerPlugin(pluginName, plugin);

        // Run the plugin's initialize method if it exists
        // If the initialize function returns a promise, the promise returned by loadPlugins will
        // not resolve until that promise resolves as well
        if (can.isFunction(plugin.initialize)) {
          return plugin.initialize();
        }
      });
    }));
  },

  // Install the application
  install() {
    // Install all models
    return Promise.all(can.map(Models, (Model, name) => Model.install()));
  },

  // Load all models
  loadModels() {
    return Promise.all(can.map(Models, (Model, name) => {
      const dfd = Model.findAll({});
      Model.list = new Model.List(dfd);
      Model.bind('created', (event, model) => Model.list.push(model));

      // HACK: CanJS does not automatically remove destroyed models from the
      // list without this hack
      Model.list.bind('remove', () => {});

      return dfd;
    }));
  },

  // "deviceready" event handler
  onDeviceReady() {
    console.log('Device is ready');
    app.loadPlugins().then(() => {
      console.log('Plugins loaded');
      return app.install();
    }).then(() => {
      console.log('Models installed');
      return app.loadModels();
    }).then(() => {
      console.log('Models loaded');

      // Create all application control instances
      can.each(Controls, Control => {
        const controlName = can.hyphenate(Control.fullName).toLowerCase();
        const control = new Control('[data-control=' + controlName + ']', {}); // jshint ignore:line
      });

      // Initialize the jQuery Mobile widgets
      $.mobile.initializePage();

      // Activate the Navigator, which will setup routing and load the initial page
      Navigator.activate('contacts');

      // Initialize the transaction monitor
      const monitoredModels = [];
      can.each(Models, Model => {
        if (Model.monitorTransactions) {
          monitoredModels.push(Model.fullName);
        }
      });
      app.transactionMonitor = new TransactionMonitor({ monitoredModels });
      console.log('Finished initialization');
    });
  },
};

export default app;
