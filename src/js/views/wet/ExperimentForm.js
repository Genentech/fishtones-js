/*
 * Displays and allow live modifications on an experiment.
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define(['jquery', 'Backbone', 'fishtones/models/wet/Experiment', 'fishtones/services/wet/InjectionService', 'text!fishtones-templates/wet/experiment-form.html'], function($, Backbone, Experiment, injectionService, tmpl) {
    ExperimentForm = Backbone.View.extend({
        initialize : function() {
            var self = this;
            self.build();

            //            self.model.on("change", self.render, self)
            injectionService.collection.on("change", self.renderPossibleInjections, self)

        },
        events : {
            "keyup input[name=name]" : function(evt) {
                var val = $(evt.currentTarget).val().trim();
                if (val != "") {
                    this.components.butSubmit.removeClass('btn-info').addClass('btn-success').attr('disabled', null)
                } else {
                    this.components.butSubmit.addClass('btn-info').removeClass('btn-success').attr('disabled', 'disabled')
                }
            },
            "change input[name=name]" : function(evt) {
                var val = $(evt.currentTarget).val().trim();
                this.model.set('name', val)
            },
            "click button" : function(evt) {
                var self = this;

                self.model.save({}, {
                    success : function() {
                        self.render()
                        self.components.butSubmit.addClass('btn-info').removeClass('btn-success').attr('disabled', 'disabled')
                    },
                    error : function() {
                        self.components.butSubmit.addClass('btn-info').removeClass('btn-error')
                    }
                })
                return false;
            },
            "change select" : function(evt) {
                var self = this;
                this.model.injections_add(injectionService.get($(evt.target).val()), {
                    save : true,
                    success : function() {
                        self.render()
                    }
                })
            },
            "change input[type=checkbox]" : function(evt) {
                var self = this;
                var injId = $(evt.currentTarget).val();
                self.model.get('injections').remove(injId);
                self.render();
            }
        },
        build : function() {
            var self = this;
            $(self.el).empty();
            var jqEl = $(_.template(tmpl, {
                name : self.model.get('name'),
            }));
            $(self.el).append(jqEl);

            self.components = {
                form : $(jqEl).find('form'),
                name : $(jqEl).find('input[name=name]'),
                butSubmit : $(jqEl).find(':submit'),
                selInjections : $(jqEl).find('select'),
                ulInjections : $(jqEl).find('ul'),
            }

        },
        render : function() {
            var self = this;
            //put button and select box in update or create mode
            if (self.model.get('id') != undefined) {
                self.components.name.val(self.model.get('name'));
                self.components.butSubmit.html('update');
                $(self.el).find('div.injections').show();
            } else {
                self.components.butSubmit.html('create');
                $(self.el).find('div.injections').hide();
            }

            //fill checkbox
            self.components.ulInjections.empty()
            if (self.model.get('injections')) {
                _.each(self.model.get('injections').models, function(inj) {
                    self.components.ulInjections.append($('<label class="checkbox"><input type="checkbox" value="' + inj.get('id') + '" checked="checked">' + inj.get('name') + '</input></label>'))
                });
            }

            self.renderPossibleInjections()
        },

        renderPossibleInjections : function() {
            var self = this;
            var dejaInj = {};
            if (!self.model || ! self.model.get('injections')) {
                return;
            }
            _.each(self.model.get('injections').models, function(inj) {
                dejaInj[inj.get('id')] = true
            });

            self.components.selInjections.empty();
            self.components.selInjections.append($('<option value="">more injections</option>'))

            _.each(injectionService.listFilteredBy(function(inj) {
                return inj.get('run')
            }), function(inj) {
                var disTag = dejaInj[inj.get('id')] ? ' disabled="disabled"' : '';
                self.components.selInjections.append($('<option value="' + inj.get('id') + '"' + disTag + '>' + inj.get('name') + '</option>'))
            })
        }
    });
    return ExperimentForm;
});

