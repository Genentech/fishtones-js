/*
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define(['underscore', 'Backbone', './PGPipelineStep'], function(_, bb, PGPipelineStep) {
    var PGPipelineStepsDico = bb.Collection.extend({
        list : [{
            category : 'cleavageEnzyme',
            name : 'trypsin'
        }, {
            category : 'fixModif',
            name : 'prop_d0'
        }, {
            category : 'fixModif',
            name : 'prop_d5'
        }, {
            category : 'fixModif',
            name : 'pic'
        }, {
            category : 'varModif',
            name : 'methyl'
        }, {
            category : 'varModif',
            name : 'acetyl'
        }],
        model : PGPipelineStep,
        initialize : function() {
            var self = this;
            self.add(self.list);
        },
        byCategory : function() {
            var self = this;
            return _.groupBy(self.models, function(step){
                return step.get('category');
            })
        }
    });

    return new PGPipelineStepsDico();
});
