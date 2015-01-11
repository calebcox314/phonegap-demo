define(function(require) {
  var $ = require('jquery');
  var can = require('can');

  var models = require('models');
  return can.Component.extend({
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
});
