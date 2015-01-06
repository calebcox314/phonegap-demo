System.config({
  baseURL: 'js',
  paths: {
    jquery: '../bower_components/jquery/jquery.js',
    'jquery-mobile': '../bower_components/jquery-mobile/js/jquery.mobile.js',
    can: '../bower_components/canjs/can.jquery.js',
    'can.construct.super': '../bower_components/canjs/can.construct.super.js'
  },
  meta: {
    jquery: { exports: 'jQuery' },
    can: { exports: 'can' }
  }
});
