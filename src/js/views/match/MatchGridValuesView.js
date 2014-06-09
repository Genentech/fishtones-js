/**
 * this is a grid for displaying a spectrum/peptide match. The classic stuff, as
 * a html table, adding color and so...
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define(['underscore', 'Backbone', '../commons/CommonWidgetView'], function (_, Backbone, CommonWidgetView) {

    MatchGridValuesView = CommonWidgetView.extend({
        initialize: function (options) {
            var self = this;
            MatchGridValuesView.__super__.initialize.call(this, arguments)

            options = $.extend({}, options);
            self.height = options.height || 400;
            self.width = options.width || 300;
            self.tol = options.tol || 500;

            self.el.classed('d3-widget-match-grid-values', true)
        },
        render: function () {

            var self = this;

            var theoSpectrum = self.model.get('theoSpectrum');
            var nbSeries = theoSpectrum.get('fragSeries').length

            self.el.append('rect').attr('class', 'background').attr('width', self.width).attr('height', self.height)
            // get frag series -> ordinate
            var series2i = {};
            var i_c = 0;
            var i_n = 0;
            _.each(theoSpectrum.get('fragSeries'), function (fs) {
                if (fs < 'm') {// nterm
                    i_n = i_n - 3;
                    series2i[fs] = i_n + 2;
                } else {
                    i_c = i_c + 3
                    series2i[fs] = i_c + 2;
                }
            });

            // we have to scale [0:(width - 2*10)] x [0-height] to [i_n:i_c+1] x
            // [-1: theoSpectrum.richSequence.size()]
            var richSeq = theoSpectrum.get('richSequence');
            var size = richSeq.size();

            var scale = Math.min(((self.width) / (i_c + 1 - i_n + 3)), (self.height / (size + 1)));
            var transf = 'scale(' + scale + ',' + scale + '),translate(' + (-i_n + 1) + ',1.7)';

            var gCont = self.el.append('g').attr('transform', transf);

            var fs2i = function (fs) {
                return series2i[fs];
            }
            // data matches
            var dmatches = self.model.closerThanPPM(self.tol);

            gCont.selectAll('text.aa').data(richSeq.get('sequence')).enter().append('text').attr('class', 'aa').attr('x', 1).attr('y', function (d, i) {
                return i + 0.5
            }).text(function (d) {
                return d.aa.get('code1')
            });

            var modifs = [richSeq.getModificationArray(-1)].concat(_.collect(richSeq.get('sequence'), function (raa) {
                return raa.modifications
            })).concat([richSeq.getModificationArray(size)]);
            gCont.selectAll('text.aa-modif').data(modifs).enter().append('text').attr('class', 'aa-modif').attr('x', 1).attr('y', function (d, i) {
                if (i == size) {
                    return i + 0.32 - 0.5 + 0.5
                }
                return i + 0.32 - 1 + 0.5;
            }).text(function (mods) {
                if (mods == undefined) {
                    return ''
                }
                return _.collect(mods, function (m) {
                    return m.get('name');
                }).join(',');

            });

            gCont.selectAll('text.series').data(theoSpectrum.get('fragSeries')).enter().append('text').attr('class', 'series').attr('x', function (d) {
                return series2i[d];
            }).attr('y', -1).text(function (d) {
                return d;
            });

            var poslab = [];
            for (i = 1; i <= size; i++) {
                poslab.push(i)
            }
            gCont.selectAll('text.poslabel.nterm').data(poslab).enter().append('text').attr('class', 'poslabel nterm').attr('x', i_n - 0.9).attr('y', function (d, i) {
                return i + 1
            }).text(function (d) {
                return d
            });
            gCont.selectAll('text.poslabel.cterm').data(poslab).enter().append('text').attr('class', 'poslabel cterm').attr('x', i_c + 2.9).attr('y', function (d, i) {
                return size - i - 1
            }).text(function (d) {
                return d
            });

            gCont.selectAll('text.theofrag').data(theoSpectrum.get('peaks')).enter().append('text').attr('class', 'theofrag').attr('x', function (p) {
                return series2i[p.series]
            }).attr('y', function (p) {
                return (p.series < 'g') ? (p.pos + 1) : p.pos
            }).text(function (p) {
                return p.moz.toFixed(2);
            });

            gCont.selectAll('rect.matching').data(dmatches).enter().append('rect').attr('class', function (d) {
                var irk = d.exp.intensityRank;
                return "matching rk-" + ((irk < 40) ? Math.floor(irk / 10) : 'x')
            }).attr('x', function (d) {
                return series2i[d.theo.series] - 2.8
            }).attr('y', function (d) {
                return (d.theo.series < 'g') ? (d.theo.pos - 0.7 + 1) : (d.theo.pos - 0.7);
            }).attr('width', 3).attr('height', 1);
        }
    });

    return MatchGridValuesView;
});
