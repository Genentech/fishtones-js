/*
 * Cleavage enzyme to cleave protein sequence
 * properties:
 * - name
 * - rule: a regular expression (sintrg or RegExp object)
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define(['underscore', 'Backbone'], function(_, Backbone) {
    var CleavageEnzyme = Backbone.Model.extend({
        idAttribute : 'name',
        defaults : {
            name : '',
            rule : null
        },
        set : function(attrs, options) {
            if (_.isString(attrs.rule)) {
                attrs.rule = new RegExp( attrs.rule, 'g');
            }
            return Backbone.Model.prototype.set.call(this, attrs, options);
        },
        initialize : function() {
        },

        toString : function() {
            var self = this;
            return self.get('name') + self.get('rule');
        },
        /**
         *
         * @param seq an input amino acid string sequence
         * @return {Array} a list of string sequences
         */
        cleave : function(seq) {
            var ret = [];
            var regexp = new RegExp(this.get('rule').source, 'g');
            while ( m = regexp.exec(seq)) {
                ret.push(m[0]);
            }
            return ret
        }
    });
    return CleavageEnzyme;
});
