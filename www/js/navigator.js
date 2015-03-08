/*
 * Export a singleton that manages navigation for the application. It is intended to act as a
 * higher-level to can.route and provides the application an easy way to navigate between various
 * pages as the user moves through the application.
 */

define(function(require) {
  var $ = require('jquery');
  var can = require('can');

  /*
   * Create all CanJS routes. All routes should be centrally located and defined here.
   *
   * This function is not exported as part of the Navigator singleton.
   */
  var setupRoutes = function() {
    // Declare all routes
    // The "page" attribute must match the "id" attribute of the div[data-role="page"] template
    can.route('contacts', {
      page: 'contacts'
    });
    can.route('contacts/:contactId', {
      page: 'contact'
    });

    // Listen for changes to the "page" route attribute
    can.route.bind('page', function(event, page) {
      // The route's page has changed, so tell the jQuery Mobile page container widget to load the new page
      $(':mobile-pagecontainer').pagecontainer('change', '#' + page, { changeHash: false });
    });
  };

  var Navigator = {
    /*
     * Activate the Navigator so that it will begin responding to page changes and other events.
     *
     * @param {string} [defaultPage] The page to navigate to if the current URL does not specify an initial page.
     */
    activate: function(defaultPage) {
      setupRoutes();

      // Initialize the can.route data attributes
      // This will fire the page changed handler defined in setupRoutes, which will in turn cause
      // jQuery Mobile to load the initial page.
      can.route.ready();

      // If no page is set, navigate to the default page
      // The page attribute will be set if the user directly navigated to a URL with a hash.
      if (defaultPage || !can.route.attr('page')) {
        Navigator.openPage(defaultPage);
      }
    },

    /*
     * Navigate to a new page.
     *
     * @param {string} page The page to navigate to.
     * @param {object} [routeData] The can.route attributes associated with the page.
     */
    openPage: function(page, routeData) {
      // Merge the page into the route attributes
      var routeAttrs = can.extend({
        page: page
      }, routeData);

      // Calculate the new URL based on the route attributes, then navigate to it
      var newUrl = can.route.url(routeAttrs);
      window.location = newUrl;
    },

    /*
     * Return the name of the current open page.
     *
     * @returns {string}
     */
    getOpenPage: function() {
      return can.route.attr('page');
    }
  };

  // Export the Navigator singleton
  return Navigator;
});
