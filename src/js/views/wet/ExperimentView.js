/*
 * Shows experiment details
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define(['jquery', 'Backbone', 'fishtones/models/wet/Experiment', 'fishtones/views/wet/InjectionView', 'text!fishtones-templates/wet/experiment.html'], function($, Backbone, Experiment, InjectionView, tmpl) {
    ExperimentView = Backbone.View.extend({
        initialize : function(options) {
            var self = this;
            self.model.on("change", self.render, self);
        },
        render : function() {
            var self = this;
            $(self.el).empty();
            var jqEl = $(_.template(tmpl, {
                name : self.model.get('name'),
            }));
            $(self.el).append(jqEl);

            var elInj = jqEl.find('.injections');
            elInj.empty();

            _.each(self.model.get('injections').models, function(inj) {
                var div = $('<div class="injection"></div>')
                new InjectionView({
                    model : inj,
                    el : div
                }).render()
                elInj.append(div);
            });
        }
    });
    return ExperimentView;
});

