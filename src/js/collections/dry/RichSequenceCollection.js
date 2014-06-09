/*
 * Just a collection of RichSequence
 * 
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define(['fishtones/models/dry/RichSequence'], function(RichSequence) {
    var RichSequenceCollection = Backbone.Collection.extend({

        model : RichSequence,
        defaults : {
        },
        initialize : function(options) {
            var self = this;
        }
    });
    return RichSequenceCollection;
});
