/*
 * xy line charting
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define(['jquery', 'underscore', 'd3', './BChart'], function ($, _, d3, BChart) {
    var BChartLines = function () {
        var self = this;

        self._padding = {
            top: 30,
            left: 70,
            bottom: 25,
            right: 10
        }

        self.p_setup_scales = p_setup_scales;
        self.p_create_main_svg = p_create_main_svg;
        self.p_render_axes = p_render_axes;
        self.p_render_lines = p_render_lines;
    };

    BChartLines.prototype.data = function (args) {
        if (args !== undefined) {
            this._data = args;
            return this;
        }
        return this._data;
    }

    BChartLines.prototype.options = function (opts) {
        var self = this;
        self._options = opts;

        return self;
    }
    /**
     * set chart padding as a map containings top, bottom, left and/or right
     */
    BChartLines.prototype.padding = function (opts) {
        var self = this;
        if (opts !== undefined) {
            _.each(opts, function (v, k) {
                self._padding[k] = v
            })
            return self;
        }
        return this._padding;
    }
    /**
     * return a D3  scale
     */
    BChartLines.prototype.scales = function () {
        return this._scales;
    }
    var p_setup_scales = function () {
        var self = this;

        var xDomain = self.data().domain('x')
        var yDomain = self.data().domain('y')

        self._scales = {
            x: d3.scale.linear().domain([xDomain.inf, xDomain.sup]).range([0, self._target.width() - self._padding.left - self._padding.right]),
            y: d3.scale.linear().domain([yDomain.inf, yDomain.sup]).range([self._target.height() - self._padding.top - self._padding.bottom, 0])
        }
        return self;
    }

    /**
     * Rendering area...
     */

    BChartLines.prototype.render = function (target) {
        var self = this;
        self._target = $(target);

        self.p_create_main_svg();
        self.p_setup_scales();
        self.p_render_axes();

        self.p_render_lines();

        return self;
    }

    var p_create_main_svg = function () {
        var self = this;
        self._els = {
            main: d3.select(self._target[0]).append("svg").attr("width", '100%').attr("height", '100%').attr('class', 'bchart'),
        }
        self._els.plotting = self._els.main.append("g").attr("transform", "translate(" + self._padding.left + "," + self._padding.top + ")");
        return self;
    }

    var p_render_axes = function () {
        var self = this;

        self._els.xaxis = self._els.main.append("g").attr("transform", "translate(" + self._padding.left + "," + (self._target.height() - self._padding.bottom + 3 ) + ")").attr('class', 'x axis');

        var d3axis = d3.svg.axis()
        if (self.data().domain('x').sup >= 10000) {
            d3axis.tickFormat(d3.format("e"))
        }
        var lpx = Math.abs(self.scales().x.range()[0] - self.scales().x.range()[1])
        d3axis.scale(self.scales().x);
        d3axis.tickSize(4, 2, 5);
        d3axis.ticks(Math.round(lpx / 60));
        self._els.xaxis.call(d3axis.orient("bottom"));

        self._els.yaxis = self._els.main.append("g").attr("transform", "translate(" + (self._padding.left - 3) + "," + self._padding.top + ")").attr('class', 'y axis');
        d3axis = d3.svg.axis()
        if (self.data().domain('y').sup >= 10000) {
            d3axis.tickFormat(d3.format("e"))
        }
        self._els.yaxis.call(d3axis.scale(self.scales().y).ticks(4).orient("left"))
    }

    var p_render_lines = function () {
        var self = this;

        var pline = d3.svg.line().x(function (p) {
            return self.scales().x(p.x);
        }).y(function (p) {
            return self.scales().y(p.y)
        });

        _.each(self.data().data(), function (dset) {
            var g = self._els.plotting.append("g");
            var p = g.insert("path");
            p.attr("d", pline(dset.points));

            _.each(dset.nodeAttrs, function (val, name) {
                p.attr(name, val);
            });
            p.classed('line', true)
        });
    }

    return BChartLines;
});

