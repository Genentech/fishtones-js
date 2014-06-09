/**
 *  Protein search graph rendering, based on d3 force layout
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define(['jquery', 'underscore', 'Backbone', 'd3', 'fishtones/views/utils/D3ScalingContext'], function($, _, bb, d3, D3ScalingContext) {
    var divTooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);

    return bb.View.extend({
        initialize : function() {
            var self = this;

            self.dim = {
                width : $(self.el).width(),
                height : $(self.el).height()
            }

            self.model2d3graph();
            var xRange = self.d3graph.xRange;

            self.svg = d3.select(self.el).append("svg").attr('width', '100%').attr('height', '100%');

            self.model.bind('change', function() {
                self.model2d3graph();
            });

            self.nodeBoxRadius = 0.2;
        },
        nodeElFunction : {
            aa : function(n) {
                var aa = d3.select(n).attr('name');
                var v = d3.select(n)
                v.append('circle').attr("r", 1).attr('cx', 0).attr('cy', 0);
                v.append('text').text(aa);
                v.append('circle').attr("r", 1).attr('cx', 0).attr('cy', 0).style('opacity', 0.0);

                v.classed('movable', false)
                return v;
            },
            variant : function(n) {
                var aa = d3.select(n).attr('name');
                var v = d3.select(n);
                v.append('circle').attr("r", 1).attr('cx', 0).attr('cy', 0);
                v.append('text').text(aa);
                v.append('circle').attr("r", 1).attr('cx', 0).attr('cy', 0).style('opacity', 0.0);

                v.on("mouseover", function(d) {
                    divTooltip.transition().duration(200).style("opacity", .9);
                    divTooltip.html(d.description).style("left", (d3.event.pageX) + "px").style("top", (d3.event.pageY - 28) + "px");
                }).on("mouseout", function(d) {
                    divTooltip.transition().duration(500).style("opacity", 0);
                })

                return v;
            },
            resmod : function(n) {
                var name = d3.select(n).attr('name');
                var v = d3.select(n)
                v.append('circle').attr("r", 1).attr('cx', 0).attr('cy', 0);
                v.append('text').text(name);
                return v;
            },
            junction : function(n) {
                return d3.select(n).append('circle').attr("r", 0.2).attr('cx', 0).attr('cy', 0)
            },
            ntermini : function(n) {
                return d3.select(n).append('path').attr('d', 'M-1,-0.7L0,0L-1,0.7L-1,-0.7');
            },
            ctermini : function(n) {
                return d3.select(n).append('path').attr('d', 'M1,-0.7L0,0L1,0.7L1,-0.7');
            },
            defaults : function(n) {
                return d3.select(n).append('rect').attr("x", -1).attr("y", -1).attr("width", 2).attr("height", 2).classed('default', true)
            }
        },
        render : function() {
            var self = this;
            var force = d3.layout.force().charge(-100).gravity(0).linkStrength(.3).size([self.dim.width, self.dim.height]);

            force.nodes(self.d3graph.nodes).links(self.d3graph.links).start();
            var link = self.svg.selectAll("line.link").data(self.d3graph.links).enter().append("line").attr("class", function(d) {
                return 'pg-edge' + (d.group ? (' ' + d.group) : '');
            }).style("stroke-width", function(d) {
                return Math.sqrt(d.value);
            });

            var node = self.svg.selectAll(".node").data(self.d3graph.nodes).enter().append('g').attr('class', function(d) {
                return 'pg-vertex ' + d.group;
            }).attr('group', function(d) {
                return d.group
            }).attr('name', function(d) {
                return d.name
            }).classed('movable', true);

            _.each(node[0], function(n) {
                var group = d3.select(n).attr('group')

                var f = self.nodeElFunction[group] || self.nodeElFunction.defaults
                f(n);
            })
            self.svg.selectAll(".vertex.movable").call(force.drag);

            // node.selectAll('g.vertex.aa').append('circle').attr("r", 1).attr('cx', 0).attr('cy', 0).style('stroke', 'black')
            // node.selectAll('g.vertex.aa').append('text').attr('text', function(d) {
            // return d.name;
            // })
            //node.selectAll('g.vertex.aa')
            // node.append("circle").attr("class", "node").attr("r", 1).style("fill", function(d) {
            // return 'red';
            // }).attr('cx', 0).attr('cy', 0);//.call(force.drag);

            var nbNodes = _.filter(self.d3graph.nodes, function(n) {
                return n.group == 'aa';
            }).length + 1;
            var actualBoxRadius = self.dim.width / nbNodes / 5;

            force.on("tick", function() {
                link.attr("x1", function(d) {
                    return d.source.x;
                }).attr("y1", function(d) {
                    return d.source.y;
                }).attr("x2", function(d) {
                    return d.target.x;
                }).attr("y2", function(d) {
                    return d.target.y;
                });

                node.attr('transform', function(d) {

                    return 'translate(' + d.x + ', ' + d.y + '),scale(' + actualBoxRadius + ',' + actualBoxRadius + ')'
                });

            });

            node.append("title").text(function(d) {
                return d.name;
            });

        },
        model2d3graph : function() {
            var self = this;

            var vertices = self.model.get('vertices');
            var edges = self.model.get('edges');

            var id2nodeIdx = [];
            //build nodes
            var nodes = _.collect(vertices, function(v, i) {
                var node = {
                    name : v.name,
                    vertex_id : v.id,
                    group : v.type,
                    description : v.description
                }
                if (v.sequencePos >= 0) {
                    node.sequencePos = v.sequencePos;
                    node.x = v.sequencePos;
                    node.y = self.dim.height / 2;
                    node.fixed = true;
                }

                id2nodeIdx[v.id] = i;
                return node;
            })
            //set junction nodes with fixed position
            _.each(edges, function(e) {
                if (nodes[id2nodeIdx[e.to]].sequencePos !== undefined && nodes[id2nodeIdx[e.from]].group !== "ntermini") {
                    var node = nodes[id2nodeIdx[e.from]];
                    node.x = nodes[id2nodeIdx[e.to]].sequencePos - 0.3;
                    node.y = self.dim.height / 2;
                    node.fixed = true;
                }
            });

            //create links
            var links = _.collect(edges, function(e) {
                var r = {
                    source : id2nodeIdx[e.from],
                    target : id2nodeIdx[e.to],
                    value : 1
                }
                if (e.type) {
                    r.group = e.type;
                }
                return r;
            });

            //spread out jct node with to many links coming in
            var pShift = 0;
            //  - _.min(_.pluck(nodes, 'x'));
            var xMax = 1
            _.each(nodes, function(n) {
                if (n.fixed) {
                    n.x += pShift;
                    var nbIn = _.filter(edges, function(e) {
                        return e.to == n.vertex_id
                    }).length;
                    if (nbIn > 2) {
                        var add = Math.log(nbIn) / Math.log(3);
                        n.x += add;
                        pShift += add;
                    }
                    xMax = n.x;
                } else {
                    n.x = xMax + Math.random() - 0.5;
                    n.y = self.dim.height / 2 + Math.random * 40 - 20
                }
            });

            //and renormalize
            var xMin = _.min(_.pluck(nodes, 'x'));
            var xMax = _.max(_.pluck(nodes, 'x'));
            if (xMin == xMax) {
                xMin -= 0.5;
                xMax += 0.5;
            }
            _.chain(nodes).filter(function(n) {
                return n.fixed
            }).each(function(n) {
                n.x = ((n.x - xMin) * 0.8 / (xMax - xMin) + 0.1) * self.dim.width
            })

            self.d3graph = {
                nodes : nodes,
                links : links,
                xRange : {
                    min : _.min(_.pluck(nodes, 'x')),
                    max : _.max(_.pluck(nodes, 'x'))
                }
            }
        }
    })
})
