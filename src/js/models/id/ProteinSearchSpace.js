/*
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define(['underscore', 'Backbone', './searchSpace/PGPipeline'], function(_, bb, PGPipeline){
    return bb.Model.extend({
        defaults :{
            name:'change me',
            pipeline : new PGPipeline()
        },
        initialize:function(){
            
        },
        toMap: function(){
            var self = this;
            var r = self.toJSON();
            delete r.pipeline;
            r.pipeline = self.get('pipeline').toString()
            return r;
        }
    });
    
});