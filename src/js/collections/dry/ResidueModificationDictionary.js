/*
 * A singleton dictionary for residue modifications, loaded from data/resiueModifications.js, a transform from Unimod,
 * but any modification can be added as long as the name is unique.
 * 
 * Copyright (c) 2013-14, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define([ 'Backbone', 'fishtones/models/dry/ResidueModification', 'fishtones/data/residueModifications'], function(Backbone, ResidueModification, bs_resmod) {
    var ResidueModificationDictionary = Backbone.Collection.extend({

        model : ResidueModification,
        defaults : {
        },
        initialize : function(options) {
            var self = this;
            self.add(bs_resmod);
        }
    });
    return new ResidueModificationDictionary();
});
