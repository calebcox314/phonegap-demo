define(function(require) {
  'use strict';

  var $ = require('jquery');
  var can = require('can');

  // Load the ChanceJS library and instantiate a new chance generator instance
  var Chance = require('chance');
  var chance = new Chance();

  var models = require('models');
  return can.Control.extend({
    // Initialize the control
    init: function(element) {
      // Get the global list of all contact models
      var contacts = this.contacts = models.Contact.list;

      // This data will be available to the template
      this.scope = new can.Map({
        contacts: contacts
      });
      // Render the control using the contact list and insert it into the control's DOM element
      var fragment = can.view('app-contacts', this.scope);
      this.element.html(fragment);

      // Initialize the jQueryMobile listview component
      this.$listview = $(element).find('ul');
      this.$listview.listview();

      // Refresh the contacts UI list whenever contacts are added or removed
      var refresh = this.proxy('refresh');
      contacts.bind('change', refresh);
      contacts.bind('length', refresh);
      refresh();
    },

    /*
     * Respond to control events.
     */
    '.create click': function() {
      // Start editing a new contact
      this.openContact(null);
    },
    '.generate click': function() {
      // Generate a new contact with randomly generated data
      var nameParts = chance.name().split(' ');
      var contact = new Contact({
        first_name: nameParts[0],
        last_name: nameParts[1],
        email_address: nameParts.join('.').toLowerCase() + '@gmail.com',
        phone_number: chance.phone()
      });
      contact.save();
    },
    '.purge click': function() {
      // Delete all contacts in series
      var promise = can.Deferred().resolve();
      this.contacts.forEach(function(contact) {
        promise = promise.then(function() {
          return contact.destroy();
        });
      });
    },
    '.contact click': function(element) {
      // The contact's id is stored in the data-id attribute on the .contact element
      var contact_id = $(element).data('id');
      // Start editing the clicked contact
      this.openContact(contact_id);
    },

    /*
     * Navigate to a specific contact in the UI.
     *
     * @param contact_id {number} The contact_id of the contact to navigate to (can be null to navigate to a newly-created contact).
     */
    openContact: function(contact_id) {
      // Set the route's "page" attribute to navigate to the edit contact page
      // and the "contact_id" attribute to specify which contact to navigate to
      can.route.attr({
        page: 'contact',
        contact_id: contact_id === null ? 'new' : contact_id
      });
    },

    /*
     * Update the jQuery Mobile listview element.
     *
     * This must be called to update the UI whenever items are added to the listview.
     */
    refresh: function() {
      this.$listview.listview('refresh');
    }
  });
});
