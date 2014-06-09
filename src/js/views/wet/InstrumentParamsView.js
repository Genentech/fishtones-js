/*
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define(['jquery', 'underscore', 'Backbone', 'fishtones/models/wet/InstrumentParams', 'text!fishtones-templates/wet/instrument-params.html'], function ($, _, Backbone, InstrumentParams, tmpl) {
    InstrumentParamsView = Backbone.View.extend({
        initialize: function () {
            var self = this;

            $(self.el).empty();
            $(self.el).append($(_.template(tmpl, {
                precursorTol: 0,
                fragmentTol: 0,
                id: self.model.get('id')
            })));

            self.input = {
                precursorTol: $(self.el).find('input[name=precursorTol]'),
                fragmentTol: $(self.el).find('input[name=fragmentTol]')
            };
        },
        events: {
            "change input": 'changeInput',
            "change model": 'render'
        },
        render: function () {
            var self = this;
            _.each(self.input, function (el, name) {
                el.val(self.model.get(name));
            });
        },
        changeInput: function (evt) {
            var self = this;
            var name = $(evt.target).attr('name');
            var val = parseFloat($(evt.target).val().trim());
            self.model.set(name, val);
            self.model.save();
        }
    });
    return InstrumentParamsView;
});

