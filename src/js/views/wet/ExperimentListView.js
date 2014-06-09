/*
 * list all experiments
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define(['jquery', 'underscore', 'Backbone', 'bootbox', 'fishtones/services/wet/ExperimentService', 'fishtones/views/wet/InjectionView', 'text!fishtones-templates/wet/experiment-list.html', 'text!fishtones-templates/wet/experiment-list-line.html'], function ($, _, Backbone, Bootbox, experimentService, InjectionView, tmpl_list, tmpl_list_line) {
    ExperimentListView = Backbone.View.extend({
        initialize: function (options) {
            var self = this;
            experimentService.load({
                success: function (col) {
                    self.model = col;
                    self.renderData();
                }
            });
            if (options.actions) {
                self.actions = options.actions;
            } else {
                self.actions = [];
            }
            $(self.el).empty();
            var cont = $(tmpl_list);
            $(self.el).append(cont);
            self.contTBody = $(self.el).find('tbody');

        },
        events: {
            'change model': 'render',
            'click button.experiment-action': 'experimentAction',
        },
        render: function () {
            var self = this;
            self.renderData()

        },
        renderData: function () {
            var self = this;
            if (self.model === undefined) {
                return;
            }
            self.contTBody.empty()
            _.chain(self.model.models).sortBy(function (inj) {
                return -inj.get('id');
            }).each(function (exp) {
                var d = $('<tr>' + _.template(tmpl_list_line, {
                    id: exp.get('id'),
                    name: exp.get('name')
                }) + '</tr>')

                //add action buttons
                var tdButs = d.find('td.action-cell')
                var tmpl_but = '<button class="btn btn-{{btnClass}} experiment-action" action="{{name}}">{{name}}</button>';
                _.each(self.actions, function (act) {
                    var tEl = $(_.template(tmpl_but, act));
                    tdButs.append(tEl);
                    tEl.attr('confirm', act.confirm);
                });
                self.contTBody.append(d);

                //add injections informations
                var tdInj = d.find('td.injections')
                _.each(exp.get('injections').models, function (inj) {
                    var div = $('<div class="injection"></div>')
                    new InjectionView({
                        model: inj,
                        el: div
                    }).render()
                    tdInj.append(div);
                });

            })
        },
        /**
         * call the action registered with the button. Maybe launch a confirm modal if the attribute exists
         * @param {Object} evt
         */
        experimentAction: function (evt) {
            var self = this;
            var but = $(evt.currentTarget);
            but.attr('disabled', 'disabled');
            var actionName = but.attr('action');
            var id = $(but.parent()).attr('id');
            var exp = self.model.get(id);
            var actionApply = _.find(self.actions, function (a) {
                return a.name == actionName
            })
            var cb = function () {
                actionApply.callback(self.model, exp, function () {
                    self.renderData()
                })
            }
            var confirm = but.attr('confirm')
            if (confirm) {
                Bootbox.confirm(confirm, function (result) {
                    if (result) {
                        cb()
                    } else {
                        but.attr('disabled', null);
                    }
                });
            } else {
                cb();
            }
        }
    });
    return ExperimentListView;
});
