/* global System */

'use strict';

import $ from 'jquery';

$(document).on('mobileinit', () => {
  // Configure jQuery Mobile options
  $.extend($.mobile, {
    ajaxEnabled: false,
    autoInitializePage: false,
    linkBindingEnabled: false,
    hashListeningEnabled: false,
    pushStateEnabled: false,
  });
});

// Load jQuery Mobile only after attaching the mobileinit event listener
System.import('jquery-mobile');
