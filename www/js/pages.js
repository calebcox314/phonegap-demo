define(function(require) {
  'use strict';

  /*
   * A page consists of a control and routing data
   */

  var can = require('can');
  var Controls = require('controls');
  var Navigator = require('navigator');
  var Pages = {
    // Define all pages used within the application
    pages: {
      Contacts: {
        id: 'contacts',
        Control: Controls.Contacts
      },
      EditContact: {
        id: 'contact',
        parent: 'contacts',
        route: ':contactId',
        Control: Controls.EditContact
      }
    },

    // Create the controls associated with the pages
    createControls: function() {
      can.each(this.pages, function(page, key) {
        page.control = new page.Control('[data-control=' + can.hyphenate(page.Control.fullName).toLowerCase() + ']', {});
      });
    },

    // Register all pages with the Navigator component
    registerPages: function() {
      can.each(this.pages, function(page, key) {
        Navigator.registerPage(page.id, page.parent || null, page.route);
      });
    }
  };

  return Pages;
});
