/*jshint node: true, camelcase: false */

'use strict';

module.exports = function (grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: [
        'Gruntfile.js',
        'iframe-file-upload.js'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> v<%= pkg.version %> | <%= pkg.license %> */\n'
      },
      build: {
        files: {
          'build/iframe-file-upload-<%= pkg.version %>.min.js': 'iframe-file-upload.js'
        }
      }
    },
    docco: {
      debug: {
        src: ['iframe-file-upload.js'],
        options: {
          output: 'docs/'
        }
      }
    },
    copy: {
      doc: {
        src: 'docs/iframe-file-upload.html',
        dest: 'docs/index.html',
        nonull: true
      }
    },
    'gh-pages': {
      options: {
        base: 'docs'
      },
      src: ['**']
    },
    connect: {
      server: {
        options: {
          port: 3000,
          base: 'demo',
          keepalive: true,
          middleware: function(connect, options, middlewares) {
            var multiparty = require('multiparty'),
                util = require('util');
            middlewares.unshift(function(req, res, next) {
              if (req.url === '/iframe-file-upload.js') {
                return connect.static(__dirname)(req, res, next);
              }
              if (req.url !== '/upload' || req.method.toUpperCase() !== 'POST') {
                return next();
              }

              var form = new multiparty.Form();
              form.parse(req, function(error, fields, files) {
                res.writeHead(200, {'Content-Type': 'application/json'});
                setTimeout(function() {
                  res.end(JSON.stringify({
                    files: files['file'],
                    comment: fields['comment']
                  }));
                }, 500);
              });
            });
            return middlewares;
          }
        }
      }
    }
  });

  // Loading dependencies
  for (var key in grunt.file.readJSON('package.json').devDependencies) {
    if (key !== 'grunt' && key.indexOf('grunt') === 0) {
      grunt.loadNpmTasks(key);
    }
  }

  grunt.registerTask('default', ['jshint', 'uglify']);
  grunt.registerTask('demo', ['connect']);
  grunt.registerTask('doc', ['docco', 'copy:doc', 'gh-pages']);
};
