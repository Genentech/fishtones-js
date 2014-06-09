/*
 * AminoAcid object.
  * Properties:
  * - a code1 (one letter),
  * - a mass.
  *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define(['Backbone'], function(Backbone) {

    var AminoAcid = Backbone.Model.extend({
        idAttribute : 'code1',
        defaults : {
            mass : -1
        },
        initialize : function() {
        },
        toString : function() {
            var self = this;
            return self.get('code1');
        }
    });

    return AminoAcid;
});
