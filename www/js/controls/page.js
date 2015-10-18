'use strict';

/*
 * A Page instance represents one page of the application. It is a subclass of can.Control.
 *
 * One major function of the Page control is to abstract routing. Instead of subscribing directly
 * to route attribute changes via can.route.bind, Page controls can set the routeAttr on their
 * constructor to an attribute name and listen to "route.change" events on the Page control instance.
 */

import can from 'can';
import 'can/event';
import Navigator from '../navigator';
import Control from './control';

const Page = Control.extend({
  // The unique id of this page
  // It should always be overriden in derived page controls
  pageId: null,

  // The id of this page's parent in the navigation heirarchy
  // It shoud be overriden in derived page controls unless the page is a root page
  parentId: null,

  // The route attribute that this control will bind to
  // It may be overriden in derived page controls
  routeAttr: null,

  // Register derived page controls with the Navigator component
  extend() {
    // Call the original extend function
    const PageControl = this._super(...arguments);
    Navigator.registerPage(PageControl.pageId, PageControl.parentId, PageControl.routeAttr ? `:${PageControl.routeAttr}` : null);
    return PageControl;
  },
}, {
  // Initialize the control
  init(element) {
    const routeAttr = this.constructor.routeAttr;
    if (routeAttr) {
      can.route.bind(routeAttr, (event, value) => {
        // Only process if the page is open
        if (Navigator.getOpenPage() === this.constructor.pageId) {
          this.trigger('route.change', [value]);
        }
      });
    }

    // Call the Control constructor
    return this._super(...arguments);
  },
});

export default Page;

// Add event functionality to the Page control
can.extend(Page.prototype, can.event);
