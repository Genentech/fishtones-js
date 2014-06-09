/*
 * A singleton dictionary for a few protein sequences (mainly histone tails, but add your own...)
 * it allow to get a name to a sequence, but also, if a tryptic peptide sequence is unique across the different AASequence,
 * we can refer to it like H3.3K27
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define(['Backbone', 'fishtones/models/dry/AASequence', 'fishtones/data/aaSequences'], function(Backbone, AASequence, bs_sequences) {
    var AASequenceDictionary = Backbone.Collection.extend({
        model : AASequence,
        defaults : {
        },
        initialize : function(options) {
            var self = this;
            self.add(bs_sequences);
        }
    });
    return new AASequenceDictionary();
});
