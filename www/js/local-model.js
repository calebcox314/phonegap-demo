define(function(require, exports, module) {
  'use strict';

  // Load the CanJS and the required plugins
  var can = require('can');
  require('can/construct/super');
  require('can/map/define');

  // Instantiate a new ChanceJS generator instance for generating UUIDs
  var Chance = require('chance');
  var chance = new Chance();

  var db = require('db');
  module.exports = can.Model.extend('LocalModel', {
    extend: function(name, staticProps, protoProps) {
      // Ignore the isSaved property when serializing
      can.extend(true, protoProps, {
        define: {
          isSaved: {
            serialize: false
          }
        }
      });

      var Model = this._super.apply(this, arguments);
      if (Model.hasUuid) {
        // For models with a UUID field, the primary key defaults to an automatically generated UUID
        Object.defineProperty(Model.defaults, Model.id, {
          get: function() {
            // Generate a new UUID
            return chance.guid();
          },
          enumerable: true
        });
      }
      return Model;
    },

    install: function(success, error) {
      // Install this model in the database
      return db.install(this.getTableData()).done(success).fail(error);
    },

    findAll: function(params, success, error) {
      return db.find(this.getTableData(), params).done(function(models) {
        // Mark the found models as present in the database
        models.forEach(function(model) {
          model.isSaved = true;
        });
      }).done(success).fail(error);
    },

    findOne: function(params, success, error) {
      return db.find(this.getTableData(), params).then(function(rows) {
        return rows[0] || null;
      }).done(function(model) {
        // Mark the found model as present in the database
        if (model) {
          model.isSaved = true;
        }
      }).done(success).fail(error);
    },

    create: function(params, success, error) {
      var primaryKey = this.id;
      return db.create(this.getTableData(), params).then(function(insertId) {
        // The object returned here will augment the model's attributes
        var obj = {};
        // If the model did not have an explicit primary key, record the generated one
        if (typeof params[primaryKey] === 'undefined') {
          obj[primaryKey] = insertId;
        }
        return obj;
      }).done(success).fail(error);
    },

    update: function(id, params, success, error) {
      return db.update(this.getTableData(), id, params).done(success).fail(error);
    },

    destroy: function(id, params, success, error) {
      return db.destroy(this.getTableData(), id).done(success).fail(error);
    },

    getTableData: function() {
      return {
        name: this._fullName,
        primaryKey: this.id,
        attributes: this.attributes
      };
    }
  }, {
    isSaved: false,

    save: function() {
      // Call the original "save" function
      var _this = this;
      return this._super.apply(this, arguments).done(function() {
        // Mark this model as present in the database
        _this.isSaved = true;
      });
    },

    // Override the built-in can.Model#isNew with more intelligent functionality
    // The original isNew function determines whether or not a model is already present in the
    // database by checking whether its primary key is set. That heuristic is not appropriate for
    // this application because the primary key occasionally needs to be set explicitly rather than
    // automatically calculated via AUTOINCREMENT. Instead, we set a boolean "isSaved" flag to true
    // on every model read from the database via findOne and findAll. Also, calls to "save" also set
    // this flag to true. "isNew" then calculates whether the model has been saved or not by simply
    // checking the "isSaved" flag.
    isNew: function() {
      return !this.isSaved;
    }
  });
});
