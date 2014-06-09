/*
 * just a collection of PSMAlignment
 * 
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define(['underscore', 'Backbone', 'fishtones/models/match/PSMAlignment'], function(_, Backbone, PSMAlignment){
    PSMAlignmentCollection = Backbone.Collection.extend({
        model:PSMAlignment,
        intialize:function(){
            var self = this;    
            self.fragmentTol = 100000;
        },
        setFragmentTol: function(tol){
            this.fragmentTol=tol
        }
        
    })
    return PSMAlignmentCollection;
});
