/*
 * Build a ProteinGraph (all the paths available for a search)
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define(['jquery', 'underscore', 'fishtones/models/dry/ProteinGraph'], function($, _, ProteinGraph){
    var ProteinGraphService = function(){
       var self = this;
       self.urlRoot='/fishtones/backend/ms/protein/graph';

    }
    
    ProteinGraphService.prototype.fetchBySequence = function(seq, options){
        var self = this;
        var url = self.urlRoot;
        
        var params = $.extend({sequence:seq}, options);
        delete params.success;
        delete params.error;
        
        $.getJSON(url, params, function(data){
            var pg = new ProteinGraph(data);
            options.success(pg);
        })
        
    }
    
    return new ProteinGraphService();
    
})
