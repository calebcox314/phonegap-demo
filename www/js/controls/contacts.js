'use strict';

import $ from 'jquery';
import can from 'can';
import app from '../app';
import Page from './page';
import Navigator from '../navigator';
import models from '../models';

// Load the ChanceJS library and instantiate a new chance generator instance
import Chance from 'chance';
const chance = new Chance();

export default Page.extend('Contacts', {
  pageId: 'contacts',
  template: 'template-contacts',
}, {
  // Initialize the control
  init(element) {
    // Call the Page constructor
    this._super.apply(this, arguments);

    // Get the global list of all contact models
    const contacts = this.contacts = models.Contact.list;

    // Initialize the control scope and render it
    this.scope.attr('contacts', contacts);
    this.render();

    // Initialize the jQuery Mobile listview component
    this.$listview = element.find('ul');
    this.$listview.listview();

    // Refresh the contacts UI list whenever contacts are added or removed
    const refresh = this.proxy('refresh');
    contacts.bind('change', refresh);
    contacts.bind('length', refresh);
    refresh();
  },

  /*
   * Respond to control events.
   */
  '.create click'() {
    // Open a new contact for editing
    Navigator.openPage('contact', {
      contactId: 'new',
    });
  },

  '.generate click'() {
    // Generate a new contact with randomly generated data
    const nameParts = chance.name().split(' ');
    const contact = new models.Contact({
      firstName: nameParts[0],
      lastName: nameParts[1],
      emailAddress: nameParts.join('.').toLowerCase() + '@gmail.com',
      phoneNumber: chance.phone(),
    });
    contact.save();
  },

  '.purge click'() {
    // Delete all contacts in series
    let promise = can.Deferred().resolve();
    this.contacts.forEach(contact => {
      promise = promise.then(() => contact.destroy());
    });
  },

  '.sync click'() {
    // Send the current transactions to the server
    app.transactionMonitor.sync(transactions => {
      return $.ajax('https://phonegap-demo.herokuapp.com/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        data: JSON.stringify({
          lastSyncTimestamp: window.localStorage.getItem('lastSyncTimestamp'),
          transactionLog: transactions.map(transaction => transaction.serialize()),
        }),
      }).then(response => {
        window.localStorage.setItem('lastSyncTimestamp', response.data.lastSyncTimestamp);
        return models.Transaction.models(response.data.transactionLog);
      });
    }).fail(err => {
      console.error('Sync failed!');
      console.log(err);
    });
  },

  '.contact click'(element) {
    // The contact's id is stored in the data-id attribute on the .contact element
    const contactId = $(element).data('id');

    // Open the clicked contact for editing
    Navigator.openPage('contact', {
      contactId: contactId,
    });
  },

  /*
   * Update the jQuery Mobile listview element.
   *
   * This must be called to update the UI whenever items are added to the listview.
   */
  refresh() {
    this.$listview.listview('refresh');
  },
});
