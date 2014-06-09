/**
 * the width height & x/r range all the chromato & spectra will share
 *
 * following d3, there is
 * * a domain: range of "real " values
 * * a range: viewport cooredinates
 * * origDomain (domain at large, before zoom)
 *
 * 'scalechange' evnt is triggered when boundaries are changed
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define(['d3', 'underscore', 'Backbone'], function(d3, _, Backbone) {
  var D3ScalingContext = Backbone.Model.extend({
    initialize : function(options) {

      this._xOrigDomain = (options && options.xDomain && options.xDomain.slice()) || [0, 1];
      this._yOrigDomain = (options && options.yDomain && options.yDomain.slice()) || [0, 1];
      this._xDomain = this._xOrigDomain.slice();
      this._yDomain = this._yOrigDomain.slice();

      this._xRange = [0, (options && options.width) || 332];
      this._yRange = [(options && options.height) || 664, 0];

      this.changeXDomainCallBacks = {};
      return this
    },
    width : function(v) {
      if (v !== undefined) {
        var changed = this._xRange[1] != v;
        this._xRange[1] = v;
        if (changed) {
          this.trigger('scalechange', 'reset');
        }
        return this;
      }
      return this._xRange[1];
    },
    height : function(v) {
      if (v !== undefined) {
        var changed = this._yRange[0] != v;
        this._yRange[0] = v;
        if (changed) {
          this.trigger('scalechange', 'reset');
        }
        return this;
      }
      return this._yRange[0];
    },
    x : function() {
      return d3.scale.linear().domain(this._xDomain).range(this._xRange);
    },
    y : function() {
      return d3.scale.linear().domain(this._yDomain).range(this._yRange)
    },
    reset : function() {
      var self = this;
      var changed = self._xDomain[0] != self._xOrigDomain[0] || self._xDomain[1] != self._xOrigDomain[1] || self._yDomain[0] != self._yOrigDomain[0] || self._yDomain[1] != self._yOrigDomain[1];

      self._xDomain[0] = self._xOrigDomain[0];
      self._xDomain[1] = self._xOrigDomain[1];
      self._yDomain[0] = self._yOrigDomain[0];
      self._yDomain[1] = self._yOrigDomain[1];
      if (changed) {
        self.trigger('scalechange', 'reset');
      }
      //self.fireChangeXRange();
    },
    resetX : function() {
      var self = this;
      var changed = self._xDomain[0] != self._xOrigDomain[0] || self._xDomain[1] != self._xOrigDomain[1];

      self._xDomain[0] = self._xOrigDomain[0];
      self._xDomain[1] = self._xOrigDomain[1];
      if (changed) {
        self.trigger('scalechange', 'resetX');
      }
      return self;

      //self.fireChangeXRange();
    },
    resetY : function() {
      var self = this;

      self._yDomain[0] = self._yOrigDomain[0];
      self._yDomain[1] = self._yOrigDomain[1];
      //self.fireChangeXRange();
      return self;
    },
    xMin : function(v) {
      if (v !== undefined) {
        this._xOrigDomain[0] = v;
        return this;
      }
      return this._xOrigDomain[0]
    },
    xMax : function(v) {
      if (v !== undefined) {
        this._xOrigDomain[1] = v;
        return this;
      }
      return this._xOrigDomain[1]
    },
    yMin : function(v) {
      if (v !== undefined) {
        this._yOrigDomain[0] = v;
        return this;
      }
      return this._yOrigDomain[0]
    },
    yMax : function(v) {
      if (v !== undefined) {
        this._yOrigDomain[1] = v;
        return this;
      }
      return this._yOrigDomain[1]
    },

    xOrigDomain : function(vs) {
      if (vs !== undefined) {
        this._xOrigDomain = vs.slice();
        return this;
      }
      return this._xOrigDomain.slice()
    },
    yOrigDomain : function(vs) {
      if (vs !== undefined) {
        this._yOrigDomain = vs.slice();
        return this;
      }
      return this._yOrigDomain.slice()
    },
    xDomain : function(x0, x1, opts) {
      var self = this;

      var options = _.extend({
        silent : false
      }, opts)

      if (x0 === undefined)
        return self._xDomain.slice();

      if (_.isArray(x0)) {
        x1 = x0[1];
        x0 = x0[0];
      }
      var changed = x0 != self._xDomain[0] || x1 != self._xDomain[1];
      self._xDomain[0] = x0;
      self._xDomain[1] = x1;

      if (changed && !options.silent) {
        self.trigger('scalechange', 'xDomain');
      }

      return self
      //this.fireChangeXRange();
    },
    yDomain : function(y0, y1, opts) {
      var self = this;
      var options = _.extend({
        silent : false
      }, opts)

      if (y0 === undefined)
        return this._yDomain.slice();

      if (_.isArray(y0)) {
        y1 = y0[1];
        y0 = y0[0];
      }
      var changed = y0 != self._yDomain[0] || y1 != self._yDomain[1];

      self._yDomain[0] = y0;
      self._yDomain[1] = y1;
      if (changed && !options.silent) {
        self.trigger('scalechange', 'yDomain');
      }
      self.fireChangeXDomain();
      return self;
    },
    isXZoomed : function() {
      var self = this;
      return self._xDomain[0] > self._xOrigDomain[0] || self._xDomain[1] < self._xOrigDomain[1];
    },
    /*
     * set the mximum x value, the overall max and the current one.
     * if limitOnly, then we just modify the overall limit
     */
    setXMax : function(m, limitOnly) {
      this._xOrigDomain[1] = m
      if (limitOnly) {
        this._xDomain[1] = m
      }
      return this;
    },
    setYMax : function(m) {
      this._yDomain[1] = this._yOrigDomain[1] = m

    },
    addChangeXDomainCallBack : function(name, fct) {
      var self = this;
      self.changeXDomainCallBacks[name] = fct;
    },
    removeChangeXDomainCallBack : function(name) {
      var self = this;
      delete self.changeXDomainCallBacks[name];
    },
    fireChangeXDomain : function() {
      var self = this;
      _.each(self.changeXDomainCallBacks, function(fct, name) {
        fct(self);
      });
    }
  });

  return D3ScalingContext;

});
