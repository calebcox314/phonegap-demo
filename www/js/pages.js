define(function(require) {
  'use strict';

  /*
   * A Pages instance represents all of the pages in an application. Each page consists of a control and routing data.
   */

  var can = require('can');
  var Controls = require('controls');
  var Navigator = require('navigator');
  var Pages = can.Construct.extend({
    pages: null,

    /* Pages constructor
     *
     * The elements of the pages array are dictionaries with the following keys:
     *   id:      The page's arbitrary unique id
     *   parent:  The page's parent's id (optional; omit for root pages)
     *   route:   The page's CanJS route pattern (optional; defaults to page's id)
     *   Control: The page's associated can.Control class
     *
     * @param {array} pages Array of all the application's pages
     */
    init: function(pages) {
      this.pages = pages;
    },

    // Create the controls associated with the pages
    createControls: function() {
      this.pages.forEach(function(Page) {
        var controlName = can.hyphenate(Page.fullName).toLowerCase();
        var control = new Page('[data-control=' + controlName + ']', {});
      });
    },

    // Register all pages with the Navigator component
    registerPages: function() {
      this.pages.forEach(function(Page) {
        Navigator.registerPage(Page.pageId, Page.parentId, Page.routeAttr ? ':' + Page.routeAttr : null);
      });
    }
  });

  return Pages;
});
