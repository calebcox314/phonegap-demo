define(function(require) {
  'use strict';

  var can = require('can');

  return can.Component.extend({
    tag: 'edit-contact',
    template: can.view('edit-contact'),

    scope: {
      cancel: function(context) {
        context.contact.restore();
        window.history.back();
      },
      save: function(context) {
        var contact = context.contact;
        if (contact.isNew() || contact.isDirty()) {
          contact.save();
        }
        window.history.back();
      }
    },
    events: {
      '{can.route} contact_id': function(route, event, contact_id) {
        if (contact_id === undefined) {
          return;
        }
        var contact = null;
        if (contact_id === 'new') {
          contact = new Contact();
        }
        else {
          contact = Contact.store[contact_id];
          contact.backup();
        }
        this.scope.attr('contact', contact);
      }
    }
  });
});
