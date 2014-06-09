/**
 * utility method that will apply a regular expression onto a string, assuming that all al the string is captired by the reg exp (no holes)
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define(['underscore'], function (_) {
    RegExpFullSpliter = function (options) {

    }
    /**
     * all match catpure by the regexp are returned in an array,
     * If some piece of the string is not covered, then an Exception is thrown
     * regexp is duplicate to avoid sync problem on lastIndexOf and this kind of things...
     * @param {Object} regexp is a string or regexp
     * @param {Object} str
     */
    RegExpFullSpliter.prototype.split = function (regexp, str) {
        var ret = []

        var re
        if (regexp instanceof RegExp) {
            re = new RegExp(regexp.source, 'g')
        } else {
            re = new RegExp(regexp, 'g')
        }
        re.global = true

        var posMatch = 0
        while (m = re.exec(str)) {
            if (m.index != posMatch) {
                throw {
                    name: 'RegexpFullSequenceCoverage',
                    message: 'cannot character at pos [' + posMatch + '-' + m.index + '] (' + str.substring(posMatch, m.index) + ') in "' + str + '" is not covered by regular expression ' + re
                }
            }
            posMatch = re.lastIndex;

            ret.push(m)
        }
        if (str.length != posMatch) {
            throw {
                name: 'RegexpFullSequenceCoverage',
                message: 'cannot character at pos [' + posMatch + '-' + m.index + '] (' + str.substring(posMatch, m.index) + ') in "' + str + '" is not covered by regular expression ' + re
            }
        }
        return ret
    }

    return RegExpFullSpliter
});
