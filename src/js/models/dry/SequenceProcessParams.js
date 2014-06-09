/*
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define([
    'jquery',
    'underscore',
    'Backbone',
    'fishtones/collections/dry/CleavageEnzymeDictionary',
    './CleavageEnzyme'
], function ($, _, Backbone, CleavageEnzymeDictionary, CleavageEnzyme) {
    var SequenceProcessParams = Backbone.Model.extend({
        defaults: {
            cleavageEnzyme: 'trypsin_R',
            maxMissedCleavages: 1,
        },
        initialize: function () {
            var self = this;
        },
        toString: function () {
            var self = this;
            return self.get('name') + ' /' + self.get('rule') + '/';
        },
        toJson: function () {
            var self = this;
            return {
                cleavageEnzyme: self.get('cleavageEnzyme'),
                maxMissedCleavages: self.get('maxMissedCleavages')
            }
        },

    });
    return SequenceProcessParams;
});
