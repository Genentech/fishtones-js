/*
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define(['underscore', 'Backbone', 'fishtones/views/id/searchSpace/PGPipelineStepsSelector', 'fishtones/views/id/searchSpace/PGPipelineView', 'text!fishtones-templates/id/protein-search-space.html'], function(_, bb, PGPipelineStepsSelector, PGPipelineView, tmpl) {
    return bb.View.extend({
        initialize : function(opts) {
            var self = this;
            opts = opts || {};

            $(self.el).empty();
            var form = $(tmpl);
            $(self.el).append(form);

            var ppSel = new PGPipelineStepsSelector({
                el : form.find('#pipeline-steps'),
                pipeline : self.model.get('pipeline')
            });
            ppSel.render();

            self.nameToEl = {}
            form.find('.field-holder').each(function() {
                self.nameToEl[$(this).attr('name')] = this;
            });
            new PGPipelineView({
                el : form.find('#pipeline'),
                model : self.model.get('pipeline')
            }).render()
        },
        events : {
            'change model' : 'render',
            'change input' : 'changeInput',
            'click #but-go' : 'submit'
        },
        render : function() {
            var self = this;
        },
        changeInput : function(evt) {
            var self = this;
            var name = $(evt.currentTarget).attr('name')
            self.model.set(name, $(evt.currentTarget).val())
        },
        submit : function() {
            var self = this;
            if (!self.options.submit) {
                console.log('no submit action configured');
                return;
            }
            self.options.submit(self.model);
        }
    });
});
