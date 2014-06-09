/*
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define(['underscore', 'd3', '../commons/CommonWidgetView', 'fishtones/views/utils/D3ScalingContext', 'fishtones/views/utils/D3ScalingArea'], function (_, d3, CommonWidgetView, D3ScalingContext, D3ScalingArea) {
    /*
     * projected peaks contains 3 values:
     *
     * 0: moz
     * 1:intensity
     * 2: intensity ranks
     */
    var projectPeaks = function (expSp) {
        return _.chain(expSp.get('mozs')).zip(expSp.get('intensities'), expSp.get('intensityRanks')).value()

    }
    var peakRankClass = function (pk) {
        var irk = pk[2];
        return 'rk-' + ((irk < 40) ? Math.floor(irk / 10) : 'x');
    }
    var SpectrumView = CommonWidgetView.extend({
        defaults: {
        },
        initialize: function (options) {
            options = $.extend({}, options);
            SpectrumView.__super__.initialize.call(this, options)
            var self = this;
            self.colorPeaks = options.colorPeaks;

            self.hScale=20;
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
            self.peaks = projectPeaks(self.model);

            return self;
        },
        buildContext: function () {
            var self = this;

            var xMax = self.model.get('mozs')[self.model.size() - 1] * 1.1;
            var xMin = self.model.get('mozs')[0] * 0.5;
            var yMax = Math.max(_.max(self.model.get('intensities'))) * 1.05;

            self.setupScalingContext({
                xDomain: [xMin, xMax],
                yDomain: [0, yMax],
                height: self.height()-self.hScale,
                width: self.width()
            })

            return self;
        },
        buildD3: function () {
            var self = this;

            self.vis = self.el.append('g');
            self.vis.attr('width', self.width()).attr('height', self.height()).attr('class', 'spectrum');

            var ys = self.scalingContext.y();

            self.peaksHolder = self.vis.selectAll('line.peak').data(self.peaks).enter().append('line').attr('class', function (pk) {
                var cl = 'peak  peak-x';
                if (self.colorPeaks) {
                    cl += ' ' + peakRankClass(pk);
                }
                return cl;
            }).attr('y1', function (pk) {
                return ys(0);
            }).attr('y2', function (pk) {
                return ys(pk[1]);
            });


            var gtitles = self.vis.append('g').attr('class', 'titles')
            gtitles.append('text').text('#' + self.model.get('scanNumber')).attr('x', self.width() - 5).attr('y', 30).attr('class', 'scan top')

            self.axisContainer = self.vis.append('g').attr('class', 'axis').attr('transform', 'translate(0,'+ys(0)+')');

            return self;
        },
        render: function () {
            var self = this;
            var x = self.scalingContext.x();

            self.vis.selectAll('line.peak-x').attr('x1', function (pk) {
                return x(pk[0])
            }).attr('x2', function (pk) {
                return x(pk[0])
            });
            var xAxis = d3.svg.axis().scale(x).tickSize(4, 3, 3).ticks(3)//"".tickFormat(d3.format("d"));
            self.axisContainer.call(xAxis);
        }
    });

    return SpectrumView;

})
