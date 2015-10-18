'use strict';

import can from 'can';
import LocalModel from 'core/local-model';

export default LocalModel.extend('Contact', {
  id: 'contactId',
  hasUuid: true,
  attributes: {
    contactId: 'string|primarykey|unique',
    firstName: 'string',
    lastName: 'string',
    emailAddress: 'string',
    phoneNumber: 'string',
  },
  defaults: {
    firstName: '',
    lastName: '',
    emailAddress: null,
    phoneNumber: null,
  },
  monitorTransactions: true,
}, {
  name: can.compute(function() {
    return `${this.attr('firstName')} ${this.attr('lastName')}`;
  }),
});
