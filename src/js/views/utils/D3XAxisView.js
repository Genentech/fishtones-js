/**
 * display a D3ScalingContext, on the xaxis view
 *
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define(['underscore', 'Backbone', 'd3', '../commons/CommonWidgetView'],
    function (_, Backbone, d3, CommonWidgetView) {
        D3XAxisView = CommonWidgetView.extend({
            initialize: function (options) {
                var self = this;
                XICView.__super__.initialize.call(this, arguments);
                self.setupScalingContext(options);
                self.transform = options.transform;
            },

            render: function () {
                var self = this;
                var xScale;
                if (self.transform) {
                    var xDom = self.scalingContext.x().domain()
                    xScale = d3.scale.linear().domain([self.transform(xDom[0]), self.transform(xDom[1])]).range([0, self.scalingContext.width()])
                } else {
                    xScale = self.scalingContext.x();
                }
                xAxis = d3.svg.axis().scale(xScale).ticks(7).tickSubdivide(4).tickSize(6, 5, 0);
                self.el.call(xAxis);
                var elsTicks = self.el.selectAll('g g g')[0]
                _.each(elsTicks, function (elt) {
                    var pos = parseFloat(d3.select(elt).attr('transform').replace('translate(', '').replace(',0)', ''));
                    d3.select(elt).style('display', (pos < 35) ? 'none' : null)
                });
            }
        })
        return D3XAxisView
    });
