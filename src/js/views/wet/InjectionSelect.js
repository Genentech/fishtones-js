/*
 * Select an injection
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define(['jquery', 'Backbone', 'fishtones/services/wet/InjectionService'], function($, Backbone, injectionService) {
    InjectionSelect = Backbone.View.extend({
        initialize : function(options) {
            var self = this;
            //            self.model.on("change", self.render, self)
            injectionService.collection.on("change", self.render, self)
            injectionService.load({
                success : function() {
                    self.render()
                }
            })

            self.action = options.action ||
            function(inj) {
                console.log('selected injection ', inj, '(set action to InjectionSelect to have something more meaningful...)')
            }

            var tmpl = '<select name="injection"></name>';
            $(self.el).empty().append($(tmpl));
            self.elSelect = $(self.el).find('select');

        },
        events : {
            "change select" : function(evt) {
                var self = this;

                var val = $(evt.currentTarget).val();
                self.model = injectionService.collection.get(val);
                self.action(self.model);
            }
        },
        render : function() {
            var self = this;
            var tmpl_ok = '<option value="{{id}}">{{name}}</option>'
            var tmpl_problem = '<option value="{{id}}" disabled="disabled">{{name}}</option>'

            self.elSelect.empty();
            self.elSelect.append($('<option value="null">select one injection</option>'));

            var idSel;
            if (self.model && self.model.get('id')) {
                self.elSelect.find('option[value=null]').remove();
                idSel = self.model.get('id')
            }
            
            _.each(injectionService.list(), function(inj) {
                var tmpl = inj.get('run') ? tmpl_ok : tmpl_problem;
                var elOpt = $(_.template(tmpl, {
                    name : inj.get('name'),
                    id : inj.get('id')
                }));
                if (inj.get('id') == idSel) {
                    elOpt.attr('selected', 'selected');
                }
                self.elSelect.append(elOpt)
            });
            return self;
        },
    });
    return InjectionSelect;
});

