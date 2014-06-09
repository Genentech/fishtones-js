/*
 * CleavageEnzyme selector based on the CleavageEnzymeDictionary
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define(['jQuery', 'Underscore', 'Backbone', 'text!templates/dry/forms/CleavageEnzymeSelectorTemplate.html', 'collections/dry/CleavageEnzymeDictionary'], function($, _, Backbone, CESelTmpl, CleavageEnzymeDictionary) {
    var CleavageEnzymeSelectorView = Backbone.View.extend({
//        el : $("#content"),
//        model:function(){return },
        events : {
            "change input" : "pipo"
        },
        initialize : function() {
            var self=this;
            _.bindAll(this, 'render', 'pipo');
            CleavageEnzymeDictionary.bind('reset', self.render);
        },
        render : function(options) {
            var compiledTemplate = _.template(CESelTmpl, CleavageEnzymeDictionary);
            $(this.el).html(compiledTemplate);
        },
        pipo : function(e) {
            console.log('pipo CleavageEnzymeSelectorView')
        }
    });
    return  CleavageEnzymeSelectorView;
});

