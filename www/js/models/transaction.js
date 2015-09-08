'use strict';

// Maps event type to operation name
const operationMap = new Map([
  ['created', 'create'],
  ['updated', 'update'],
  ['destroyed', 'destroy'],
]);

import can from 'can';
import LocalModel from '../local-model';
import models from '../models';

const Transaction = LocalModel.extend('Transaction', {
  id: 'transactionId',
  attributes: {
    transactionId: 'int|primarykey|autoincrement|unique',
    modelName: 'string',
    operation: 'string',
    params: 'string',
  },
  dbAttributes: {
    transactionId: 'int|primarykey|autoincrement|unique',
  },
  defaults: {
    modelName: '',
    operation: '',
    params: {},
  },

  /*
   * Create a new transaction that represents a model change event
   *
   * @param {object} object The event
   * @param {model} model The modified model
   * @returns {Transaction}
   */
  createFromEvent: function(event, model) {
    return new Transaction({
      modelName: model.constructor.shortName,
      operation: operationMap.get(event.type),
      params: model.serialize(),
    });
  },
}, {
  define: {
    // The "params" attribute is JSON data, but should
    // be serialized in the database as a string
    params: {
      // Convert the params attribute into its serialized form
      serialize: function(value) {
        return JSON.stringify(value);
      },

      // Convert the params attribute from its serialized form
      type: function(raw) {
        if (typeof raw === 'string') {
          try {
            return JSON.parse(raw);
          } catch (e) {
            return {};
          }
        }

        return raw;
      },
    },
  },

  /*
   * Play back a single transaction
   *
   * @returns {Deferred}
   */
  apply: function() {
    const dfd = can.Deferred();

    const modelName = this.attr('modelName');
    const Model = models[modelName];
    if (!Model) {
      return dfd.reject(new Error('Cannot apply transaction to non-existent model "' + this.attr('modelName') + '"')).promise();
    }

    const attrs = this.attr('params');
    const id = attrs[Model.id];

    const operation = this.attr('operation');
    let model = Model.store[id];
    if (operation === 'create') {
      // Create a new model
      if (!model) {
        model = new Model(attrs);
        return model.save();
      } else {
        console.warn('Cannot create existing model with id ' + id);
        dfd.resolve();
      }
    } else if (operation === 'update') {
      // Find the model and update it
      if (model) {
        model.attr(attrs);
        return model.save();
      } else {
        console.warn('Cannot update non-existent model with id ' + id);
        dfd.resolve();
      }
    } else if (operation === 'destroy') {
      // Find the model and destroy it
      if (model) {
        return model.destroy();
      } else {
        console.warn('Cannot destroy non-existent model with id ' + id);
        dfd.resolve();
      }
    } else {
      return dfd.reject(new Error('Cannot apply transaction with unrecognized operation "' + operation + '"'));
    }

    return dfd.promise();
  },
});

export default Transaction;
