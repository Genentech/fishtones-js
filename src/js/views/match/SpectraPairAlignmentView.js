/*
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define(['underscore', 'd3', '../commons/CommonWidgetView', 'fishtones/views/utils/D3ScalingContext', 'fishtones/views/utils/D3ScalingArea'], function(_, d3, CommonWidgetView, D3ScalingContext, D3ScalingArea) {
  /*
   * projected peaks contains 4 values:
   *
   * 0: moz
   * 1:intensity
   * 2: intensity ranks
   * 3: isMathcing ( constructed at the buildData step)
   */
  var projectSpectrum = function(expSp) {
    return {
      precursor : {
        scanNumber : expSp.get('scanNumber'),
        id : expSp.get('id')
      },
      peaks : _.chain(expSp.get('mozs')).zip(expSp.get('intensities'), expSp.get('intensityRanks')).value()
    }
  }
  var peakRankClass = function(pk) {
    var irk = pk[2];
    return 'rk-' + ((irk < 40) ? Math.floor(irk / 10) : 'x');
  }
  var SpectraPairAlignmentView = CommonWidgetView.extend({
    defaults : {
    },
    initialize : function(options) {
      options = $.extend({}, options);
      SpectraPairAlignmentView.__super__.initialize.call(this, options)
      var self = this;
      self.isEnhanced = options.enhanced;
      self.maxRankMatchingPeaks = options.maxPeaks || 1000;
      self.independentYScales = options.independentYScales;
      self.colorPeaks = options.colorPeaks;

      self.fragTol = options.fragTol || 20;
      self.heightMiddleZone = (self.isEnhanced) ? (self.height() * 0.1) : 0

      self.build();
      self.model.on('change', function() {
        self.build().render();
      })
    },

    build : function() {
      return this.buildData().buildContext().buildD3();
    },
    buildData : function() {
      var self = this;
      self.spA = projectSpectrum(self.model.get('spectrumA'));
      self.spB = projectSpectrum(self.model.get('spectrumB'));

      if (self.isEnhanced) {
        _.each(self.model.closerThanPPM(self.fragTol), function(p) {
          self.spA.peaks[p.pkA.index][3] = true;
          self.spB.peaks[p.pkB.index][3] = true;
        })
      }

      self.allPeaks = self.spA.peaks.map(function(p) {
        p[4] = 0
        return p;
      }).concat(self.spB.peaks.map(function(p) {
        p[4] = 1
        return p;
      }))

      return self;
    },
    buildContext : function() {
      var self = this;

      var xMax = Math.max(self.spA.peaks[self.spA.peaks.length-1][0], self.spB.peaks[self.spB.peaks.length-1][0]) * 1.1;
      var xMin = Math.max(self.spA.peaks[0][0], self.spB.peaks[0][0]) * 0.5;
      var yMax = Math.max(_.max(self.model.get('spectrumA').get('intensities')), _.max(self.model.get('spectrumB').get('intensities'))) * 1.05;

      self.setupScalingContext({
        xDomain : [xMin, xMax],
        yDomain : [0, yMax],
        height : (self.height() - self.heightMiddleZone) / 2,
        width : self.width()
      })

      return self;
    },
    buildD3 : function() {
      var self = this;

      self.vis = self.el.append('svg');
      self.vis.attr('width', self.width()).attr('height', self.height()).attr('class', 'spectra-pair-alignment');
      self.vis.append('line').attr('y1', self.height() / 2).attr('y2', self.height() / 2).attr('x1', 0).attr('x2', self.width()).attr('class', 'axis')

      var ys = [self.scalingContext.y(), self.scalingContext.y()]

      ys[1].range([(self.height() + self.heightMiddleZone) / 2, self.height()]);
      if (self.independentYScales) {
        ys[0].domain([0, _.max(self.model.get('spectrumA').get('intensities')) * 1.05])
        ys[1].domain([0, _.max(self.model.get('spectrumB').get('intensities')) * 1.05])
      }

      var j0up = (self.height() - self.heightMiddleZone) / 2;
      var j0down = (self.height() + self.heightMiddleZone) / 2;

      self.peaksHolder = self.vis.selectAll('line.peak').data(self.allPeaks).enter().append('line').attr('class', function(pk) {
        var cl = 'peak  peak-x';
        if (self.colorPeaks) {
          cl += ' ' + peakRankClass(pk);
        }
        if (self.isEnhanced) {
          cl += pk[3] ? " matched" : " unmatched";
        }
        return cl;
      }).attr('y1', function(pk) {
        return ys[pk[4]](0);
        //(pk[1] > 0) ? j0up : j0down;
      }).attr('y2', function(pk) {
        return ys[pk[4]](pk[1])//(pk[1] > 0) ? (j0up - y(pk[1])) : (j0down + y(-pk[1]));
      });

      if (self.isEnhanced) {
        self.vis.selectAll('line.peak-match').data(_.filter(self.spA.peaks.concat(self.spB.peaks), function(pk) {
          return pk[3] && (pk[2] < self.maxRankMatchingPeaks );
        })).enter().append('line').attr('class', function(pk) {
          var cl = 'peak peak-match peak-x';
          cl += ' ' + peakRankClass(pk);
          return cl
        }).attr('y1', self.height() / 2).attr('y2', function(pk) {
          return (pk[4] == 0) ? j0up : j0down;
        })
      }

      var gtitles = self.vis.append('g').attr('class', 'titles')
      gtitles.append('text').text('#' + self.spA.precursor.scanNumber).attr('x', self.width() - 5).attr('y', 30).attr('class', 'scan top')
      gtitles.append('text').text('#' + self.spB.precursor.scanNumber).attr('x', self.width() - 5).attr('y', self.height() - 30).attr('class', 'scan bottom')

      self.axisContainer = self.vis.append('g').attr('class', 'axis');

      return self;
    },
    render : function() {
      var self = this;
      var x = self.scalingContext.x();

      self.vis.selectAll('line.peak-x').attr('x1', function(pk) {
        return x(pk[0])
      }).attr('x2', function(pk) {
        return x(pk[0])
      });
      var xAxis = d3.svg.axis().scale(x).tickSize(6, 0, 0).ticks(3)//"".tickFormat(d3.format("d"));
      self.axisContainer.call(xAxis);
    }
  });

  return SpectraPairAlignmentView;

})
