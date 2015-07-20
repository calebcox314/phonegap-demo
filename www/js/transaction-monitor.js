define(function(require) {
  'use strict';

  /*
   * A TransactionMonitor instance records transactions on models and can play back a recorded list of
   * transactions. It is intended to be used as part of an online database synchronization mechanism.
   *
   * When instantiated, each TransactionMonitor instance is given a list of models that it will
   * monitor. It binds to create, update, and destroy events on this model. Each time an event is
   * triggered, it stores in a persisted list of transactions all the information necessary to
   * reproduce the operation. That list of recorded transactions can then be played back at a later
   * time to reproduce all modifications made to the monitored models.
   *
   * Although this is not enforced, it probably only makes sense for an application to have a single
   * transaction instance. Also, events bound on the monitored models are not unbound, which could
   * introduce a memory leak unless the TransactionMonitor instance lasts for the entire duration of
   * the application.
   */

  var models = require('models');

  var can = require('can');
  return can.Construct.extend('TransactionMonitor', {
    /*
     * TransactionMonitor constructor
     *
     * @param {Object} options A configuration hash
     * @param {string} options.monitoredModels[] The names of the models to monitor transactions on
     */
    init: function(options) {
      this.monitoredModels = new Set(options.monitoredModels);
      this.monitoredModels.forEach(function(modelName) {
        var Model = models[modelName];
        if (!Model) {
          throw new Error('Cannot record transactions of non-existent model "' + modelName + '"');
        }

        // Listen for updates to the model and record all transactions related to it
        ['created', 'updated', 'destroyed'].forEach(function(operation) {
          Model.bind(operation, function(event, model) {
            // An operation has occured on the model, so create a new transaction
            // model instance to represent it and save it to the database
            var transaction = models.Transaction.createFromEvent(event, model);
            transaction.save();
          });
        });
      });
    },

    /*
     * Return the list of recorded transactions
     *
     * @returns {Transaction[]}
     */
    getTransactions: function() {
      return models.Transaction.list;
    }
  });
});
