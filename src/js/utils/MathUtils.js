/**
 * basic math utilities
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define(['underscore'], function (_) {
    var MathUtils = function (options) {
    }
    /**
     * Simpson integration over x,y values
     * @param x
     * @param y
     * @return {number}
     */
    MathUtils.prototype.integrate = function (x, y) {
        var s = 0.0;
        _.times(x.length - 1, function (i) {
            s += 1.0 * (x[i + 1] - x[i]) * (y[i] + y[i + 1])
        })
        return s / 2.0
    }

    /**
     * linear interpolatiom
     * xs & ys are the known measures
     * xs must be sorted and striclty increasing
     *
     * for a given x, return the ys' interpolation between the two closest surroundiing xs'
     * asking for an x outside boundaries will return NaN
     *
     * @param {Object} xs
     * @param {Object} ys
     * @param {Object} x
     */
    MathUtils.prototype.interpolate = function (xs, ys, x) {
        var n = _.size(xs)
        if (n == 0 || x < xs[0] || x > xs[n - 1]) {
            return NaN;
        }
        var i1 = 0, i2 = n - 1;
        while (i2 - i1 > 1) {
            var im = Math.floor((i1 + i2) / 2)
            if (x < xs[im]) {
                i2 = im
            } else {
                i1 = im
            }
        }
        return  ys[i1] + (x - xs[i1]) / (xs[i2] - xs[i1]) * (ys[i2] - ys[i1])

    }

    return new MathUtils()
});
