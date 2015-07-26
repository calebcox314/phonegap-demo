define(function(require, exports, module) {
  'use strict';

  var can = require('can');
  var LocalModel = require('local-model');

  module.exports = LocalModel.extend('Contact', {
    id: 'contactId',
    attributes: {
      firstName: 'string',
      lastName: 'string',
      emailAddress: 'string',
      phoneNumber: 'string'
    },
    defaults: {
      firstName: '',
      lastName: '',
      emailAddress: null,
      phoneNumber: null
    }
  }, {
    name: can.compute(function() {
      return this.attr('firstName') + ' ' + this.attr('lastName');
    })
  });
});
