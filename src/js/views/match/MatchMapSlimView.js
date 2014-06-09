/**
 * a rectangular, no legend color PSMAlignment widget
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define(['underscore', 'Backbone', '../commons/CommonWidgetView', 'fishtones/services/dry/ImplicitModifier'], function(_, Backbone, CommonWidgetView, implicitModifier) {

    MatchMapSlimView = CommonWidgetView.extend({
        defaults : {
            height : 12,
            tol : 500
        },
        initialize : function(options) {
            MatchMapSlimView.__super__.initialize.call(this, arguments)
            var self = this;
            self.height = options.height || 12;
            self.tol = options.tol || 500;

        },
        render : function() {
            var self = this;

            var theoSpectrum = self.model.get('theoSpectrum');
            var nbSeries = theoSpectrum.get('fragSeries').length

            // get frag series -> ordinate
            var series2j = {};
            var i = 0;
            _.each(theoSpectrum.get('fragSeries'), function(fs) {
                if (series2j[fs[0]] !== undefined) {
                    return
                }
                series2j[fs[0]] = i++;
            });

            var hRow = self.height / _.keys(series2j).length;
            var wCol = hRow;

            var lenSeq = theoSpectrum.get('lenSeq');
            var wText = 30;
            var width = lenSeq * wCol + wText;
            var height = self.height;

            var fs2j = function(fs) {
                return (series2j[fs[0]]) * hRow;
            }
            // data matches
            var dmatches = self.model.closerThanPPM(self.tol);

            var rectBg = self.el.append('rect').attr('class', 'background').attr('width', width).attr('height', height)
            var gRoot = self.el.append('g').attr('class', 'frag-color-match');
            prect = gRoot.selectAll('rect').data(dmatches).enter()
            prect.append('rect').attr('class', function(dm) {
                var irk = dm.exp.intensityRank;
                return "rk-" + ((irk < 40) ? Math.floor(irk / 10) : 'x')
            }).attr('x', function(dm) {
                if (dm.theo.series < 'g')
                    return (dm.theo.pos + 0.5) * wCol
                if (dm.theo.pos == 0)
                    return 0
                return (dm.theo.pos - 0.5) * wCol
            }).attr('y', function(dm) {
                return fs2j(dm.theo.series)
            }).attr('width', function(dm) {
                if ((dm.theo.pos == 0) && (dm.theo.series > 'g'))
                    return wCol / 2;
                if ((dm.theo.pos == lenSeq - 1) && (dm.theo.series < 'g'))
                    return wCol / 2;
                return wCol;
            }).attr('height', hRow).attr('title', function(dm) {
                return dm.theo.label
            });

            var modPos = implicitModifier.nonimplicitModifiedPos(self.model.get('richSequence'));
            gRoot.selectAll('rect.modified-site').data(modPos).enter().append('rect').classed('modified-site', true).attr('x', function(i) {
                return i * wCol;
            }).attr('y', 0).attr('height', self.height).attr('width', wCol);

            var g = self.el.append('g').attr('transform', 'translate(' + (width - wText) + ',0)');
            g.append('rect').classed('match-box-text-bg', true).attr('width', wText).attr('height', self.height);
            
            g.append('g').attr('transform', 'translate('+(wText - 5)+',2),scale('+height+','+height+')').
            append('text').classed('unmatched-factor', true).text("/" + self.model.unmatchedFactor(self.tol, 10))

            self.dim = {
                height : self.height,
                width : width
            }
            return self.dim
        }
    });

    return MatchMapSlimView;
});
