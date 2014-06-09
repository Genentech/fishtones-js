/**
 * multiple XIC views in one box. XIC is unique by its mass field
 * the scaling context is either passed (if multiple element are sharing the sameone) or built. ranges will be adapted each time a XIC is added
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define(['underscore', 'Backbone', 'd3', '../commons/CommonWidgetView', './XICView'], function (_, Backbone, d3, CommonWidgetView, XICView) {

    MultiXICView = CommonWidgetView.extend({

        initialize: function (options) {
            var self = this;
            MultiXICView.__super__.initialize.call(this, arguments);
            self.options = options;
            self.setupScalingContext(options);

            self.xicViews = {};
            self.model.bind('add', function (xic) {
                self.add(xic, options)
            })
            self.build(options);

            self.listenTo(self.model, 'add', self.render);
            self.listenTo(self.model, 'reset', self.render);

        },
        build: function (options) {
            var self = this;
            if (options && options.yaxis) {
                self.elYAxis = self.el.append('g').attr('class', 'xic yaxis')
            }

            self.title = options.title;
            self.elTitle = self.el.append('text').attr('x', self.scalingContext.width() - 20).attr('y', 30).attr('class', 'xic title');
        },
        // events : {
        // 'change model' : 'add'
        // },
        add: function (xic, options) {
            var self = this;
            var m = xic.get('mass');

            var xmax = Math.max(self.scalingContext.xMax(), _.max(xic.get('retentionTimes')));
            if (!(options && options.noAutoX)) {
                self.scalingContext.setXMax(xmax, true);
            } else {
                self.scalingContext.setXMax(xmax);
            }
            var ymax = Math.max(self.scalingContext.yMax(), _.max(xic.get('intensities')) * 1.1);
            self.scalingContext.setYMax(ymax);

            var xv = new XICView({
                el: self.el.append('g'),
                model: xic,
                scalingContext: self.scalingContext,
                richSequence: xic.get('richSequence'),
                noAutoX: (options && options.noAutoX)
            });
            //            console.log(self.cid, 'XIC ', xic.get('id'), xic.cid, xv.cid)

            self.xicViews[m] = xv;

            //self.xZoomable();

        },

        updateYAxis: function () {
            var self = this;
            var yAxis = d3.svg.axis().scale(self.scalingContext.y()).ticks(4).tickSize(5);
            self.elYAxis.selectAll('g').remove();
            yAxis.orient('right');
            yAxis.tickFormat(d3.format("e"));
            self.elYAxis.call(yAxis);

        },
        render: function (options) {
            var self = this;
            self.elTitle.text(self.title);
            if (self.options.yaxis) {
                self.updateYAxis();
            }
            _.each(_.values(self.xicViews), function (xv) {
                xv.render();
            });
        }
    });

    return MultiXICView;
});
