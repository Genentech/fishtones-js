/*
 * svg container for the common scalingf area.
 *
 * d3-Scaling-context (contains the viewport and domains boundaries
 * a call back to be called when zoomed
 * * model: scalingContext,
 * * el: container,
 * * callback: call back when zoomed has been called (for  sttudff not triggere by scalechange events)
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define(['underscore', 'd3', 'Backbone', './D3ScalingAreaButtons'], function (_, d3, Backbone, D3ScalingAreaButtons) {
    var D3ScalingArea = Backbone.View.extend({
        initialize: function (options) {//container, context, callback, options) {

            options = $.extend({}, options);
            var self = this;
            self.callback = options.callback;

            self.height = options.height || self.model.height() || 30;

            var el = _.isArray(self.el) ? self.el[0] : self.el;
            self.container = d3.select(el).append('g');
            self.container.attr('width', options.width || self.model.width());
            self.container.attr('height', self.height);

            self.p_setup()

        },
        updateScalingContext: function (ctx) {
            var self = this;
            self.model = ctx;

        },
        p_setup: function () {
            var self = this;

            var g = self.container.insert("g", ":first-child")
            //var rect = g.insert("rect", ":first-child").attr('x', 0).attr('y', 0).attr('width', '100%').attr('height', '100%').attr('fill-opacity', '0%').attr('class', 'zoom-area');

            self.p_setup_buttons();

            // self.zoom = d3.behavior.zoom().x(self.context.xScale).scaleExtent([1, 180]).on("zoom", function() {
            // self.callback();
            // self.context.fireChangeXRange();
            // });
            //   self.container.call(self.zoom);
        },
        p_setup_buttons: function () {
            var self = this;

            var scalingContext = self.model;
            self.buttons = {};
            var g = self.container.insert("g").attr('class', 'scaling-area-menu');

            var iButton = 0;
            var fctAddButton = function (name, text, fIsShowing, fAction) {
                var gbut = g.insert("g").attr('class', 'scaling-area-menu-one-button').attr('transform', 'translate(20,' + (10 + iButton * 27) + ')');
                var rect = gbut.insert("rect").attr('class', 'button').attr('x', 0).attr('y', 0).attr('width', 80).attr('rx', 5).attr('ry', 5).attr('height', 22);
                gbut.append('text').attr("x", 40).attr("y", 11).text(text);
                self.buttons[name] = {
                    el: gbut,
                    isShowing: fIsShowing,
                    action: fAction
                };
                var gOver = gbut.insert("rect").attr('class', 'over-button').attr('x', 0).attr('y', 0).attr('width', 80).attr('rx', 5).attr('ry', 5).attr('height', 22);
                gbut.on('click', fAction);

                gbut.style('display', fIsShowing() ? null : 'none');
                iButton++;
            }
            fctAddButton('zoomOut', 'zoom out', function () {
                return self.model.isXZoomed();
            }, function () {
                self.model.reset();
            })

            self.listenTo(scalingContext, 'scalechange', function () {
                _.each(self.buttons, function (butConf, name) {
                    butConf.el.style('display', butConf.isShowing() ? null : 'none');
                })
            });

        },
        hideAllButtons: function () {
            var self = this;
            _.each(self.buttons, function (butConf, name) {
                butConf.el.style('display', 'none');
            })
        }
    });
    return D3ScalingArea;

});
