/*
 * just a collection of Experiment
 * 
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define(['Backbone', 'fishtones/models/wet/Experiment', ], function(Backbone, Experiment) {
    var ExperimentCollection = Backbone.Collection.extend({
        model : Experiment,
        defaults : {
        },
        initialize : function(options) {
            var self = this;
        }
    });
    return ExperimentCollection;
});
