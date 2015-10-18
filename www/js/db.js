'use strict';

import can from 'can';

const Database = {
  // Maps attribute types to SQLite type
  sqliteTypeMap: new Map([
    ['string', 'TEXT'],
    ['int', 'INTEGER'],
    ['float', 'REAL'],
    ['default', 'TEXT'],
  ]),

  // Maps attribute modifiers to SQLite type modifiers
  sqliteModifierMap: new Map([
    ['primarykey', 'PRIMARY KEY'],
    ['autoincrement', 'AUTOINCREMENT'],
    ['unique', 'UNIQUE'],
    ['notnull', 'NOT NULL'],
  ]),

  init() {
    const openDatabase = cordova.platformId === 'browser' ? window.openDatabase : window.sqlitePlugin.openDatabase;
    this.db = openDatabase('db.sqlite', '1.0', 'Database', -1);
  },

  install(tableData) {
    const deferred = can.Deferred();
    this.transaction(tx => {
      const columns = [];
      can.each(tableData.attributes, (attributeType, attributeName) => {
        // Convert the generalized type to a SQLite type string
        // The type should consist of multiple pipe-separated segments. The first segment
        // represents the base type (like string, int, or float) and the other segments represent
        // type modifiers (like primarykey or autoincrement)
        const sqliteType = attributeType.toLowerCase().split('|').map((type, index) => {
          if (index === 0) {
            // The first segment represents the base type
            const baseType = type ? this.sqliteTypeMap.get(type) : this.sqliteTypeMap.get('default');
            if (!baseType) {
              deferred.reject(new Error(`Unrecognized attribute base type "${type}"`));
            }

            return baseType;
          } else {
            // All other segments represent type modifiers
            const modifier = this.sqliteModifierMap.get(type);
            if (!modifier) {
              deferred.reject(new Error(`Unrecognized attribute type modifier "${type}"`));
            }

            return modifier;
          }
        }).join(' ');
        columns.push(`"${attributeName}" ${sqliteType}`);
      });

      if (deferred.state() === 'rejected') {
        // An error occured, so do not attempt to create the table
        return;
      }

      tx.executeSql(`CREATE TABLE IF NOT EXISTS "${tableData.name}" (${columns.join(', ')})`, [], (tx, result) => {
        deferred.resolve(null);
      }, deferred.reject);
    }, deferred.reject);
    return deferred;
  },

  find(tableData, query) {
    const deferred = can.Deferred();
    this.transaction(tx => {
      const values = [];
      const conditions = [];
      can.each(query || {}, (value, key) => {
        values.push(value);
        conditions.push(`"${key}"=?`);
      });

      const conditionClause = conditions.length === 0 ? '' : ` WHERE ${conditions.join(' AND ')}`;
      tx.executeSql(`SELECT * FROM "${tableData.name}"${conditionClause}`, values, (tx, result) => {
        const rows = [];
        for (let i = 0; i < result.rows.length; ++i) {
          rows.push(result.rows.item(i));
        }

        deferred.resolve(rows);
      }, deferred.reject);
    }, deferred.reject);
    return deferred;
  },

  create(tableData, attrs) {
    const deferred = can.Deferred();
    this.transaction(tx => {
      const values = [];
      const fields = [];
      const placeholders = [];
      can.each(tableData.attributes, (type, key) => {
        const value = attrs[key];
        if (typeof value === 'undefined') {
          // Skip attributes without a value
          return;
        }

        values.push(value);
        fields.push(`"${key}"`);
        placeholders.push('?');
      });

      const valuesClause = fields.length === 0 ? 'DEFAULT VALUES' : `(${fields.join(',')}) VALUES (${placeholders.join(',')})`;
      tx.executeSql(`INSERT INTO "${tableData.name}" ${valuesClause}`, values, (tx, result) => {
        deferred.resolve(result.insertId);
      }, deferred.reject);
    }, deferred.reject);
    return deferred;
  },

  update(tableData, id, attrs) {
    const deferred = can.Deferred();
    this.transaction(tx => {
      const values = [];
      const assignments = [];
      can.each(tableData.attributes, (type, key) => {
        values.push(attrs[key]);
        assignments.push(`"${key}"=?`);
      });

      values.push(id);
      const assignmentsClause = assignments.join(', ');
      tx.executeSql(`UPDATE "${tableData.name}" SET ${assignmentsClause} WHERE ${tableData.primaryKey}=?`, values, (tx, result) => {
        deferred.resolve(null);
      }, deferred.reject);
    }, deferred.reject);
    return deferred;
  },

  destroy(tableData, id) {
    const deferred = can.Deferred();
    this.transaction(tx => {
      tx.executeSql(`DELETE FROM "${tableData.name}" WHERE "${tableData.primaryKey}"=?`, [id], (tx, result) => {
        deferred.resolve(null);
      }, deferred.reject);
    }, deferred.reject);
    return deferred;
  },

  transaction(callback) {
    return this.db.transaction(callback);
  },
};

export default Database;

Database.init();
