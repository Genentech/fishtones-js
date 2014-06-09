/*
 * Get the instrument parameters.
 * Mainly:
 * - precursorTol
 * - fragmentTol
 * Tolerance are expressed in ppm
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define([
    'Backbone',
    'Config'
], function (Backbone, config) {
    var InstrumentParams = Backbone.Model.extend({
        defaults: {
            fragmentTol: undefined,
            precursorTol: undefined,
        },
        url: function () {
            return config.get('wet.url.rest') + '/instrumentparams/' + this.get('id')
        },
        initialize: function () {
            var self = this;
        },
        toString: function () {
            var self = this;
            return 'tol:' + self.get('precursorTol') + '/' + self.get('fragmentTol');
        },
        toJson: function () {
            var self = this;
            return {
                precursorTol: self.get('precursorTol'),
                fragmentTol: self.get('fragmentTol')
            }
        },

    });
    return InstrumentParams;
});
