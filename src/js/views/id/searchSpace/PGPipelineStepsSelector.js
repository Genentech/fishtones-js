/*
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define(['underscore', 'jquery', 'Backbone', 'fishtones/models/id/searchSpace/PGPipelineStepsDico', 'text!fishtones-templates/id/searchSpace/pg-pipeline-steps-selector.html', 'text!fishtones-templates/id/searchSpace/pg-pipeline-steps-selector-one-category.html'], function(_, $, bb, pgPipelineStepsDico, tmpl, tmplOneCat) {
    var selBut = bb.View.extend({
        initialize : function(opts) {
            var self = this;
            self.pipeline = opts.pipeline;

        },
        render : function() {
            var self = this;
            var tmpl = '<td><button class="btn btn-link">+ {{name}}</button></td>';
            var but = $(_.template(tmpl, self.model.attributes));
            but.click(function() {
                self.addToPipeline()
            })
            $(self.el).append(but);
        },
        addToPipeline : function() {
            var self = this;
            self.pipeline.add(self.model)
        }
    })

    return bb.View.extend({
        initialize : function(opts) {
            var self = this;
            self.model = pgPipelineStepsDico;
            self.pipeline = opts.pipeline;

            self.model.on('change', function() {
                self.render()
            });
            self.categoryOrder = {
                'varModif' : 1,
                'fixModif' : 5,
                'cleavageEnzyme' : 10
            }
            self.categoryAliases = {
                'varModif' : 'potential',
                'fixModif' : 'sample prep',
                'cleavageEnzyme' : 'cleavage enzyme'
            }
        },
        events : {
            'click button.add-step' : 'addStep'
        },
        render : function() {
            var self = this;
            var el = $(self.el);

            el.empty();
            var elTot = $(tmpl);
            el.append(elTot);

            var map = self.model.byCategory();
            var keys = _.sortBy(_.keys(map), function(k) {
                return self.categoryOrder[k] || 999;
            });

            _.each(keys, function(cat) {
                var elCat = $(_.template(tmplOneCat, {
                    name : self.categoryAliases[cat] || cat
                }));
                var tbody =elCat.find('tbody');
                _.each(map[cat], function(oneStep){
                    var tr = $('<tr/>')
                    tbody.append(tr);
                    new selBut({el:tr, model:oneStep, pipeline:self.pipeline}).render();
                })
                
                elTot.append(elCat)
            });

            // _.each(, function(s) {
            // new selBut({
            // el : self.el,
            // model : s,
            // pipeline : self.pipeline
            // }).render();
            // });

        },
        addStep : function(evt) {
            var self = this;

        }
    });
});
