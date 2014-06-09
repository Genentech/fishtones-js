/*
 * SVG render of theoretical fragment on a sequence
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define(['underscore', 'Backbone', 'd3'], function(_, Backbone, d3) {

    TheoOnSequenceView = Backbone.View.extend({
        defaults : {
        },

        render : function() {
            var self = this;

            var theoSpectrum = self.model;

            var wUnit = 65;
            var hUnit = 15;

            var width = (theoSpectrum.get('richSequence').size() + 1) * wUnit;
            var height = (theoSpectrum.get('fragSeries').length + 2 ) * hUnit;

            self.viz = d3.select(self.el).append("svg").attr('class', 'd3-widget-theo-on-sequence').attr("width", width).attr("height", height);

            var series2i = {};
            var i_c = 0;
            var i_n = 0;
            _.each(theoSpectrum.get('fragSeries'), function(fs) {
                if (fs < 'm') {// nterm
                    i_n = i_n - 1;
                    series2i[fs] = i_n;
                } else {
                    i_c = i_c + 1
                    series2i[fs] = i_c;
                }
            });
            i_n -= 0.5;

            var richSeq = theoSpectrum.get('richSequence');
            self.viz.append('g').selectAll('text.aa').data(richSeq.get('sequence')).enter().append('text').attr('class', 'aa').attr('x', function(aa, i) {
                return (i + 1) * wUnit;
            }).attr('y', (-i_n + 0.5) * hUnit).text(function(raa) {
                return raa.aa.get('code1');
            });

            var size = richSeq.size();
            var modifs = [richSeq.getModificationArray(-1)].concat(_.collect(richSeq.get('sequence'), function(raa) {
                return raa.modifications
            })).concat([richSeq.getModificationArray(size)]);
            self.viz.append('g').selectAll('text.aa-modif').data(modifs).enter().append('text').attr('class', 'aa-modif').attr('x', function(mods, i) {
                if(i==0){
                    return wUnit *0.45;
                }
                if(i==size){
                    return (i-0.45)*wUnit;
                }
                return i * wUnit;
            }).attr('y', (-i_n + 0.5) * hUnit + 10).text(function(mods) {
                if (mods == undefined) {
                    return ''
                }
                return _.collect(mods, function(m) {
                    return m.get('name');
                }).join(',');

            }).style('text-anchor', function(mods, i){
                if(i==0){
                    return 'end';
                }
                if(i==size){
                    return 'start';
                }
                return 'middle'
            });

            var peak2pos = function(p) {
                var series = p.series;
                if (series < 'm') {
                    return {
                        isNterm : true,
                        x : wUnit * (p.pos + 1.5) - 7,
                        y : (series2i[series] - i_n) * hUnit
                    }
                }
                return {
                    isNterm : false,
                    x : wUnit * (p.pos + .5) + 7,
                    y : (series2i[series] - i_n + 1) * hUnit
                }
            }
            self.viz.append('g').selectAll('path.fragment').data(theoSpectrum.get('peaks')).enter().append('path').attr('class', 'fragment').attr('d', function(p) {
                var series = p.series;
                var pos = peak2pos(p)
                if (pos.isNterm) {
                    return 'M' + pos.x + ',' + pos.y + 'l7,3 l0,' + (hUnit - 5);
                } else {
                    return 'M' + pos.x + ',' + pos.y + 'l-7,-3 l0,' + (-hUnit + 5);
                }
            });
            self.viz.append('g').selectAll('text.frag-moz.peaks').data(theoSpectrum.get('peaks')).enter().append('text').attr('class', 'frag-moz peaks').attr('x', function(p) {
                var pos = peak2pos(p);
                return pos.x + (pos.isNterm ? -3 : +3);
            }).attr('y', function(p) {
                return peak2pos(p).y + 3;
            }).style('text-anchor', function(p) {
                return peak2pos(p).isNterm ? 'end' : 'start';
            }).text(function(p) {
                return p.moz.toFixed(4)
            });

            //add fragseries name on left/right column
            var dSeriesNames = _.zip(_.keys(series2i), _.values(series2i));
            self.viz.append('g').selectAll('text.frag-moz.legend').data(dSeriesNames).enter().append('text').attr('class', 'frag-moz legend').attr('x', function(p) {
                return (p[0] < 'm') ? 5 : (width - 5);
            }).attr('y', function(p) {
                var pk = {
                    series : p[0],
                    pos : 0
                }
                return peak2pos(pk).y + 3;
            }).style('text-anchor', function(p) {
                return (p[0] > 'm') ? 'end' : 'start';
            }).text(function(p) {
                return p[0];
            });

        }
    });

    return TheoOnSequenceView;
});
