/*
 * A theoretical spectrum pojo, made out from a RichSequence and a set of fragmentation series
 * Properties:
 * - richSequence
 * - peaks
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define(['underscore', 'Backbone'], function(_, Backbone) {
    var TheoSpectrum = Backbone.Model.extend({
        defaults : {
            richSequence : null,
        },
        initialize : function() {
        },
        /**
         * @return the list of m/z. we need that to have a kind of 'abstraction' over MassList
         */
        mozs:function(){
            return _.pluck(this.get('peaks'), 'moz');
        },
        size:function(){
            return this.get('peaks').length;
        }
        
    });
    return TheoSpectrum;
});
