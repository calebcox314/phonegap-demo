/*
 * Export a singleton that manages navigation for the application. It is intended to act as a
 * higher-level to can.route and provides the application an easy way to navigate between constious
 * pages as the user moves through the application.
 */

'use strict';

import $ from 'jquery';
import can from 'can';
import HashMap from './util/HashMap';

// A private map of all the pages used by the application
// This hash map is indexed by the "page" property
// It will be populated through calls to registerPage
const pageRegistry = new HashMap(function(page) { return page.page; });

const Navigator = {
  /*
   * Register a page with the application navigator. This will initialize routing for the page.
   *
   * @param {string} page The page's unique id which should match the "id" attribute of its div[data-role="page"] template
   * @param {string|null} parent The page's parent's id or null if it is a root page
   * @param {string|null} [pattern] The page's route pattern or null to use the page id
   */
  registerPage(page, parent, pattern) {
    // The relative pattern defaults to the page id
    const relativePattern = pattern || page;

    // The absolute pattern is produced by prefixing the relative pattern with the parent's absolute pattern
    const absolutePattern = parent === null ? relativePattern : pageRegistry.getByKey(parent).pattern + '/' + relativePattern;

    // Store the new page in the page registry
    pageRegistry.add({
      page: page,
      parent: parent,
      pattern: absolutePattern,
    });

    // Register the CanJS route associated with this page
    can.route(absolutePattern, {
      page: page,
    });
  },

  /*
   * Activate the Navigator so that it will begin responding to page changes and other events.
   *
   * @param {string} [defaultPage] The page to navigate to if the current URL does not specify an initial page.
   */
  activate(defaultPage) {
    // Listen for changes to the "page" route attribute
    can.route.bind('page', function(event, page) {
      // The route's page has changed, so tell the jQuery Mobile page container widget to load the new page
      $(':mobile-pagecontainer').pagecontainer('change', '#' + page, { changeHash: false });
    });

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
  openPage(page, routeData) {
    // Merge the page into the route attributes
    const routeAttrs = can.extend({
      page: page,
    }, routeData);

    // Calculate the new URL based on the route attributes, then navigate to it
    const newUrl = can.route.url(routeAttrs);
    window.location = newUrl;
  },

  /*
   * Navigate to the current page's parent.
   */
  openParentPage() {
    const currentPage = pageRegistry.getByKey(this.getOpenPage());
    this.openPage(currentPage.parent);
  },

  /*
   * Return the name of the current open page.
   *
   * @returns {string}
   */
  getOpenPage() {
    return can.route.attr('page');
  },
};

export default Navigator;
