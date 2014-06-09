/**
 * multiple XIC views in one box. XIC is unique by its mass field
 * the scaling context is either passed (if multiple element are sharing the sameone) or built. ranges will be adapted each time a XIC is added
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define(['jquery', 'underscore', 'Backbone', '../utils/b-charts/BChartLines', '../utils/b-charts/BChartData'], function ($, _, Backbone, BChartLines, BChartData) {

    PCMultiXIC = Backbone.View.extend({

        initialize: function (options) {
            var self = this;

        },
        render: function (options) {
            var self = this;
            var jqEl = $(self.el);

            var fgroup = function (xic) {
                //return xic.get('charge') + '-' + xic.get('target');
                if (options && options.label) {
                    return options.label(xic)
                }
                return xic.get('id');
            }
            var points = {
                retentionTimes: [],
                intensities: [],
                label: []
            }

            _.each(self.model, function (xicClip) {
                points.retentionTimes = points.retentionTimes.concat(xicClip.get('retentionTimes'))
                points.intensities = points.intensities.concat(xicClip.get('intensities'))
                var lab = fgroup(xicClip);
                _.times(xicClip.size(), function () {
                    points.label.push(lab)
                })
            });

            var bc = new BChartData();
            _.each(self.model, function (xicClip) {
                bc.add({
                    x: _.collect(xicClip.get('retentionTimes'), function (t) {
                        return t / 60
                    }),
                    y: xicClip.get('intensities'),
                    nodeAttrs: {
                        class: 'chromato charge_' + xicClip.get('charge') + ' target_' + xicClip.get('target')
                    }
                })
            });

            var bcl = new BChartLines();
            bcl.data(bc).render(self.el);
        }
    });
    return PCMultiXIC;
});
