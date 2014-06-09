/*
 * witdget to display PSM, based on the spectrum perspective
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define(['underscore', 'd3', '../commons/CommonWidgetView', 'fishtones/views/utils/D3ScalingContext', 'fishtones/views/utils/D3ScalingArea'], function (_, d3, CommonWidgetView, D3ScalingContext, D3ScalingArea) {

    MatchSpectrumView = CommonWidgetView.extend({
        defaults: {
        },
        initialize: function (options) {
            MatchSpectrumView.__super__.initialize.call(this, options)
            var self = this;

            options = $.extend({}, options);
            self.options = options;

            self.tol = options.tol || 500;

            self.heightXAxis = 21;
            self.peaksBaselineHeight = 10;

            if (options.flying) {
                self.el = d3.select('body');
                self.isFlying = true;
            } else {
                self.isFlying = false;
            }
            self.p_setup();

            if (self.options.xZoomable) {
                self.xZoomable();
            }

        },
        p_setup: function () {
            var self = this;
            // var evt = d3.mouse(self.container);
            self.vis = self.el.append('svg')
            self.vis.attr('width', self.width()).attr('height', self.height()).attr('class', 'd3-widget-match-spectrum');
            if (self.isFlying) {
                var x = d3.event.pageX + 10;
                var y = d3.event.pageY - self.height() * 2 / 3;
                self.vis.style('left', x + 'px').style('top', y + 'px');
                self.p_flying_dont_fly_away();

            }
            // self.vis.append('rect').attr('width', '100%').attr('height', '100%').attr('fill', '#ddd').attr('class', 'background');

            self.p_setup_title();

            if (self.isFlying) {
                self.buttonContainer = self.vis.append('g').attr('class', 'button-container right-align').attr('transform', 'translate(' + self.width() + ',0)')
                self.p_setup_menu_buttons();
            }

            // add spectrum
            var expSp = self.model.get('expSpectrum');
            var hSpectrum = self.height() - 20 - self.heightXAxis;

            self.p_build_data();
            self.setupScalingContext({
                xDomain: [expSp.get('mozs')[0] * 0.95, expSp.get('mozs')[expSp.size() - 1] * 1.05],
                yDomain: [0, _.max(_.pluck(self.data.peaks, 'y')) * 1.2],
                height: hSpectrum - self.peaksBaselineHeight,
                width: self.width()
            })

            var svgsp = self.vis.append('g').attr('transform', 'translate(0,20)');
            self.svgsp = svgsp;

            self.scalingArea = new D3ScalingArea({
                el: svgsp,
                model: self.scalingContext,
                callback: function () {
                    self.render()
                },
                height: hSpectrum,
                width: self.width()
            });

            self.d3HolderXAxis = svgsp.append('g').attr('class', 'xaxis').attr('transform', 'translate(0,' + hSpectrum + ')');
            self.d3holderPrecursor = svgsp.selectAll('g.precursor').data(self.data.precursor).enter().append('g')
            self.d3holderPrecursor.append('path').attr('class', 'precursor').attr('d', 'M0,-20L10,0L-10,0L0,-20').attr('x', function (p) {
                return p.x;
            });
            self.d3holderPeaks = svgsp.selectAll('line.peak').data(self.data.peaks).enter().append('line').attr('class', function (pk) {
                var clazz = 'peak';
                if (pk.label !== undefined) {
                    clazz += ' matched frag-series-' + pk.label.label.series.replace('++', '')
                } else {
                    clazz += ' unmatched'
                }
                return clazz
            });
            self.d3holderPeaksTruncated = svgsp.selectAll('line.peak-truncated').data(self.data.peaksTruncated).enter().append('line');

            self.p_setup_labels();

        },
        /**
         * div with flying spectrum is poistion somwhere (by the ventsource, for example)
         * nervertheless, it should not go outside the main window
         */
        p_flying_dont_fly_away: function () {
            var self = this;

            var x = parseInt(self.vis.style('left'));
            var y = parseInt(self.vis.style('top'));
            var minDist = 20;

            x = Math.max(x, minDist);
            x = Math.min(x, window.innerWidth - self.width() - minDist);

            y = Math.max(y, minDist);
            y = Math.min(y, $(document).height() - self.height() - minDist)

            self.vis.style('left', x)
            self.vis.style('top', y)

        },
        p_setup_labels: function () {
            var self = this;

            self.svgsp.selectAll('g.label').remove();
            self.d3holderLabels = self.svgsp.selectAll('g.label').data(self.data.labels).enter().append('g');
            self.d3holderLabelsPath = self.d3holderLabels.append('path')
            self.d3holderLabelsTextG = self.d3holderLabels.append('g')
            self.d3holderLabelsText = self.d3holderLabelsTextG.append('text')
            return self
        },
        p_setup_title: function () {
            var self = this;
            // title
            var expSp = self.model.get('expSpectrum')
            var title = 'scan: ' + expSp.get('scanNumber') + ' (' + (Math.round(expSp.get('retentionTime')) / 60).toFixed(1) + 'min) ' + expSp.get('precCharge') + '+ ' + expSp.get('precMoz').toFixed(4) + 'Da';
            self.vis.append('text').attr('x', 5).attr('y', 5).attr('class', 'title').text(title);
            self.vis.append('rect').attr('height', '20').attr('width', '100%').attr('class', 'title').text(title);

        },
        p_new_button: function () {
            var self = this;
            var n = self.buttonContainer.selectAll('g.button-container')[0].length
            return self.buttonContainer.append('g').attr('class', 'button-container').attr('transform', 'translate(-' + (n + 1) * 42 + ',2)');
        },
        p_setup_menu_buttons: function () {
            var self = this;

            var addButton = function (gbut, text, options) {
                var elWrapper = gbut.append('g');
                //.attr('transform', 'scale(' + (options.size / 40) + ',' + (options.size / 40) + ')');
                gbut.classed('button', true);
                elWrapper.append('rect').attr('width', 40).attr('height', 16).attr('rx', 4).attr('ry', 4).classed('button', true);
                gbut.append('text').attr('x', 20).attr('y', 11).text(text);
                if (options && options.cursor) {
                    gbut.style('cursor', options.cursor);
                }
                return gbut;
            }
            // close
            var gbut = self.p_new_button();
            addButton(gbut, 'close').on('click', function () {
                self.close()
            });

            // resize
            gbut = self.p_new_button();

            addButton(gbut, 'larger').on('click', function () {
                if (self.height() < 300) {
                    self.resize({
                        height: 400,
                        width: Math.min($(document).width() * 0.9, 1000)
                    })
                } else {
                    self.resize({
                        height: 200,
                        width: 500
                    });
                }

            });

            // drag
            gbut = self.p_new_button();
            addButton(gbut, 'move', {
                cursor: 'move'
            });
            // setup draggin
            var dragCoord = {
                x: 1000,
                y: 1000
            };
            var drag = d3.behavior.drag().on("dragstart", function (d) {
                dragCoord = {
                    mx: d3.event.sourceEvent.pageX,
                    my: d3.event.sourceEvent.pageY,
                    vx: parseInt(self.vis.style('left').replace('px', '')),
                    vy: parseInt(self.vis.style('top').replace('px', '')),
                };
            }).on("drag", function (d) {
                mx = d3.event.sourceEvent.pageX;
                my = d3.event.sourceEvent.pageY;

                self.vis.style("left", (dragCoord.vx + mx - dragCoord.mx) + 'px').style("top", (dragCoord.vy + my - dragCoord.my) + 'px');
            });
            gbut.call(drag);

            //edit
            if (self.options.editUrl) {
                gbut = self.p_new_button();

                addButton(gbut, 'edit');
                gbut.on('click', function () {
                    window.open(self.options.editUrl, 'epi-show__ID_INTERACTIVE__XIC')
                });

                // //.append('text').attr('y', 14).text('?')
                // var b = d3Glyphicons.append(a, 'binoculars', {
                // size : 24,
                // button : true
                // });

            }

        },
        /*
         * build data ready for plotting: - peaks - label - precursor
         * TODO: attache label to peak, filter data on _.pluck(peaks, 'label').filter(function(l){return l!== undefined})
         * so everything is attached together at once
         * TODO attache the truncated info in the same way.
         * TODO at view time, we can start every thing on a g shift to the correct position
         */
        p_build_data: function () {
            var self = this;
            var expSp = self.model.get('expSpectrum');

            var ret = {};
            var dmatches = self.model.closerThanPPM(self.tol)

            var labeledPeaks = [];
            ret.labels = _.collect(dmatches, function (dm) {
                var ret = {
                    x: dm.exp.moz,
                    y: expSp.get('intensities')[dm.exp.index],
                    label: dm.theo
                };
                labeledPeaks[dm.exp.index] = ret;
                return ret;
            });

            ret.peaks = _.collect(_.zip(expSp.get('mozs'), expSp.get('intensities'), expSp.get('intensityRanks')), function (p, i) {
                var pk = {
                    x: p[0],
                    y: p[1],
                    intRank: p[2]
                }
                if (labeledPeaks[i] !== undefined) {
                    pk.label = labeledPeaks[i];
                }
                return pk;
            });
            ret.peaksTruncated = []
            var sortedIntensities = _.chain(ret.peaks).pluck('y').sort(function (a, b) {
                return b - a
            }).value();
            if (sortedIntensities[0] > 1.5 * sortedIntensities[1]) {
                var maxIntens = sortedIntensities[1] * 1.1;
                _.chain(ret.peaks).filter(function (p) {
                    return p.y > maxIntens
                }).each(function (p) {
                    p.y = maxIntens;
                    ret.peaksTruncated.push(p);
                });
            }

            ret.precursor = [
                {
                    x: expSp.get('precMoz')
                }
            ]

            self.data = ret;
            return ret;
        },
        close: function () {
            this.vis.remove();
        },

        resize: function (options) {
            var self = this;

            var h = options.height || 200;
            self.height(h).width(options.width || 500);

            self.vis.attr('height', h)
            self.vis.attr('width', self.width())

            self.scalingContext.height(self.height() - self.heightXAxis - self.peaksBaselineHeight - 20);
            // 20 for the menu line,
            // 10 for water line -
            // ugly, nei?
            self.scalingContext.width(self.width())

            self.vis.selectAll('.right-align').attr('transform', 'translate(' + self.width() + ',0)');
            if (self.isFlying) {
                self.p_flying_dont_fly_away()
            }

            self.render()
        },
        refresh: function () {
            var self = this;
            self.p_build_data();
            self.p_setup_labels();
            self.render();
        },
        render: function () {
            var self = this;

            var x = self.scalingContext.x();
            var y = self.scalingContext.y();

            self.d3holderPrecursor.attr('transform', function (p) {
                var t = 'translate(' + x(p.x) + ',' + (y(0) + 9) + ')';
                return t;
            })
            var xAxis = d3.svg.axis().scale(x).ticks(7).tickSize(5);
            self.d3HolderXAxis.call(xAxis);

            self.d3holderPeaks.attr('x1', function (p) {
                return x(p.x);
            }).attr('x2', function (p) {
                return x(p.x);
            }).attr('y1', function (p) {
                return y(0) + self.peaksBaselineHeight;
            }).attr('y2', function (p) {
                return y(p.y);
            });

            self.vis.selectAll('rect.peak-baseline').remove();
            self.vis.append('rect').attr('class', 'peak-baseline relative-size').attr('y', self.height() - self.peaksBaselineHeight - self.heightXAxis).attr('height', self.peaksBaselineHeight).attr('width', self.width() - 2).attr('x', 1).attr('relativeWidth', -2);

            self.d3HolderXAxis.attr('transform', 'translate(0,' + (self.height() - 20 - self.heightXAxis) + ')');

            self.d3holderPeaksTruncated.attr('class', 'peak-truncated').attr('x1', function (p) {
                return x(p.x);
            }).attr('x2', function (p) {
                return x(p.x);
            }).attr('y1', function (p) {
                return y(p.y);
            }).attr('y2', function (p) {
                0;// return self.scalingContext.yScale()(p.y)-20;
            });

            var labY = function (p) {
                return Math.max(y(p.y) - 28, 8)
            }
            self.d3holderLabels.attr('class', 'label').attr('transform', function (p) {
                return 'translate(' + x(p.x) + ',0)';
            });
            self.d3holderLabelsPath.attr('class', 'label-pointer').attr('d', function (p) {
                var j = y(p.y);
                return 'M5,' + labY(p) + 'l-5,8L0,' + j;
            });

            self.d3holderLabelsTextG.attr('transform', function (p) {
                return "translate(10, " + (labY(p) - 2) + "),rotate(-48)"
            })
            self.d3holderLabelsText.attr('class', 'label').text(function (p) {
                return p.label.label;
            });
            if (self.renderCallback) {
                self.renderCallback();
            }
        }
    });
    return MatchSpectrumView;
});
