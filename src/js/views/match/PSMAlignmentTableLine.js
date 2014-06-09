/*
 * one <td> element for the PSMAlignmentTable
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define(['jquery', 'underscore', 'Backbone', 'fishtones/services/dry/MassBuilder', 'fishtones/views/match/MatchMapSlimView', 'fishtones/views/match/MatchSpectrumView', 'fishtones/models/utils/FavorizableItem', 'fishtones/views/utils/FavorizableItemView', 'text!fishtones-templates/match/psm-table-line.html'], function ($, _, Backbone, massBuilder, MatchMapSlimView, MatchSpectrumView, FavorizableItem, FavorizableItemView, tmpl) {

    PSMAlignmentTableLine = Backbone.View.extend({
        initialize: function (options) {
            var self = this;
            $(self.el).empty();
            $(self.el).append(tmpl)

            self.hide = {}
            if (options.hide) {
                _.each(options.hide, function (h) {
                    self.hide[h] = true;
                })
            }
        },
        render: function (options) {
            var self = this;
            $(self.el).empty();
            var mExp = self.model.get('expSpectrum').get('precMoz')
            var mTheo = massBuilder.computeMassRichSequence(self.model.get('richSequence'), self.model.get('expSpectrum').get('precCharge'))

            var sp = $.extend({}, self.model.get('expSpectrum').attributes)
            sp.precMoz = sp.precMoz.toFixed(4);
            sp.rtMin = (sp.retentionTime / 60).toFixed(1)
            var pept = self.model.get('richSequence').toString();

            var cont = _.template(tmpl, {
                expSpectrum: sp,
                peptide: pept,
                fragmentTol: options.fragmentTol,
                delta: {
                    da: ((mExp - mTheo) * self.model.get('expSpectrum').get('precCharge')).toFixed(4),
                    ppm: (2000000 * (mExp - mTheo) / (mExp + mTheo)).toFixed(1)
                }
            });

            $(self.el).append(cont);
            _.each(self.hide, function (h, k) {
                $(self.el).find('.' + k).hide();
            })

            //            self.renderFavorize();

            var svg = $('<svg height="20"/>');
            $(self.el).find('td.match-map.small').append(svg);
            var slim = new MatchMapSlimView({
                el: svg,
                model: self.model,
                tol: options.fragmentTol,
                height: 20
            });
            slim.render();
            svg.attr('width', slim.dim.width)

            svg = $('<svg width="500" height="200"/>');
            $(self.el).find('td.match-map.large').append(svg);

            var widgetMatchSpectrum = new MatchSpectrumView({
                el: svg,
                model: self.model,
                tol: options.fragmentTol,

                height: 200,
                width: 500,
                xZoomable: true
            });
            widgetMatchSpectrum.render();
            self.widgetMatchSpectrum = widgetMatchSpectrum;

        },
        renderFavorize: function () {
            var self = this;
            ;
            var fav = new FavorizableItem({
                obj: self.model,
                type: 'psm',
                id: self.model.computeId()
            });
            var view = new FavorizableItemView({
                el: $(self.el).find('td.matchFavorize'),
                model: fav
            });
            self.favorize = fav
        }
    });

    return PSMAlignmentTableLine;
});
