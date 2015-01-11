define(function(require) {
  // Load CanJS backup plugin
  require('can/map/backup');

  return {
    Contact: require('models/contact')
  };
});
