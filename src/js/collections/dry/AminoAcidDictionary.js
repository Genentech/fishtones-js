/*
 * A singleton amino acid dictionary, loaded from json fil data/aminoAcid.js
 * 
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define(['fishtones/models/dry/AminoAcid', 'fishtones/data/aminoAcids'], function(AminoAcid, bs_aminoacids) {
    var AminoAcidDictionary = Backbone.Collection.extend({

        model : AminoAcid,
        defaults : {
        },
        initialize : function(options) {
            var self = this;
            self.add(bs_aminoacids);
        }
    });
    return new AminoAcidDictionary();
});
