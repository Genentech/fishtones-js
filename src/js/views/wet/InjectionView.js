/*
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define(['jquery', 'underscore', 'Backbone', 'fishtones/models/wet/Injection', 'text!fishtones-templates/wet/injection.html', 'fishtones/views/wet/InstrumentParamsView'], function($, _, Backbone, Injection, tmpl, InstrumentParamsView) {
    InjectionView = Backbone.View.extend({
        initialize : function(options) {
            var self = this;
            self.model.on("change", self.render, self)
            self.options = options;
        },
        render : function() {
            var self = this;
            $(self.el).empty();
            var jqEl = $(_.template(tmpl, {
                name : self.model.get('name'),
                runName : self.model.get('run') ? self.model.get('run').get('name') : 'syntax error'
            }));
            
            $(self.el).append(jqEl);
            new InstrumentParamsView({
                el : jqEl.find('.instrument-params'),
                model : self.model.get('instrumentParams')
            }).render()

            if(self.options.hide){
                _.each(self.options.hide, function(clazz){
                    jqEl.find('.'+clazz).hide()
                })
            }
            
        }
    });
    return InjectionView;
});

