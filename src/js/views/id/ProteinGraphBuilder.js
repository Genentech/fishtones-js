/*
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define(['underscore', 'Backbone', 'fishtones/models/dry/ProteinGraph', 'fishtones/services/dry/ProteinGraphService', 'fishtones/views/dry/ProteinGraphView', 'fishtones/models/id/ProteinSearchSpace', 'fishtones/views/id/ProteinSearchSpaceView', 'text!fishtones-templates/id/protein-graph-builder.html'], function(_, bb, ProteinGraph, proteinGraphService, ProteinGraphView, ProteinSearchSpace, ProteinSearchSpaceView, tmpl) {
    return bb.View.extend({
        initialize : function(opts) {
            var self = this;
            opts = opts || {};

            self.container = $(tmpl);
            self.model = new ProteinSearchSpace();

            self.elOutput = self.container.find('#output');
            self.elOutput.height("300")

            self.params = new ProteinSearchSpaceView({
                el : self.container.find('#params'),
                model : self.model,
                submit : function() {
                    self.update()
                }
            })
            self.model.get('pipeline').setCallback(function(){
                self.update()
            })
        },
        update : function() {
            var self = this;
            var args = self.model.toMap()
            var seq = args.sequence;
            delete args.sequence;
            args.success = function(pg) {
                self.elOutput.empty();
                new ProteinGraphView({
                    el : self.elOutput,
                    model : pg
                }).render()
            }
            proteinGraphService.fetchBySequence(seq, args);
        },
        render : function() {
            var self = this;
            $(self.el).empty();
            $(self.el).append(self.container);

        }
    });
});
