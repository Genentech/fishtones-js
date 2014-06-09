/*
 * just a collection of ExpMSMSSpectrum 
 * 
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */


define(['Backbone', 'fishtones/models/wet/ExpMSMSSpectrum', ], function(Backbone, ExpMSMSSpectrum) {
    var ExpMSMSSpectrumCollection = Backbone.Collection.extend({
        model : ExpMSMSSpectrum,
        defaults : {
        },
        initialize : function(options) {
            var self = this;
        }
    });
    return ExpMSMSSpectrumCollection;
});
