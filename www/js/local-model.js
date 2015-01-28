define(function(require) {
  'use strict';

  // Load the CanJS and the required plugins
  var can = require('can');
  require('can/construct/super');

  var db = require('db');
  return can.Model.extend('LocalModel', {
    extend: function(name, staticProps, protoProps) {
      // Set the id attribute as the model's primary key
      staticProps.attributes[staticProps.id] = 'primarykey';
      return this._super.apply(this, arguments);
    },

    install: function(success, error) {
      // Install this model in the database
      return db.install(this.getTableData()).then(success, error);
    },

    findAll: function(params, success, error) {
      return db.find(this.getTableData(), params).then(success, error);
    },

    findOne: function(params, success, error) {
      return db.find(this.getTableData(), params).then(function(rows) {
        return rows[0] || null;
      }).then(success, error);
    },

    create: function(params, success, error) {
      var primaryKey = this.id;
      return db.create(this.getTableData(), params).then(function(insertId) {
        // The object returned here will augment the model's attributes
        var obj = {};
        obj[primaryKey] = insertId;
        return obj;
      }).then(success, error);
    },

    update: function(id, params, success, error) {
      return db.update(this.getTableData(), id, params).then(success, error);
    },

    destroy: function(id, params, success, error) {
      return db.destroy(this.getTableData(), id).then(success, error);
    },

    getTableData: function() {
      return {
        name: this._fullName,
        primaryKey: this.id,
        attributes: this.attributes
      };
    }
  }, {});
});
