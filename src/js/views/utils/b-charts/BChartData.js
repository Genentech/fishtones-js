/*
 * Data handler for charting
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define(['jquery', 'underscore'], function($, _) {
    var BChartData = function() {
        var self = this;
        self._data = []
    };

    /**
     * no args, return the list of data set
     * with int, return the ith one
     */
    BChartData.prototype.data = function(i){
        var self = this;
        if(i !== undefined){
            return self._data[i]
        }
        return self._data
    }

    /**
     *
     * @param {Object} oneSet wither in the form of
     *  {x:[..], y:[...], nodeAttrs:{..}}
     * or {poionts[{x:.., y:..}, {x:.., y:..}, ...], nodeAttrs:{..}}
     * nodeAttrs will be added by d3, so they can eoither be constant or function to be call on a the point (p, i), p is ia map {x:.., y:..} and i the index of the point
     */
    BChartData.prototype.add = function(oneSet) {
        var self = this;

        if (_.isArray(oneSet.x)) {
            var tmp = _.clone(oneSet);
            tmp.points = _.collect(_.zip(oneSet.x, oneSet.y), function(p) {
                return {
                    x : p[0],
                    y : p[1]
                }
            })
            delete tmp.x;
            delete tmp.y;
            self._data.push(tmp)

        } else {
            self._data.push(oneSet)
        }
        return self;

    }
    /**
     * number of data sets
     */
    BChartData.prototype.size = function() {
        return this._data.length
    }
    /*
     * range on the dim-axis
     * dim is either 'x' or 'y'
     */
    BChartData.prototype.domain = function(dim) {
        var self = this;
        if (self._domain === undefined) {
            self._domain = {}
        }
        if (self._domain[dim] == undefined) {
            self._domain[dim] = {
                inf : _.min(_.collect(self._data, function(d) {
                    return _.min(_.pluck(d.points, dim));
                })),
                sup : _.max(_.collect(self._data, function(d) {
                    return _.max(_.pluck(d.points, dim));
                }))
            };
        }
        return self._domain[dim]
    };

    return BChartData;
})
