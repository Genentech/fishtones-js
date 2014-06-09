/*
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define(['underscore', 'jquery', 'Backbone'], function(_, $, bb) {
    var PipeEl = bb.View.extend({
        initialize : function(opts) {
            var self = this;
            self.pipeline = opts.pipeline;

        },
        render : function() {
            var self = this;
            var tmpl = '<li class="pg-pipeline-step {{category}}"><button class="btn btn-link">{{name}} (-)</button> <span class="divider">/</span>';
            var li = $(_.template(tmpl, self.model.attributes));
            li.click(function() {
                self.removeFromPipeline()
            })
            $(self.el).append(li);
        },
        removeFromPipeline : function() {
            var self = this;
            self.pipeline.remove(self.model)
        }
    })

    return bb.View.extend({
        initialize : function() {
            var self = this;

            $(self.el).empty();
            self.ul = $('<ul class="breadcrumb"/>')
            $(self.el).append(self.ul)

            self.model.bind("reset add remove", self.render, self);

        },
        events : {
            'click ul' : 'removeOne'
        },
        render : function() {
            var self = this;

            self.ul.empty()
            _.each(self.model.models, function(s) {
                new PipeEl({
                    model : s,
                    el : self.ul,
                    pipeline : self.model
                }).render();
            });
        },
        removeOne : function(evt) {
            var self = this;
        }
    });
});
