module.exports = function(grunt) {
  // Project configuration
  var srcFiles = ['Gruntfile.js', 'www/js/**/*.js'];
  grunt.initConfig({

    jshint: {
      src: srcFiles
    },

    jscs: {
      src: srcFiles,
      options: {
        preset: 'airbnb'
      }
    },

    watch: {
      files: srcFiles,
      tasks: ['jshint', 'jscs']
    }
  });

  // Load grunt plugins
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-jscs');

  // Define default task
  grunt.registerTask('default', ['jshint', 'jscs']);
};
