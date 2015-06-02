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
      this.read();

      var _this = this;
      this.monitoredModels = new Set(options.monitoredModels);
      this.monitoredModels.forEach(function(modelName) {
        var Model = models[modelName];
        if (!Model) {
          throw new Error('Cannot record transactions of non-existent model "' + modelName + '"');
        }

        // Listen for updates to the model and record all transactions related to it
        var operations = [{
          name: 'create',
          event: 'created'
        }, {
          name: 'update',
          event: 'updated'
        }, {
          name: 'destroy',
          event: 'destroyed'
        }];
        operations.forEach(function(operation) {
          Model.bind(operation.event, function(event, model) {
            // An operation has occured on the model, so add it to the transaction queue
            _this.transactionList.push({
              model: modelName,
              operation: operation.name,
              params: model.attr()
            });
            _this.write();
          });
        });
      });
    },

    /*
     * Return the list of recorded transactions
     *
     * @returns {transaction[]}
     */
    getTransactions: function() {
      return this.transactionList;
    },

    /*
     * Reset the list of recorded transactions
     */
    clear: function() {
      this.transactionList = [];
      this.write();
    },

    /*
     * Read the transactions from a persistent data store
     */
    read: function() {
      var transactions = null;
      try {
        transactions = JSON.parse(window.localStorage.getItem('transactions'));
      } catch (e) {}

      // Set the transaction list to an empty array if the persisted
      // transaction data could not be parsed or does not represent an array
      this.transactionList = can.isArray(transactions) ? transactions : [];
    },

    /*
     * Write the transactions to a persistent data store
     */
    write: function() {
      window.localStorage.setItem('transactions', JSON.stringify(this.transactionList));
    },

    /*
     * Play back an array of transactions
     */
    applyTransactions: function(transactions, progress) {
      var numTransactions = transactions.length;
      transactions.forEach(function(transaction, index) {
        progress(index, numTransactions);
        this.applyTransaction(transaction);
      }, this);
      progress(numTransactions, numTransactions);
    },

    /*
     * Play back a single transaction
     */
    applyTransaction: function(transaction) {
      if (!this.monitoredModels.has(transaction.model)) {
        throw new Error('Cannot apply transaction to unmonitored model "' + transaction.model + '"');
      }

      var Model = models[transaction.model];
      var id = transaction.params[Model.id];

      var model = Model.store[id];
      if (transaction.operation === 'create') {
        // Create a new model
        if (!model) {
          model = new Model(transaction.params);
          model.save();
        }
        else {
          console.warn('Cannot create existing model with id ' + id);
        }
      }
      else if (transaction.operation === 'update') {
        // Find the model and update it
        if (model) {
          model.attr(transaction.params);
          model.save();
        }
        else {
          console.warn('Cannot update non-existent model with id ' + id);
        }
      }
      else if (transaction.operation === 'destroy') {
        // Find the model and destroy it
        if (model) {
          model.destroy();
        }
        else {
          console.warn('Cannot destroy non-existent model with id ' + id);
        }
      }
      else {
        throw new Error('Cannot apply transaction with unrecognized operation "' + transaction.operation + '"');
      }
    }
  });
});
