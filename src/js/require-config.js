// Author: Thomas Davis <thomasalwyndavis@gmail.com>
// Filename: main.js

// Require.js allows us to configure shortcut alias
// Their usage will become more apparent futher along in the tutorial.
var requireJsConfig = {
    baseUrl: 'src/js',
    paths: {
        jquery: '../../bower_components/jquery/jquery',
        jQueryCookie: '../../bower_components/jquery-cookie/jquery.cookie',
        underscore: '../../bower_components/underscore/underscore',
        Backbone: '../../bower_components/backbone/backbone',
        d3: '../../bower_components/d3/d3.min',
        bootstrap: '../../bower_components/bootstrap/dist/js/bootstrap.min',
        typeahead: '../../bower_components/typeahead.js/dist/typeahead.jquery',

        Config: '../js/utils/Config',
        //        app: '../app',
        data: '../js/data',
        assets: '../assets',
        views: '../js/views',
        templates: '../templates',
        collections: '../js/collections',
        models: '../js/models',
        services: '../js/services'
    },
    shim: {
        'jquery': {
            exports: '$'
        },
        'jQueryCookie': ['jquery'],
        'typeahead': ['jquery'],
        bootstrap: ['jquery'],
        'underscore': {
            exports: '_'
        },
        'Backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        d3: {
            exports: 'd3'
        }

    }
};
define('jquery-plus', ['jquery', 'bootstrap', 'typeahead', 'jQueryCookie'], function ($) {
    return $;
})
