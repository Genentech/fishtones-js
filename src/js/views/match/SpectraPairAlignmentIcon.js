/*
 * a compact iconic view of Spectrum/Spectrum alignment
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define(['underscore', 'd3', '../commons/CommonWidgetView', 'fishtones/utils/DeltaMass', 'fishtones/views/utils/D3ScalingContext', 'fishtones/views/utils/D3ScalingArea'], function (_, d3, CommonWidgetView, DeltaMass, D3ScalingContext, D3ScalingArea) {

    var projectSpectrum = function (expSp, sample) {
        return {
            precursor: {
                scanNumber: expSp.get('scanNumber'),
                id: expSp.get('id')
            },
            peaks: _.chain(expSp.get('mozs')).zip(expSp.get('intensities'), expSp.get('intensityRanks')).map(function (p, i) {
                return {
                    moz: p[0],
                    intensityRank: p[2],
                    origIndex: i,
                    sample: sample
                };
            }).value()
        }
    }
    var SpectraPairAlignmentIcon = CommonWidgetView.extend({
        defaults: {
        },
        initialize: function (options) {
            options = $.extend({}, options);
            SpectraPairAlignmentIcon.__super__.initialize.call(this, options)
            var self = this;

            self.maxPeaks = options.maxPeaks || 50;
            self.fragTol = options.fragTol || 20;

            self.build();
            self.model.on('change', function () {
                self.build().render();
            })
        },
        build: function () {
            return this.buildData().buildContext().buildD3();
        },
        buildData: function () {
            var self = this;
            self.spA = projectSpectrum(self.model.get('spectrumA'), 0);
            self.spB = projectSpectrum(self.model.get('spectrumB'), 1);

            //label the peaks
            var pkBins = [
                [],
                []
            ]

            //one projected peaks contains [moz, intensity, intensityRank, isMatching, sampleName, overallNumber]

            self.sortedMatchedPeaks = _.chain(self.spA.peaks.concat(self.spB.peaks)).filter(function (p) {
                return p.intensityRank < self.maxPeaks;
            }).sortBy(function (p) {
                return p.moz;
            }).map(function (p, i) {
                p.binIndex = i;
                p.matched = false;
                pkBins[p.sample][p.origIndex] = i;
                return p;
            }).value();

            var matches = self.model.closerThanPPM(self.fragTol);
            _.each(matches, function (m) {
                if ((m.pkB.intensityRank >= self.maxPeaks) || (m.pkA.intensityRank >= self.maxPeaks))
                    return;
                self.sortedMatchedPeaks.push({
                    sample: 1,
                    binIndex: pkBins[0][m.pkA.index],
                    intensityRank: m.pkB.intensityRank,
                    matched: true
                });
                self.sortedMatchedPeaks.push({
                    sample: 0,
                    binIndex: pkBins[1][m.pkB.index],
                    intensityRank: m.pkA.intensityRank,
                    matched: true
                })

                self.sortedMatchedPeaks[pkBins[1][m.pkB.index]].matched = true
                self.sortedMatchedPeaks[pkBins[0][m.pkA.index]].matched = true


            })

            return self;
        },
        buildContext: function () {
            var self = this;

            self.scalingContext = new D3ScalingContext({
                xDomain: [0, 2 * self.maxPeaks],
                yDomain: [2, 0],
                height: self.height(),
                width: self.width()
            })

            return self;
        },
        buildD3: function () {
            var self = this;
            self.vis = self.el.append('svg');
            self.vis.attr('width', self.width()).attr('height', self.height()).attr('class', 'spectra-pair-icon');
            self.vis.append('rect').attr('class', 'background').attr('height', '100%').attr('width', '100%');

            self.peaksHolder = self.vis.selectAll('rect.peak-bin').data(self.sortedMatchedPeaks).enter().append('rect').attr('class', 'peak-bin');
            return self;
        },
        render: function () {
            var self = this;
            var x = self.scalingContext.x();
            var y = self.scalingContext.y();

            self.peaksHolder.attr('x', function (pk) {
                // if(pk[4]=='B' && p[3]){
                // return x(pk[5]-1)
                // }
                return x(pk.binIndex)
            }).attr('width', function (pk) {
                return x(1)
            }).attr('height', y(1)).attr('y', function (pk) {
                return y(pk.sample)
            }).attr('class', function (pk) {
                var irk = pk.intensityRank;
                var cl = 'spectra-pair-icon-bin rk-' + ((irk < 40) ? Math.floor(irk / 10) : 'x');
                if (pk.matched)
                    cl += " matched"
                else
                    cl += " unmatched"
                return cl;
            });
        }
    });

    return SpectraPairAlignmentIcon;

})