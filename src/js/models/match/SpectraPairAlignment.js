/**
 * Extends PeakListPairAlignment for a pair of two ExpSpectrum
 * Properties are
 * - spectrumA
 * - spectrumB
 *
 * alignment is recomputed if any of them trigge a 'change' event
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define(['underscore', './PeakListPairAlignment'], function(_, PeakListPairAlignment) {

    /**
     * build the alignment with options {richSequence:..., expSpectrum:...}
     */
    var PSMAlignment = PeakListPairAlignment.extend({
        initialize : function(options) {
            var self = this;
            PSMAlignment.__super__.initialize.call(this, {});
            self.build()

            self.get('spectrumA').on("change", function() {
                self.build()
            })
            self.get('spectrumB').on("change", function() {
                self.build()
            })
        },
        /**
         * @private
         */
        build : function() {
            var self = this;

            self.set('pklA', self.get('spectrumA'))
            self.set('pklB', self.get('spectrumB'))

            var matchIndices = self.matchIndices();

            var xpeaksA = self.get('spectrumA').get('mozs');
            var xIntensitiesA = self.get('spectrumA').get('intensityRanks');
            var xpeaksB = self.get('spectrumB').get('mozs');
            var xIntensitiesB = self.get('spectrumB').get('intensityRanks');

            var matches = _.map(matchIndices, function(mi) {
                return {
                    pkB : {
                        index : mi.iB,
                        moz : xpeaksB[mi.iB],
                        intensityRank : xIntensitiesB[mi.iB],
                    },
                    pkA : {
                        index : mi.iA,
                        moz : xpeaksA[mi.iA],
                        intensityRank : xIntensitiesA[mi.iA],
                    },
                    errorPPM : mi.errorPPM
                }
            })
            self.set('matches', matches);

        },

        /**
         * @return difference between the experimental and the theoretical precursors (MH)
         */
        deltaPrecMozs : function() {
            var self = this;
            var z = self.get('expSpectrum').get('precCharge');
            var theo = massBuilder.computeMassRichSequence(self.get('richSequence'), z)
            return (self.get('expSpectrum').get('precMoz') - theo) * z
        },
        /**
         *
         * @return {{}} ready for JSON
         */
        serialize : function() {
            var self = this;
            var ret = {};
            ret.expSpectrum = self.get('expSpectrum').toJSON()

            var rseq = self.get('richSequence').toString();
            ret.richSequence = rseq

            ret.id = self.computeId();
            ret.aaSequence = self.get('richSequence').toAAString();

            return ret;
        },
        computeId : function() {
            var self = this;
            return self.get('expSpectrum').get('id') + '|' + self.get('richSequence').toString()

        },
        /**
         * return the number of unmacthed experimental peak, with a mass greater than the precursor,
         * intensity < inFirst and with tol error
         * @param {Object} tol
         * @param {Object} inFirst
         */
        unmatchedFactor : function(tol, inFirst) {
            var self = this;
            var matches = self.closerThanPPM(tol);

            var pks = _.filter(_.zip(self.get('expSpectrum').get('mozs'), self.get('expSpectrum').get('intensityRanks')), function(p) {
                return p[1] < inFirst
            });

            var mPrec = self.get('expSpectrum').get('precMoz')
            return _.filter(pks, function(p) {
                return p[0] > mPrec;
            }).length - _.filter(matches, function(m) {
                return (m.exp.intensityRank < inFirst) && (m.exp.moz > mPrec);
            }).length

        }
    });

    return PSMAlignment;
});
