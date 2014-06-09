/*
 * Abstract what was only PSMAlignment into alignment of two beans with function .mozs() (getting back the list of masses)
 * The point is to align exp/theo, but also exp/exp
 *
 * This will be populated with pklA and pklB, each of them having a .mozs() function.
 *
 * NB: the way the alignment is performed not... efficient. we compute again and again the closest peak with the dichotomy methods, instead of moving  with a single, one shot linear/dicho method...
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */


define(['jquery', 'underscore', 'Backbone', 'fishtones/utils/DeltaMass'], function ($, _, Backbone, DeltaMass) {
    var closestPeak = function (x, xpeaks) {

        if (x <= xpeaks[0]) {
            return 0
        }
        var isup = xpeaks.length - 1;
        if (x >= xpeaks[isup]) {
            return isup
        }
        var iinf = 0;

        while ((iinf + 1) < isup) {
            var imid = Math.round((iinf + isup) / 2);
            if (x < xpeaks[imid]) {
                isup = imid
            } else {
                iinf = imid;
            }
        }
        return ((x - xpeaks[iinf]) < (xpeaks[isup] - x)) ? iinf : isup;
    }

    return Backbone.Model.extend({
        initialize: function (options) {
            var self = this;
        },
        /**
         * get the matching peak indices from A to B
         * @return {*}
         * @private
         */
        matchIndices: function () {
            var self = this;
            var mozsA = self.get('pklA').mozs();
            var mozsB = self.get('pklB').mozs();

            var nA = mozsA.length;
            var nB = mozsB.length;
            if (nA * nB == 0)
                return [];

            var iA = 0;
            var iB = 0;
            var curDelta = DeltaMass.ppm.delta(mozsB[0], mozsA[0]);
            var lastMatch = {
                iA: 0,
                iB: 0,
                errorPPM: curDelta
            };
            var ret = [lastMatch];
            while (iA < nA && iB < nB) {
                var incA;
                if (mozsA[iA] < mozsB[iB]) {
                    incA = true;
                    iA += 1;
                    if (iA == nA)
                        break;
                } else {
                    incA = false;
                    iB += 1;
                    if (iB == nB)
                        break;
                }

                var newDelta = DeltaMass.ppm.delta(mozsB[iB], mozsA[iA]);
                if (Math.abs(newDelta) < Math.abs(curDelta)) {
                    if (lastMatch === undefined) {
                        lastMatch = {}
                        ret.push(lastMatch);

                    }
                    lastMatch.iA = iA;
                    lastMatch.iB = iB;
                    lastMatch.errorPPM = newDelta;

                } else {
                    curDelta = 9999999999999999.0;
                    lastMatch = undefined;
                }
                curDelta = newDelta;
            }
            return ret;

        },
        matches: function () {
            return this.matchIndices();
        },
        /**
         * @ return the list of matches closer than a given tolerance
         */
        closerThanPPM: function (tol) {
            var self = this;
            var m = _.filter(self.get('matches'), function (m) {
                return (Math.abs(m.errorPPM) < tol)
            });
            return m
        }
    });
});
