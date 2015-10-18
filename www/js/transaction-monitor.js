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

import can from 'can';
import models from './models';

export default can.Construct.extend('TransactionMonitor', {
  /*
   * TransactionMonitor constructor
   *
   * @param {Object} options A configuration hash
   * @param {string} options.monitoredModels[] The names of the models to monitor transactions on
   */
  init(options) {
    this.monitoring = true;

    this.monitoredModels = new Set(options.monitoredModels);
    this.monitoredModels.forEach(modelName => {
      const Model = models[modelName];
      if (!Model) {
        throw new Error(`Cannot record transactions of non-existent model "${modelName}"`);
      }

      // Listen for updates to the model and record all transactions related to it
      ['created', 'updated', 'destroyed'].forEach(operation => {
        Model.bind(operation, (event, model) => {
          if (!this.monitoring) {
            // Monitoring is disabled, so do not record the transaction
            return;
          }

          // An operation has occured on the model, so create a new transaction
          // model instance to represent it and save it to the database
          const transaction = models.Transaction.createFromEvent(event, model);
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
  getTransactions() {
    return models.Transaction.list;
  },

  /*
   * Synchronize the transactions with an external transaction store
   *
   * A synchronization consists of sending all of this device's transactions
   * to some remote transaction store, receiving back a list of all the new
   * transactions to apply to this device, applying those transactions, and
   * removing all transactions that were sent. The "sync" callback takes an
   * array of Transaction models that should be sent and returns a Deferred
   * that resolves to an array of Transaction models that were received.
   *
   * @param {Function} sync Communicates with the external transaction store
   * @returns {Deferred}
   */
  sync(sync) {
    const sentTransactions = can.makeArray(this.getTransactions());
    return sync(sentTransactions).done(receivedTransactions => {
      // Pause transaction monitoring while applying transactions so that the
      // model changes will not be recorded as new transactions
      this.monitoring = false;

      // Apply transactions one at a time, starting the next transaction
      // immediately after the previous one finishes
      let promise = can.Deferred().resolve();
      receivedTransactions.forEach(transaction => {
        promise = promise.then(() => transaction.apply());
      });

      // Re-enable transaction monitoring after all transactions are applied
      promise.always(() => {
        this.monitoring = true;
      });

      // Remove all of the transactions that were sent
      sentTransactions.forEach(transaction => transaction.destroy());
    });
  },
});
