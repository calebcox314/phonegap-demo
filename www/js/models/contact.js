define(function(require) {
  var can = require('can');
  var LocalModel = require('local-model');

  return LocalModel.extend('Contact', {
    id: 'contact_id',
    attributes: {
      first_name: 'string',
      last_name: 'string',
      email_address: 'string',
      phone_number: 'string',
    }
  }, {
    name: can.compute(function() {
      return this.attr('first_name') + ' ' + this.attr('last_name');
    })
  });
});
