/**
 * The PQ widget (PQ = "toilet paper" in french) is disk projected data, which can be pulled of when mousing over
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define(['underscore', 'd3'], function(_, d3) {

  PQView = function(target, options) {
    options = $.extend({}, options);
    this.radius = options.radius || 50;
    this.time = options.time || 125;
    this.rotating = 0;
    this.onclick = options.onclick;

    if ( typeof target == 'object') {
      this.vis = target.append('g')

    } else {
      this.vis = d3.select(target).append('g')
    }
  }

  PQView.prototype.build = function(sectorClasses, rectBuildFunction) {
    var self = this;
    self.len = sectorClasses.length;
    self.sectorClasses = sectorClasses;

    self.svgRect = self.vis.append('g').attr('transform', 'translate('+ self.radius+',0)');
    self.rect = self.svgRect.append('g').attr('class', 'rect-container');
    self.dimRect = rectBuildFunction(self.rect);
    self.svgRect.attr('width', self.dimRect.width)

    self.rect.attr('transform', 'scale(0,1)');
    self.svgRect.attr('x', self.radius);
    self.vis.attr('height', 2 * self.radius).attr('width', self.radius + self.dimRect.width);

  }

  PQView.prototype.draw = function(options) {
    var self = this;
    var circle = self.vis.append('g').attr('transform', 'translate(' + self.radius + ',' + self.radius + ')').append('g');

    var arc = d3.svg.arc().outerRadius(self.radius).innerRadius(0).startAngle(function(v, i) {
      return 2 * 3.14 * i / self.len;
    }).endAngle(function(v, i) {
      return 2 * 3.14 * (i + 1) / self.len;
    });
    var pcirc = circle.selectAll('g.circle').data(self.sectorClasses).enter().append('g').attr('class', 'circle');
    pcirc.append('path').attr('d', arc).attr('class', function(d, i) {
      return d + ' sector sector-' + i
    }).attr('fill', function(d) {
      return d3.rgb(255 / 10 * d, 255 / 10 * d, 255 / 10 * d)
    });
    var mskCircle = circle.append('circle').attr('r', self.radius).attr('fill-opacity', '0').attr('fill', 'yellow').style('cursor', 'hand');

    mskCircle.on('mouseover', function() {
      self.rollOut(circle);
    });
    mskCircle.on('mouseout', function() {
      self.rollBack(circle);
    });
    if (self.onclick) {
      mskCircle.on('click', self.onclick);
    }
  }

  PQView.prototype.move = function(x, y) {
    var self = this;
    this.vis.attr('transform', 'translate(' + (x - self.radius) + ',' + (y - self.radius) + ')').style('left', x + 'px').style('left', y + 'px').style('position', 'relative');
    return this
  }

  PQView.prototype.rollOut = function(circle, options) {
    var self = this;
    if (self.rotating > 0) {
      return;
    }
    self.rotating = 1;
    var cpt = 0;
    var dt = self.time / self.len;
    var wRect = self.dimRect.width;
    for ( i = 0; i < self.len; i++) {
      setTimeout(function() {
        if (self.rotating <= 0) {
          return;
        }
        circle.attr('transform', 'rotate(' + ((cpt + 1) / self.len * 360) + ')');
        cpt++;
        self.rect.attr('transform', 'scale(' + ((i + 1) / self.len) + ',1)');
        //);'translate(' + ((cpt - self.len) * wRect / self.len) + ',0)');

        circle.selectAll('.sector-' + (self.len - cpt)).attr('display', 'none');
        if (cpt == self.len) {
          self.rotating = 0;
        }
      }, i * dt);
    }
  }
  PQView.prototype.rollBack = function(circle, options) {

    var self = this;
    if (self.rotating < 0) {
      return;
    }
    self.rotating = -1;
    var cpt = self.len - 1;
    var dt = self.time / self.len;
    var wRect = self.dimRect.width;
    for ( i = 0; i < self.len; i++) {
      setTimeout(function() {
        if (self.rotating >= 0) {
          return
        }
        circle.attr('transform', 'rotate(' + (cpt / self.len * 360) + ')');
        //        var tr = 'translate(' + ((cpt - self.len) * wRect / self.len) + ',0)';
        var tr = 'scale(' + (1 - i / self.len) + ',1)';
        self.rect.attr('transform', tr);

        var sel = '.sector-' + (self.len - cpt - 1);
        circle.selectAll(sel).attr('display', null)
        cpt--;
        if (cpt < 0) {
          self.rotating = 0;
        }
      }, i * dt);
    }

  }

  return PQView;
});
