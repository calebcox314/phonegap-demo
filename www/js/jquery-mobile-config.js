define(['jquery'], function($) {
  $(document).on('mobileinit', function() {
    // Configure jQueryMobile options
    $.extend($.mobile, {
      ajaxEnabled: false,
      autoInitializePage: false,
      linkBindingEnabled: false,
      hashListeningEnabled: false,
      pushStateEnabled: false
    });
  });
});
