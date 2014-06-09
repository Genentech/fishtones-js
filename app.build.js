( {
    appDir : "src",
    baseUrl : "js",
    dir : "target/build",
    modules : [{
        name : "fishtones/services/dry/MassBuilder",
        include : ["fishtones/services/dry/MassBuilder", "fishtones/services/utils/DataCollector", 'fishtones/services/wet/ExperimentService']
    }],
    fileExclusionRegExp : /^\.(svn|\.DS_Store)$/i,
    paths : {
        jQuery : '../include/js-commons/js/lib/jquery-1.8.0',
        underscore : '../include/js-commons/js/lib/underscore',
        Backbone : '../include/js-commons/js/lib/backbone',
        d3 : '../include/js-commons/js/lib/d3.v3',
        bootstrap : '../include/js-commons/js/lib/bootstrap',
        bootbox : '../include/js-commons/js/lib/bootbox',

        //        'fishtones' : '../include/fishtones/js',
        'fishtones' : '',
        'templates' : '../templates',
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
        'jQuery' : {
            exports : '$'
        },
        'underscore' : {
            exports : '_'
        },
        'Backbone' : {
            deps : ['underscore', 'jQuery'],
            exports : 'Backbone'
        },
        bootstrap : {
            deps : ['jQuery'],
            exports : 'bootstrap'
        },
        d3 : {
            exports : 'd3'
        }

    },
    optimizeCss : "standard.keepLines",
})