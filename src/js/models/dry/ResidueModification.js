/*
 * A ResidueModification POJO, wiht properties
 *  - name (unique across the dictionary
 *  - mass
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define(['jquery', 'underscore', 'Backbone'], function($, _, Backbone) {

    var ResidueModification = Backbone.Model.extend({
        idAttribute:'name',
        defaults : {
            mass : -1
        },
        initialize : function() {
        },
        toString : function() {
            var self = this;
            return self.get('name') + '('+self.get('mass')+')';
        }
    });

    return ResidueModification;
});
