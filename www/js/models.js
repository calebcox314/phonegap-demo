define(function(require, exports, module) {
  'use strict';

  // Load CanJS backup plugin
  require('can/map/backup');

  module.exports = {
    Contact: require('models/contact'),
    Transaction: require('models/transaction')
  };
});
