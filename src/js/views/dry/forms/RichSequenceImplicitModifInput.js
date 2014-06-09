/**
 * Input widget for a RichSequenceInput field + a checkbox for stating implicit label
 * when the button is pressed, self.action(list<RichSequence>) will be called
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */


define(['jquery', 'underscore', 'Backbone', 'fishtones/models/dry/RichSequence', 'fishtones/services/dry/RichSequenceShortcuter', 'fishtones/services/dry/ImplicitModifier', './RichSequenceInput', 'text!fishtones-templates/dry/forms/richsequence-implicit-modif-input.html'], function ($, _, Backbone, RichSequence, RichSequenceShortcuter, implicitModifier, RichSequenceInput, tmpl) {

    RichSequenceImplicitModifInput = Backbone.View.extend({
        defaults: {
            sequence: '',
            implicitModif: []
        },
        initialize: function (options) {
            var self = this;

            if (options == undefined) {
                options = {}
            }
            self.labels = {
                legend: options.labLegend || 'Fragment your peptide',
                sequence: options.labSequence || 'sequence',
                implicitModif: options.labImplicitModif || 'labeling'
            }
            self.rss = new RichSequenceShortcuter();

            var content = $(_.template(tmpl, {labels: self.labels}));

            $(self.el).append(content);

            var elRsi = content.find('#rich-sequence-input')
            self.richSeqInput = new RichSequenceInput($.extend({}, options, {
                el: elRsi,
                actions: null
            }));


            self.richSeqInput.action = function (rss) {
                var rss2 = self.buildRichSequence();
                self.action(rss2)
            }

            self.action = options.action

        },
        events: {
            //            'change #input-sequence' : 'fire'
        },
        render: function () {
            var self = this;
            self.richSeqInput.render();
        },

        getInputImplicitModif: function () {
            return $(this.el).find('input:checkbox[name=implicitmodif]:checked').map(function () {
                return $(this).val()
            });
        },
        buildRichSequence: function () {
            var self = this;
            var t = [];
            if (self.richSeqInput.model.size() == 0) {
                return null;
            }
            var richSeq = self.richSeqInput.model

            var modifLabels = self.getInputImplicitModif()
            if (modifLabels.length == 0) {
                return [richSeq]
            } else {
                var ret = _.collect(modifLabels, function (lab) {
                    var rs = self.richSeqInput.model.clone()
                    implicitModifier.label(lab, rs)
                    return rs;
                });
                return ret
            }
            // if (self.getInputPropionylation() == 'none') {
            // return [richSeq];
            // }
            // if (self.getInputPropionylation() == 'light') {
            // return [self.rss.propionylatePeptide(richSeq.clone(), false)];
            // }
            // if (self.getInputPropionylation() == 'heavy') {
            // return [self.rss.propionylatePeptide(richSeq.clone(), true)];
            // }
            // if (self.getInputPropionylation() == 'both') {
            // return [self.rss.propionylatePeptide(richSeq.clone(), false), self.rss.propionylatePeptide(richSeq.clone(), true)];
            // }

        },
        saveState: function () {
            var self = this;
            self.saved = {
                implicitModif: getInputImplicitModif(),
                pept: self.richSeqInput.elInput.val()
            }
        },
        restoreState: function () {
            var self = this;
            console.log(self.saved)
        }


    });

    return RichSequenceImplicitModifInput;
});
