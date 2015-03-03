/*
 * Export a singleton that manages all CanJS routes for the application.
 */

define(function(require) {
  var Routes = {
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

  // Export the Routes singleton
  return Routes;
});
