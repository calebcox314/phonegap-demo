define(function(require) {
  'use strict';

  /*
   * A Page instance represents one page of the application. It is a subclass of can.Control.
   *
   * One major function of the Page control is to abstract routing. Instead of subscribing directly
   * to route attribute changes via can.route.bind, Page controls can set the routeAttr on their
   * constructor to an attribute name and listen to "route.change" events on the Page control instance.
   */

  var can = require('can');
  require('can/event');
  var Navigator = require('navigator');

  var Page = can.Control.extend({
    // The unique id of this page, which SHOULD be overriden in derived page controls
    pageId: null,
    // The route attribute that this control will bind to, which MAY be overriden in derived page controls
    routeAttr: null
  }, {
    // Initialize the control
    init: function(element) {
      var routeAttr = this.constructor.routeAttr;
      if (routeAttr) {
        var _this = this;
        can.route.bind(routeAttr, function(event, value) {
          // Only process if the page is open
          if (Navigator.getOpenPage() === _this.constructor.pageId) {
            _this.trigger('route.change', [value]);
          }
        });
      }
    }
  });
  // Add event functionality to the Page control
  can.extend(Page.prototype, can.event);

  return Page;
});
