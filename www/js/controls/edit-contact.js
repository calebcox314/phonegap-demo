define(function(require, exports, module) {
  'use strict';

  var Page = require('controls/page');
  var Navigator = require('navigator');

  var models = require('models');
  module.exports = Page.extend('EditContact', {
    pageId: 'contact',
    parentId: 'contacts',
    routeAttr: 'contactId',
    template: 'template-contact'
  }, {
    // Initialize the control
    init: function(element) {
      // Call the Page constructor
      this._super.apply(this, arguments);

      // Listen for changes to the route
      this.on('route.change', this.proxy('routeChange'));

      // Initialize the control scope and render it
      this.setContact(null);
      this.render();
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
      Navigator.openParentPage();

      // Prevent the default submit behavior
      return false;
    },
    '.cancel click': function() {
      this.revertContact();
      Navigator.openParentPage();
    },

    /*
     * Listen for changes to the page's registered route attribute, "contactId" in this case.
     */
    routeChange: function(event, contactId) {
      var contact = null;
      if (contactId === 'new') {
        // Create a new contact to edit
        contact = new models.Contact();
      }
      else {
        // Lookup the contact in the global list by its contact
        contact = models.Contact.store[contactId];
        if (contact) {
          // Save a copy of the contact's attributes so that it can be reverted later if necessary
          contact.backup();
        }
        else {
          // No contact has that contactId
          console.error('Attempting to navigate to a non-existent contact!');
          Navigator.openParentPage();
        }
      }
      this.setContact(contact);
    }
  });
});
