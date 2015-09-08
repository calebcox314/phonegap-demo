'use strict';

/*
 * The Control class extends the can.Control class and adds functionality to
 * all controls in the application. All controls should derive from Control
 * or from one of its derived classes.
 */

import can from 'can';

export default can.Control.extend({
  // The unique id of the template used to render the control
  // It should always be overriden in derived controls
  template: null,
}, {
  init: function(element) {
    // This data will be available to the template
    this.scope = new can.Map();

    // Call the can.Control constructor
    return this._super.apply(this, arguments);
  },

  /*
   * Render the control and insert it into the control's DOM element
   */
  render: function() {
    // Pass this.scope Map as the template data
    var fragment = can.view(this.constructor.template, this.scope);
    this.element.html(fragment);
  },
});
