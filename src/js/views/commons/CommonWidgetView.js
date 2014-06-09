/**
 * An abstract class for D3Widget oriented views
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define(['underscore', 'Backbone', 'd3', '../utils/D3ScalingContext', '../utils/D3ScalingArea'], function(_, Backbone, d3, D3ScalingContext, D3ScalingArea) {
  var KEYPRESSED_NONE = 0;
  var KEYPRESSED_SHIFT = 1;
  var KEYPRESSED_ALT = 2;
  var DOUBLE_CLICK = 4;

  CommonWidgetView = Backbone.View.extend({
    initialize : function(options) {
      var self = this;

      var elTmp = _.isArray(self.el) ? self.el[0] : self.el
      if ($(elTmp).prop("tagName").toLowerCase() === 'div') {
        self.el = d3.select(elTmp).append('svg').attr('height', '100%').attr('width', '100%');
      } else {
        self.el = d3.select(elTmp);
      }

      if (self.scalingContext) {
        self.xZoomable()
      }
      self.brushCallbacks = {};

      if ($(elTmp).prop('tagName').toLowerCase() === 'svg') {
        self._height = options.height || $(elTmp).parent().height() || 300;
        self._width = options.width || $(elTmp).parent().width() || 200;
      } else {
        self._height = options.height || $(elTmp).height() || 300;
        self._width = options.width || $(elTmp).width() || 200;
      }

    },
    height : function(v) {
      if (v !== undefined) {
        this._height = v;
        return this;
      }
      return this._height;
    },
    width : function(v) {
      if (v !== undefined) {
        this._width = v;
        return this;
      }
      return this._width;
    },
    /**
     * get the scalingContext from the options (contructor oriented) or define a new one
     * @param {Object} options
     */
    setupScalingContext : function(options) {
      var self = this;
      options = options || {};

      if (options.scalingContext != undefined) {
        self.scalingContext = options.scalingContext;
      } else {
        if (self.scalingContext === undefined) {
          self.scalingContext = new D3ScalingContext({
            height : self._height,
            width : self._width
          });
        }

        if (options.xDomain) {
          self.scalingContext.xOrigDomain(options.xDomain);
          self.scalingContext.xDomain(options.xDomain);
        }
        if (options.yDomain) {
          self.scalingContext.yOrigDomain(options.yDomain);
          self.scalingContext.yDomain(options.yDomain);
        }
        if (options.height) {
          self.scalingContext.height(options.height);
        }
        if (options.width) {
          self.scalingContext.width(options.width);
        }

      }
      self.listenTo(self.scalingContext, 'scalechange', function(evt) {
        self.render({
          cause : {
            name : evt,
            id : Math.random()
          }
        });
      })
    },
    /**
     * add a D3ScalingAre, i.e. a x-zoomable area
     */
    xZoomable : function() {
      var self = this;

      var adaptYDomain = function(xs) {
        if (!self.getMaxYInXDomain)
          return
        var ymax = self.getMaxYInXDomain(xs[0], xs[1]);
        self.scalingContext.yDomain(0, ymax, {
          silent : true
        });

      }

      self.setupInteractive();
      self.setBrushCallback(KEYPRESSED_NONE, function(xs) {
        adaptYDomain(xs)
        self.scalingContext.xDomain(xs)
      })
      self.setBrushCallback(DOUBLE_CLICK, function(xs) {
        self.scalingContext.reset()
      })
    },

    setShiftSelectCallback : function(f) {
      this.setBrushCallback(KEYPRESSED_SHIFT, f);
    },

    setupInteractive : function() {
      var self = this;
      if (self.brush !== undefined)
        return;

      self.el.selectAll('.zoom-area').remove()
      if (self.scalingArea !== undefined) {
        self.scalingArea.updateScalingContext(self.scalingContext);
      } else {
        self.scalingArea = new D3ScalingArea({
          el : self.vis || self.el,
          model : self.scalingContext,
          callback : function() {
          }
        });
      }

      var gBrush = (self.vis || self.el).insert('g', ':first-child').attr('class', 'x-selector');
      gBrush.append('rect').attr('height', '100%').attr('width', '100%').attr('class', 'background');
      var leftHider = gBrush.append('rect').attr('class', 'hider left').attr('height', '100%').attr('width', 0).style('display', 'none');
      var rightHider = gBrush.append('rect').attr('class', 'hider right').attr('height', '100%').attr('width', '100%').style('display', 'none');

      var tStamp = 0;
      var isDblClick = function() {
        var d = new Date();
        var t1 = d.getMilliseconds() + 1000 * (d.getSeconds() + 60 * d.getMinutes())
        var b = (t1 - tStamp) < 450
        tStamp = t1;
        return b;
      }
      var brush = d3.svg.brush().on("brushstart", function() {
        brush.x(self.scalingContext.x());
        leftHider.style('display', null)
        rightHider.style('display', null)

      }).on("brush", function() {
        var bounds = brush.extent()
        var x = self.scalingContext.x()
        leftHider.attr('width', x(bounds[0]))
        rightHider.attr('x', x(bounds[1]))

      }).on("brushend", function() {
        var kp = getKeyPressed();
        var bounds = brush.extent()
        if (isDblClick()) {
          self.brushCallbacks[DOUBLE_CLICK]()
        } else if ((bounds[1] - bounds[0]) >= 0.001 * self.scalingContext.xMax()) {
          if (self.brushCallbacks[kp] !== undefined) {
            self.brushCallbacks[kp](bounds)
          }
        }
        leftHider.style('display', 'none')
        rightHider.style('display', 'none')
      });

      brush.x(self.scalingContext.x());
      brush(gBrush);

    },
    setBrushCallback : function(keyMask, f) {
      this.brushCallbacks[keyMask] = f
    }
  });

  var getKeyPressed = function() {
    var i = 0;
    if (d3.event.sourceEvent.shiftKey)
      i |= KEYPRESSED_SHIFT;

    if (d3.event.sourceEvent.altKey)
      i |= KEYPRESSED_ALT;
    return i
  }
  return CommonWidgetView;
});

