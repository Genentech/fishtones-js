/*
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define(['jquery', 'Backbone', 'text!fishtones-templates/wet/injection-update-form.html'], function($, Backbone, tmpl) {
    InjectionUpdateForm = Backbone.View.extend({
        initialize : function(options) {
            var self = this;
            self.template = options.template || tmpl;
        },
        events : {
            "change input " : function(evt) {
                var self = this;
                var el = $(evt.target);
                var p = {}
                p[el.attr('name')] = el.val()
            },
        },
        build : function() {
            var self = this;
            $(self.el).empty();

        },
        render : function() {
            var self = this;

            var runName = self.model.get('run') ? (self.model.get('run').get('name')) : '-';
            var jqEl = $(_.template(self.template, {
                id:self.model.get('id'),
                name : self.model.get('name'),
                runName : runName,
                precursorTol : self.model.get('instrumentParams').get('precursorTol'),
                fragmentTol : self.model.get('instrumentParams').get('fragmentTol')

            }));
            $(self.el).append(jqEl);
        }
    });
    return InjectionUpdateForm;
});

