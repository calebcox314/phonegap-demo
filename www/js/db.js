define(function(require) {
  'use strict';

  var can = require('can');

  var Database = {
    // Maps attribute types to SQLite type
    // jscs:disable disallowQuotedKeysInObjects
    sqliteTypeMap: {
      'primarykey': 'INTEGER PRIMARY KEY AUTOINCREMENT',
      'string': 'TEXT',
      'int': 'INTEGER',
      'float': 'REAL',
      'default': 'TEXT'
    },
    // jscs:enable disallowQuotedKeysInObjects

    init: function() {
      var openDatabase = cordova.platformId === 'browser' ? window.openDatabase : window.sqlitePlugin.openDatabase;
      this.db = openDatabase('db.sqlite', '1.0', 'Database', -1);
    },

    install: function(tableData) {
      var deferred = can.Deferred();
      var _this = this;
      this.transaction(function(tx) {
        var columns = [];
        can.each(tableData.attributes, function(type, name) {
          columns.push('"' + name + '" ' + (_this.sqliteTypeMap[type] || _this.sqliteTypeMap.default));
        });
        tx.executeSql('CREATE TABLE IF NOT EXISTS "' + tableData.name + '" (' + columns.join(', ') + ')', [], function(tx, result) {
          deferred.resolve(null);
        }, deferred.reject);
      }, deferred.reject);
      return deferred;
    },

    find: function(tableData, query) {
      var deferred = can.Deferred();
      this.transaction(function(tx) {
        var values = [];
        var conditions = [];
        can.each(query || {}, function(value, key) {
          values.push(value);
          conditions.push('"' + key + '"=?');
        });
        var conditionClause = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';
        tx.executeSql('SELECT * FROM "' + tableData.name + '"' + conditionClause, values, function(tx, result) {
          var rows = [];
          for (var i = 0; i < result.rows.length; ++i) {
            rows.push(result.rows.item(i));
          }
          deferred.resolve(rows);
        }, deferred.reject);
      }, deferred.reject);
      return deferred;
    },

    create: function(tableData, attrs) {
      var deferred = can.Deferred();
      this.transaction(function(tx) {
        var values = [];
        var fields = [];
        var placeholders = [];
        can.each(tableData.attributes, function(type, key) {
          if (key === tableData.primaryKey) {
            // Skip the primary key because it is not set yet
            return;
          }
          values.push(attrs[key]);
          fields.push('"' + key + '"');
          placeholders.push('?');
        });
        var valuesClause = ' (' + fields.join(',') + ') VALUES (' + placeholders.join(',') + ')';
        tx.executeSql('INSERT INTO "' + tableData.name + '"' + (fields.length === 0 ? ' DEFAULT VALUES' : valuesClause), values, function(tx, result) {
          deferred.resolve(result.insertId);
        }, deferred.reject);
      }, deferred.reject);
      return deferred;
    },

    update: function(tableData, id, attrs) {
      var deferred = can.Deferred();
      this.transaction(function(tx) {
        var values = [];
        var assignments = [];
        can.each(tableData.attributes, function(type, key) {
          values.push(attrs[key]);
          assignments.push('"' + key + '"=?');
        });
        values.push(id);
        var assignmentsClause = assignments.join(', ');
        tx.executeSql('UPDATE "' + tableData.name + '" SET ' + assignmentsClause + ' WHERE ' + tableData.primaryKey + '=?', values, function(tx, result) {
          deferred.resolve(null);
        }, deferred.reject);
      }, deferred.reject);
      return deferred;
    },

    destroy: function(tableData, id) {
      var deferred = can.Deferred();
      this.transaction(function(tx) {
        tx.executeSql('DELETE FROM "' + tableData.name + '" WHERE "' + tableData.primaryKey + '"=?', [id], function(tx, result) {
          deferred.resolve(null);
        }, deferred.reject);
      }, deferred.reject);
      return deferred;
    },

    transaction: function(callback) {
      return this.db.transaction(callback);
    }
  };

  Database.init();

  return Database;
});
