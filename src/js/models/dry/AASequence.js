/*
 * An amino acid sequence, with
 * - accessioncode
 * - name
 * - sequence
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define(['jquery', 'underscore', 'Backbone'], function($, _, Backbone) {
    var AASequence = Backbone.Model.extend({
        idAttribute : 'name',
        defaults : {
            name : null,
            accessionCode : null,
            sequence : null
        },
        initialize : function() {
        },
        toString : function() {
            var self = this;
            return self.get('accessioncode') + '|' + self.get('name') + ' (' + self.get('sequence').lengh + ')';
        },
        size : function() {
            var s = this.get('sequence')
            if (s == null) {
                return 0
            }
            return s.length
        }
    });
    return AASequence;
}); 
