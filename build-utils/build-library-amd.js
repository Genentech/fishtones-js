{
        appUrl : '..',
        baseUrl : '../src/js',
        include : ['MSMSJSExport'],
        wrap : {
             startFile : 'start-amd.frag.txt',
            endFile : 'end-amd.frag.txt'
       },

        out : '../dist/fishtones-js-amd-min.js',
        optimize: "none",
//        exclude : ['jQuery', 'backbone', 'underscore', 'd3'],

   paths : {
        jquery : 'empty:',
        underscore : 'empty:',
        Backbone : 'empty:',
        d3 : 'empty:',
        bootstrap : 'empty:',
        bootbox : 'empty:',
        typeahead : 'empty:',
        jQueryCookie : 'empty:',

        //        'fishtones' : '../include/fishtones/js',
        'fishtones' : '',
        'templates' : '../templates',
        'fishtones-templates' : '../templates',
        'Config' : 'utils/Config',
        exceptionHandler : 'fishtones/js/services/utils/ExceptionHandler'

    },
    uglify : {
        toplevel : true,
        ascii_only : true,
        beautify : true,
        max_line_length : 1000,

        //How to pass uglifyjs defined symbols for AST symbol replacement,
        //see "defines" options for ast_mangle in the uglifys docs.
        defines : {
            DEBUG : ['name', 'false']
        },

        //Custom value supported by r.js but done differently
        //in uglifyjs directly:
        //Skip the processor.ast_mangle() part of the uglify call (r.js 2.0.5+)
        no_mangle : true
    },
    shim : {
        'jquery' : {
            exports : '$'
        },
        'jQueryCookie' : {
            deps : ['jquery'],
                exports : '$'
        },
        'underscore' : {
            exports : '_'
        },
        'Backbone' : {
            deps : ['underscore', 'jquery'],
            exports : 'Backbone'
        },
        bootstrap : {
            deps : ['jquery'],
            exports : 'bootstrap'
        },
        d3 : {
            exports : 'd3'
        }

    },
    optimizeCss : "standard.keepLines"
    }

