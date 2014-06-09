/**
 * utility functions on string
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define(['underscore'], function (_) {
    var StringUtils = function (options) {
    }
    /**
     * from an array of string, remove the common prefix and suffix and return a map such as
     * {prefix:'xxx', suffix:'zzz', diff:['aa', 'bb', 'cccc']}
     * @param {Object} strs
     */
    StringUtils.prototype.reduceCommons = function (strs) {
        var ret = {}
        if (strs.length <= 1) {
            return {
                prefix: '',
                suffix: '',
                diff: strs
            }
        }

        var prefix = StringUtils.prototype.commonPrefix(strs);
        var len = prefix.length
        var diffs = _.collect(strs, function (s) {
            return s.substr(len)
        })

        var suffix = StringUtils.prototype.commonSuffix(diffs);
        len = suffix.length;
        if (len > 0) {
            diffs = _.collect(diffs, function (s) {
                return s.substr(0, s.length - len)
            })
        }

        return {
            prefix: prefix,
            suffix: suffix,
            diff: diffs
        }

    }
    /**
     * find the common prefix between n strings
     * @param strs
     * @return {string}
     */
    StringUtils.prototype.commonPrefix = function (strs) {
        if (strs.length <= 1) {
            return ''
        }

        var luniq = _.find(_.range(1, strs[0].length + 1), function (i) {
            return _.chain(strs).collect(function (seq) {
                return seq.substr(0, i)
            }).uniq().value().length != 1
        })
        luniq--;
        return strs[0].substr(0, luniq)

    }

    /**
     * find the common suffix between n strings
     * @param strs
     * @return {string}
     */
    StringUtils.prototype.commonSuffix = function (strs) {
        if (strs.length <= 1) {
            return ''
        }

        var len = _.chain(strs).collect(function (s) {
            return s.length
        }).max().value();
        var luniq = _.find(_.range(1, len), function (i) {
            return _.chain(strs).collect(function (seq) {
                return seq.substr(-i)
            }).uniq().value().length != 1
        })
        luniq--;

        return (luniq == 0) ? '' : strs[0].substr(-luniq)

    }
    return new StringUtils()
});
