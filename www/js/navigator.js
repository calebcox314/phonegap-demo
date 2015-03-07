/*
 * Export a singleton that manages all navigation for the application.
 */

define(function(require) {
  var Navigator = {
    /*
     * Create all CanJS routes. All routes should be centrally located and defined here.
     */
    setupRoutes: function() {
      var can = require('can');
      can.route('contacts', {
        page: 'contacts'
      });
      can.route('contacts/:contactId', {
        page: 'contact'
      });
    }
  };

  // Export the Navigator singleton
  return Navigator;
});
