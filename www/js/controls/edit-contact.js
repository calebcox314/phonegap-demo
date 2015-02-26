define(function(require) {
  'use strict';

  var can = require('can');

  var models = require('models');
  return can.Control.extend({
    // Initialize the control
    init: function(element) {
      // This data will be available to the template
      this.scope = new can.Map({
        contact: null
      });

      // Render the control using the contact and insert it into the control's DOM element
      var fragment = can.view('edit-contact', this.scope);
      this.element.html(fragment);
    },

    /*
     * Revert all changes made to the contact and stop editing the contact.
     */
    revertContact: function() {
      this.getContact().restore();
    },

    /*
     * Save all changes made to the contact and stop editing the contact.
     */
    saveContact: function() {
      var contact = this.getContact();
      if (contact.isNew() || contact.isDirty()) {
        contact.save();
      }
    },

    /*
     * Return the contact that is currently being edited.
     */
    getContact: function() {
      return this.scope.attr('contact');
    },
    /*
     * Set the contact that is being edited to the provided contact model
     */
    setContact: function(contact) {
      this.scope.attr('contact', contact);
    },

    /*
     * Respond to control events.
     */
    '.save click': function() {
      this.saveContact();
      window.history.back();
    },
    '.cancel click': function() {
      this.revertContact();
      window.history.back();
    },

    /*
     * Listen for changes to the route's "contact_id" attribute.
     */
    '{can.route} contact_id': function(route, event, contact_id) {
      var contact = null;
      if (contact_id === undefined) {
        // Ignore the contact_id if it is undefined
      }
      else if (contact_id === 'new') {
        // Create a new contact to edit
        contact = new models.Contact();
      }
      else {
        // Lookup the contact in the global list by its contact
        contact = models.Contact.store[contact_id];
        if (contact) {
          // Save a copy of the contact's attributes so that it can be reverted later if necessary
          contact.backup();
        }
        else {
          // No contact has that contact_id
          console.error('Attempting to navigate to a non-existent contact!');
          can.route.removeAttr('contact_id');
        }
      }
      this.setContact(contact);
    }
  });
});
