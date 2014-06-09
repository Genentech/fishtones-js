/**
 * given a mass, return the possible solutions (aa, modif, etc.)
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define(['underscore', 'fishtones/collections/dry/AminoAcidDictionary', 'fishtones/collections/dry/ResidueModificationDictionary', 'fishtones/utils/DeltaMass'], function(_, dicoAA, dicoResMod, deltaMass) {
    var mLosses = {
        H20 : 18.01056468,
        NH3 : 17.0265491,
        CH3NO : 45.0214637,
        CH4SO : 63.998285,
        CO : 27.9949146
    }

    var DeltaMassElucidator = function() {
        var self = this;
        self.p_init()
        return self;
    };

    DeltaMassElucidator.prototype.p_init = function() {
        var self = this;
        var l = []
        _.each(_.range(1, 3), function(z) {
            _.each(dicoAA.models, function(aa) {
                l.push({
                    name : aa.get('code1'),
                    mass : aa.get('mass') / z,
                    z : z
                });
            })

            _.each(mLosses, function(mass, name) {
                l.push({
                    name : name,
                    mass : mass / z,
                    z : z
                })

            })
        });
        _.each(l, function(e) {
            if (e.z == 2) {
                e.name += '++'
            }
            if (e.z == 3) {
                e.name += '+++'
            }
        });
        l.push({
            name : 'iso +',
            mass : 1.00728
        })
        l.push({
            name : 'iso 2+',
            mass : 1.00728 * 2
        })
        l.push({
            name : 'iso +/2',
            mass : 1.00728 / 2
        })

        l = l.concat(_.map(l, function(e) {
            return {
                name : '-' + e.name,
                mass : -e.mass,
                z : e.z
            }
        }))

        self.massIndex = _.sortBy(l, function(e) {
            return e.mass
        });
    }
    /**
     * return the possible fit x for refMass + mass  clos to refMass + x within tolPPM
     * @param {Object} mass
     * @param {Object} refMass
     * @param {Object} tolPPM
     * @param {Object} nbMax
     */
    DeltaMassElucidator.prototype.what = function(mass, refMass, tolPPM, nbMax) {
        var self = this;

        var mTarget = mass + refMass
        var fIsCloseTo = deltaMass.ppm.isCloseTo(mTarget, tolPPM);

        var l = _.chain(self.massIndex).filter(function(e) {
            return fIsCloseTo(refMass + e.mass)
        }).sortBy(function(e) {
            return Math.abs(e.mass - mass)
        }).first(nbMax).value()

        return _.collect(l, function(w) {
            //NB we have a symtery problem when computing the mass difference.
            var dm = (w.mass - mass) / (refMass + mTarget) * 2000000.0
            return {
                name : w.name,
                mass : w.mass,
                deltaPPM : deltaMass.ppm.delta(mTarget, w.mass + refMass)
            }
        })
    }
    /**
     * Return a list of objet with {index, name, mass, deltPPM} elements close to refMass + some deltaelucidator shift
     * @param {Object} anchorMass
     * @param {Object} listMasses must be sorted
     * @param {Object} tolPPM
     */
    DeltaMassElucidator.prototype.whoList = function(anchorMass, listMasses, tolPPM) {
        var self = this;

        var iList = 0;
        var nbMasses = listMasses.length;
        var ret = _.chain(self.massIndex).map(function(w, imi) {
            var range = deltaMass.ppm.range(anchorMass + w.mass, tolPPM);
            for (; iList < nbMasses && listMasses[iList] < range[0]; iList++) {
            }
            if (listMasses[iList] <= range[1]) {
                return {
                    index : iList,
                    name : w.name,
                    mass : w.mass,
                    deltaPPM : deltaMass.ppm.delta(listMasses[iList], w.mass + anchorMass)
                }
            } else {
                return undefined;
            }

        }).filter(function(t) {
            return t;
        }).value()
        return ret
    }

    return new DeltaMassElucidator();
});
