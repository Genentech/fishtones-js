/*
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define(['underscore', 'Backbone', './PGPipelineStep'], function(_, bb, PGPipelineStep) {
    return bb.Collection.extend({
        model : PGPipelineStep,
        initialize : function() {
            var self = this;
            
            self.on('add', function() {
                self.onChange();
            })
            self.on('remove', function() {
                self.onChange();
            })
        },
        setCallback:function(cb){
          this.callback = cb  
        },
        onChange : function() {
            var self = this;
            if (self.callback) {
                self.callback(self);
            }
        },
        toString : function() {
            var self = this;
            return _.collect(self.models, function(s){
                return s.get('category')+":"+s.get('name');
            }).join(";")
        }
    });
});
