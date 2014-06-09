/*
 * function to compute delta masses.
  * Only ppm is implemented, but that should be the handler for other units (Da etc..)
  *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define(['underscore'], function(_) {
    var DeltaMass = function() {
        var self = this;

        /**
         * symmetrically correct ppm computation (x-y) should equal to (y-x)
         *
         * @type {{delta: delta, range: range, isCloseTo: isCloseTo}}
         */
        self.ppm = {
            /**
             * distance between two masses
              * @param x
             * @param y
             * @return {number}
             */
            delta : function(x, y) {
                return 2 * (y - x) / (y + x) * 1000000;
            },
            /**
             * return mass boundaries for x +- tol
             * @param x
             * @param tol
             * @return {[mMin, mMax]}
             */
            range : function(x, tol) {
                tol = Math.abs(tol) / 1000000.0;
                var f = (2 + tol) / (2 - tol);
                
                return (x>=0)?[x / f, x * f]:[x * f, x / f]
            },
            /**
             * we have two version:
             *  - with three params, return true/false if (target & tol are closer than candidate)
             *  - with two parameters, return a function that will take w paremter of type candidate; this should be much faster
             * @param {Object} target
             * @param {Object} tol
             * @param {Object} candidate
             */
            isCloseTo : function(target, tol, candidate) {
                if (candidate !== undefined) {
                    return Math.abs(2 * (candidate - target) / (candidate + target) * 1000000) <= tol
                }
                var r = self.ppm.range(target, tol);
                return function(c) {
                    return c >= r[0] && c <= r[1]
                }
            }
        }

    }

    return new DeltaMass();

})
