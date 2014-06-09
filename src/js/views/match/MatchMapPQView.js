/*
 * the disk with unrolled peptide coverage for PSM
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define(['underscore', 'Backbone', '../commons/CommonWidgetView', './MatchMapSlimView', 'fishtones/views/utils/PQView', './MatchSpectrumView'], function(_, Backbone, CommonWidgetView, MatchMapSlimView, PQView, MatchSpectrumView) {

    MatchMapPQView = CommonWidgetView.extend({
        initialize : function(options) {
            var self = this;
            MatchMapPQView.__super__.initialize.call(this, arguments)

            self.radius = options.radius|| 24;
            self.tol = options.tol|| 498;


            var spma = self.model;
            var widget = new PQView(self.el, {
                radius : self.radius,
                onclick : function() {
                    var widgetSpectrum = new MatchSpectrumView({
                        model : spma,
                        flying : true,
                        editUrl:'/fishtones/id/#interactive/'+self.model.get('expSpectrum').get('id')+'/'+self.tol+'/'+self.model.get('richSequence').toString(),
                        height:200,
                        width:480
                    });
                    // //widgetSpectrum.show();
                    widgetSpectrum.render()
                }
            });
            var sectorClasses = new Array(self.model.get('richSequence').size())
            for ( isc = 0; isc < sectorClasses.length; isc++) {
                sectorClasses[isc] = 'sector-rk-none';
            }
            _.chain(spma.closerThanPPM(self.tol)).filter(function(m) {
                return Math.abs(m.errorPPM) <= 499
            }).groupBy(function(m) {
                return m.theo.pos
            }).each(function(gp) {
                var pos = gp[0].theo.pos
                var rk = _.chain(gp).map(function(m) {
                    return m.exp.intensityRank
                }).min().value();
                sectorClasses[pos] = 'sector-rk-' + ((rk < 40) ? Math.floor(rk / 10) : 'x')
            });

            widget.build(sectorClasses, function(cnt) {
                var r = new MatchMapSlimView({
                    model : spma,
                    el : cnt,
                    tol : self.tol,
                    height : self.radius
                });
                return r.render();
            });
            self.widgetPQ = widget;
        },
        clccc : function() {
            console.log('CLAKK')
        },

        render : function() {
            var self = this;
            self.widgetPQ.draw();
        },

        move : function(i, j) {
            this.widgetPQ.move(i, j);
        }
    });

    return MatchMapPQView;
});

