define(function(require, exports, module) {
  'use strict';

  var $ = require('jquery');
  var can = require('can');
  var Page = require('controls/page');
  var Navigator = require('navigator');

  // Load the ChanceJS library and instantiate a new chance generator instance
  var Chance = require('chance');
  var chance = new Chance();

  var models = require('models');
  module.exports = Page.extend('Contacts', {
    pageId: 'contacts',
    template: 'template-contacts'
  }, {
    // Initialize the control
    init: function(element) {
      // Call the Page constructor
      this._super.apply(this, arguments);

      // Get the global list of all contact models
      var contacts = this.contacts = models.Contact.list;

      // Initialize the control scope and render it
      this.scope.attr('contacts', contacts);
      this.render();

      // Initialize the jQueryMobile listview component
      this.$listview = element.find('ul');
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
      // Open a new contact for editing
      Navigator.openPage('contact', {
        contactId: 'new'
      });
    },
    '.generate click': function() {
      // Generate a new contact with randomly generated data
      var nameParts = chance.name().split(' ');
      var contact = new models.Contact({
        firstName: nameParts[0],
        lastName: nameParts[1],
        emailAddress: nameParts.join('.').toLowerCase() + '@gmail.com',
        phoneNumber: chance.phone()
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
    '.sync click': function() {
      // Send the current transactions to the server
      var app = require('app');
      app.transactionMonitor.sync(function(transactions) {
        return $.ajax('/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          data: JSON.stringify({
            lastSyncTimestamp: window.localStorage.getItem('lastSyncTimestamp'),
            transactionLog: transactions.map(function(transaction) {
              return transaction.serialize();
            })
          })
        }).then(function(response) {
          window.localStorage.setItem('lastSyncTimestamp', response.data.lastSyncTimestamp);
          return models.Transaction.models(response.data.transactionLog);
        });
      }).fail(function(err) {
        console.error('Sync failed!');
        console.log(err);
      });
    },
    '.contact click': function(element) {
      // The contact's id is stored in the data-id attribute on the .contact element
      var contactId = $(element).data('id');
      // Open the clicked contact for editing
      Navigator.openPage('contact', {
        contactId: contactId
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
