define(function(require) {
  'use strict';

  // Load CanJS backup plugin
  require('can/map/backup');

  return {
    Contact: require('models/contact')
  };
});
