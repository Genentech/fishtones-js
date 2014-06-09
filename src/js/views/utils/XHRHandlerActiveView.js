/*
 * Make a widget visible or not when ajax request are on pending mode
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define(['underscore', 'jquery', 'Backbone', '../../services/utils/XHRHandler'], function (_, $, bb, xhrHandler) {
    return bb.View.extend({
        initialize: function () {
            var self = this;

            self.model = xhrHandler;
            self.model.on('change', function () {
                self.render()
            })
        },

        render: function () {
            var self = this;
            if (self.model.count() > 0) {
                $(self.el).show();
                return
            } else {
                $(self.el).hide();
            }
        }
    });
});
