define(function(require) {
  'use strict';

  /*
   * HashMap extends the ECMAScript 6 Map collection. The primary difference is
   * that it hashes added entries using a supplied hash function to generate the
   * keys for each key/value pair.
   */

  var can = require('can');
  var HashMap = can.Construct.extend({
    /*
     * HashMap constructor
     *
     * The hasher function receives a single "entry" argument and
     * should return the entry's calculated hash.
     *
     * @param {function} hasher The function that translates values into hashes
     */
    init: function(hasher) {
      this.hasher = hasher;
      this.map = new Map();
    },

    /*
     * Add a value to the hash map.
     */
    add: function(value) {
      this.map.set(this.hasher(value), value);
    },

    /*
     * Lookup and return a value given its key.
     */
    getByKey: function(key) {
      return this.map.get(key);
    },

    /*
     * Remove a value from the hash map.
     */
    deleteByValue: function(value) {
      this.deleteByKey(this.hasher(value));
    },

    /*
     * Remove a value from the hash map given its key.
     */
    deleteByKey: function(key) {
      this.map.delete(key);
    },

    hasher: null, // the hash function
    map: null // the map
  });

  // Add the following Map functions to the HashMap
  ['clear', 'has', 'keys', 'values', 'entries', 'forEach'].forEach(function(method) {
    HashMap.prototype[method] = function() {
      return this.map[method].apply(this.map, arguments);
    };
  });

  return HashMap;
});
