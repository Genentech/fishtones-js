/*
 * A singleton cleavage enzyme collection, loaded from data/cleavageEnzymes.js
 * 
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define(['fishtones/models/dry/CleavageEnzyme', 'fishtones/data/cleavageEnzymes'], function(CleavageEnzyme, bs_enzymes) {
    var CleavageEnzymeDictionary = Backbone.Collection.extend({
        model : CleavageEnzyme,
        defaults : {
        },
        initialize : function() {
            var self = this;
            self.add(bs_enzymes);
        }
    });
    return new CleavageEnzymeDictionary();
});
