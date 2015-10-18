'use strict';

// Load the control's parent
import './contacts';

import Page from 'core/controls/page';
import Navigator from 'core/navigator';
import Contact from '../models/contact';

export default Page.extend('EditContact', {
  pageId: 'contact',
  parentId: 'contacts',
  routeAttr: 'contactId',
  template: 'plugins/contacts/templates/contact.html',
}, {
  // Initialize the control
  init(element) {
    // Call the Page constructor
    this._super(...arguments);

    // Listen for changes to the route
    this.on('route.change', this.proxy('routeChange'));

    // Initialize the control scope and render it
    this.setContact(null);
    this.render();
  },

  /*
   * Revert all changes made to the contact and stop editing the contact.
   */
  revertContact() {
    this.getContact().restore();
  },

  /*
   * Save all changes made to the contact and stop editing the contact.
   */
  saveContact() {
    const contact = this.getContact();
    if (contact.isNew() || contact.isDirty()) {
      contact.save();
    }
  },

  /*
   * Return the contact that is currently being edited.
   */
  getContact() {
    return this.scope.attr('contact');
  },
  /*
   * Set the contact that is being edited to the provided contact model
   */
  setContact(contact) {
    this.scope.attr('contact', contact);
  },

  /*
   * Respond to control events.
   */
  '.save click'() {
    this.saveContact();
    Navigator.openParentPage();

    // Prevent the default submit behavior
    return false;
  },

  '.cancel click'() {
    this.revertContact();
    Navigator.openParentPage();
  },

  /*
   * Listen for changes to the page's registered route attribute, "contactId" in this case.
   */
  routeChange(event, contactId) {
    let contact = null;
    if (contactId === 'new') {
      // Create a new contact to edit
      contact = new Contact();
    } else {
      // Lookup the contact in the global list by its contact
      contact = Contact.store[contactId];
      if (contact) {
        // Save a copy of the contact's attributes so that it can be reverted later if necessary
        contact.backup();
      } else {
        // No contact has that contactId
        console.error('Attempting to navigate to a non-existent contact!');
        Navigator.openParentPage();
      }
    }

    this.setContact(contact);
  },
});
