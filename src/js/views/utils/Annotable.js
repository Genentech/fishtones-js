/*
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define(['jquery', 'underscore', 'Backbone', 'd3'], function($, _, bb, d3) {

    var AnnotationView = Backbone.View.extend({
    });

    var Annotable = function() {

    }

    Annotable.enable = function(view, options) {
        if (self.annotList !== undefined) {
            return;
        }
        options = options || {};

        view.annotList = new Array();
        view.annotViewBuilt = false;
        view.annotAdd = function(annot, options) {
            view.annotViewBuilt = false;
            if (_.isArray(annot)) {
                _.each(annot, function(a) {
                    view.annotAdd(a, options);
                });
                return view;
            };
            options = options || {};
            view.annotList.push(annot)
            return view;
        }
        view.annotSize = function() {
            return view.annotList.length;
        }

        view.annotClear = function() {
            view.annotViewBuilt = false;
            view.annotList.length = 0;
            return view
        };

        view.annotEl = (options.appendTo || view.el).append('g').attr('class', 'annot-layer')
        var buildGraph = function() {
            var nodes = [];
            var links = [];
            var x = view.scalingContext.x();
            var y = view.scalingContext.y();
            var yOrig0 = y.invert(0);
            _.each(view.annotList, function(a, i) {
                var n = {
                    vertex_id : i,
                    type : 'annotation',
                    text : a.text,
                    annot : a,
                    x: x(a.x),
                    y: y(a.y)/2,
                    xOrig : a.x,
                    yOrig :(yOrig0+ a.y)/2
                };
                var nAnchor = {
                    type : 'anchor',
                    x : x(a.x),
                    y : y(a.y),
                    xOrig : a.x,
                    yOrig : a.y,
                    fixed : true,
                    annot : a
                };
                var nTop = {
                    type : 'anchor',
                    x : view.scalingContext.x()(a.x),
                    y : 0,
                    xOrig : a.x,
                    yOrig : yOrig0,
                    fixed : true,
                    annot : a
                };
                nodes.push(n);
                nodes.push(nAnchor);
                nodes.push(nTop);
                links.push({
                    source : n,
                    target : nAnchor,
                    type : 'anchor',
                    annot : a

                });
                links.push({
                    source : n,
                    target : nTop,
                    type : 'invisible'
                })
            });

            return {
                nodes : nodes,
                links : links
            }
        }
        var buildLayout = function(graph) {
            view.annotLayout = d3.layout.force().gravity(0).size([view.scalingContext.width, view.scalingContext.height]);
            //view.annotLayout.friction(0.98);
            view.annotLayout.nodes(graph.nodes).links(graph.links).start();
            //we stop it soon, it should not be a burden to converge
            setTimeout(function() {
                view.annotLayout.stop();
            }, 300)
            view.annotLayout.on('end', function() {
                view.annotRender();
            })

            view.annotEl.selectAll(".node").remove()
            view.annotEl.selectAll("line").remove()

            var nodes = view.annotEl.selectAll(".node").data(graph.nodes).enter().append('g').attr('class', function(d) {
                return 'node ' + d.type;
            }).attr('name', function(d) {
                return d.name
            })
            nodes.append('text').text(function(d) {
                return d.text;
            }).classed('movable', true);

            var links = view.annotEl.selectAll("line").data(_.filter(graph.links, function(l) {
                return l.type !== 'invisible'
            })).enter().append("line").attr("class", function(d) {
                return 'annot-link ' + d.type + ' ' + d.annot.type;
            }).style("stroke-width", 1);

            view.annotLayout.on("tick", function() {
                links.attr("x1", function(d) {
                    return d.source.x;
                }).attr("y1", function(d) {
                    return d.source.y;
                }).attr("x2", function(d) {
                    return d.target.x;
                }).attr("y2", function(d) {
                    return d.target.y;
                });

                view.annotEl.selectAll("g.node.annotation").attr("transform", function(d) {
                    d.xOrig = view.scalingContext.x().invert(d.x);
                    d.yOrig = view.scalingContext.y().invert(d.y);
                    return 'translate(' + d.x + ',' + d.y + ')';
                });
            });
        }
        //rednering is calling the original rendering + the annotations layer rendering
        view.annotRender = function(options) {
            if (!view.annotViewBuilt) {
                view.annotViewBuilt = true;

                view.annotEl.selectAll().remove();
                var graph = buildGraph();
                buildLayout(graph)
                return;
            }
            var x= view.scalingContext.x();
            var y = view.scalingContext.y();

            view.annotEl.selectAll("line").attr("x1", function(d) {
                return x(d.source.xOrig);
            }).attr("y1", function(d) {
                return y(d.source.yOrig);
            }).attr("x2", function(d) {
                return x(d.target.xOrig);
            }).attr("y2", function(d) {
                return y(d.target.yOrig);
            });

            view.annotEl.selectAll("g.node.annotation").attr("transform", function(d) {
                return 'translate(' + x(d.xOrig) + ',' + y(d.yOrig) + ')';
            });
        }
        var origRender = view.render;
        view.render = function() {
            origRender.call(view, arguments);
            view.annotRender(arguments);

        }

        return view;
    }

    return Annotable

});
