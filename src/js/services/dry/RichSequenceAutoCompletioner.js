/*
 * given a partial RichSequence string, return value autocompletion values.
 * This can cover:
 * - give me a numerical value, I'll return close modification list
 * - give me a partial modification name, I'll shoot the matching modifications
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define(['jquery', 'underscore', 'Backbone', 'fishtones/collections/dry/AminoAcidDictionary', 'fishtones/collections/dry/ResidueModificationDictionary'], function ($, _, Backbone, dicoAA, dicoResMod) {

    var RichSequenceAutoCompletioner = function () {
        var self = this;
        self.modifNames = _.chain(dicoResMod.models).collect(function (rm) {
            return rm.get('name')
        }).sort().value();

        self.modif2mass = {}
        _.each(dicoResMod.models, function (rm) {
            self.modif2mass[rm.get('name')] = rm.get('mass')
        })
    };

    /**
     * return a true value if the current there is not closeed curly bracket before the next open or the end
     * (i.e., if we call that funciton fter opening a culry, it will us if we shall add a cose one)
     * @param {Object} txt
     * @param {Object} pos
     */
    RichSequenceAutoCompletioner.prototype.closeCurly = function (txt, pos) {
        var tail = txt.substring(pos)
        if (tail.indexOf('}') < 0 || (tail.indexOf('{') > 0) && (tail.indexOf('}') > tail.indexOf('{'))) {
            return true
        }
        return false;
    };
    /**
     * given a text and a postion, extract the prefix that will be used as a anchor for autocompletion, as well as the text position to be replaced by the autocompletioner
     * Think that we can come back into  curly brackets and we still want some completion
     * return null is we are not at a position to get any replacement
     *
     * go check jasmine RichSequenceAutoCompletioner%20replaceable to get tons of examples
     * @param {Object} txt
     * @param {Object} pos
     */
    RichSequenceAutoCompletioner.prototype.replaceable = function (txt, pos) {
        var before = txt.substring(0, pos)
        var after = txt.substring(pos)

        if (before.indexOf('{') < 0) {
            //not even an open curly, don't waste my time
            return null
        }

        before = before.replace(/.*\}/, '');
        if (before.indexOf('{') < 0) {
            //we are not after an open curly bracket
            return null;
        }
        before = before.replace(/.*[\{,]/, '');

        after = after.replace(/[\},].*/, '');

        return {
            prefix: before,
            posStart: pos - before.length,
            posEnd: pos + after.length
        }

    };

    /**
     * get the list of modifcation maatching the prefix. i.e.
     * starting with the prefix
     * case is not important
     * prefix can be a mass (+/- 1 Da)
     * @param {Object} prefix
     */
    RichSequenceAutoCompletioner.prototype.getList = function (prefix) {
        var self = this;

        var mass = parseFloat(prefix)
        if (_.isFinite(mass)) {
            var mInf = mass - 1.0
            var mSup = mass + 1.0
            return _.chain(self.modif2mass).collect(function (mass, name) {
                if (mass < mInf || mass > mSup) {
                    return null
                }
                return name
            }).filter(function (n) {
                return n != null
            }).value()
        }

        prefix = prefix.toLowerCase();
        return _.filter(this.modifNames, function (n) {
            return n.toLowerCase().indexOf(prefix) == 0
        })
    }
    return RichSequenceAutoCompletioner;
});
