/*
 * just a collection of Injection
 * 
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define(['Backbone', 'fishtones/models/wet/Injection', ], function(Backbone, Injection) {
    var InjectionCollection = Backbone.Collection.extend({
        model : Injection,
        defaults : {
        },
        initialize : function(options) {
            var self = this;
        }
    });
    return InjectionCollection;
});

