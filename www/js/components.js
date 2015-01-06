define(function(require) {
  var $ = require('jquery');
  var can = require('can');
  require('can/construct/proxy');

  var models = require('models');
  var components = {};

  components.Contacts = can.Component.extend({
    tag: 'app-contacts',
    template: can.view('app-contacts'),

    init: function(element) {
      // Initialize the jQueryMobile listview component
      this.$listview = $(element).find('ul');
      this.$listview.listview();

      // Refresh the contacts list whenever contacts are added or removed
      var contacts = models.Contact.list;
      this.scope.attr('contacts', contacts);
      var refresh = this.proxy('refresh');
      contacts.bind('change', refresh);
      contacts.bind('length', refresh);
      refresh();
    },
    scope: {
      create: function(context) {
      },
      purge: function(context) {
        // Delete all contacts in series
        var promise = can.Deferred().resolve();
        context.contacts.forEach(function(contact) {
          promise = promise.then(function() {
            return contact.destroy();
          });
        });
      }
    },
    helpers: {
      'contact-url': function(contact_id, scope) {
        return can.route.url({ contact_id: contact_id === null ? 'new' : contact_id() });
      }
    },
    refresh: function() {
      this.$listview.listview('refresh');
    }
  });

  components.EditContact = can.Component.extend({
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

  return components;
});
