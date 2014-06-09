/**
 * extends PeakListPairAlignment to map the closest peak of an experimental and theoretical spectra. Both must be sorted by mozs.
 * Properties are
 * - richSequence
 * - expSpectrum
 *
 * alignment is recomputed on property change.
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define(['jquery', 'underscore', 'Backbone', 'fishtones/services/dry/MassBuilder', './PeakListPairAlignment'], function($, _, Backbone, massBuilder, PeakListPairAlignment) {

    /**
     * build the alignment with options {richSequence:..., expSpectrum:...}
     */
    var PSMAlignment = PeakListPairAlignment.extend({
        initialize : function(options) {
            var self = this;
            PSMAlignment.__super__.initialize.call(this, {});

            self.set('richSequence', options.richSequence);
            self.set('expSpectrum', options.expSpectrum);

            self.build()

            self.get('expSpectrum').on("change", function() {
                self.build()
            })
            self.get('richSequence').on("change", function() {
                self.build()
            })
            self.on("change:richSequence", function() {
                self.build()
            })
        },

        /**
         * compute the underlying alignment
         * @private
         */
        build : function() {
            var self = this;

            self.set('theoSpectrum', massBuilder.computeTheoSpectrum(self.get('richSequence')));

            self.set('pklA', self.get('theoSpectrum'))
            self.set('pklB', self.get('expSpectrum'))

            var matchIndices = self.matchIndices();
            var spTheo = self.get('theoSpectrum').get('peaks');
            var xpeaks = self.get('expSpectrum').get('mozs');
            var xIntensities = self.get('expSpectrum').get('intensityRanks');

            var matches = _.map(matchIndices, function(mi) {
                return {

                    theo : spTheo[mi.iA],
                    exp : {
                        index : mi.iB,
                        moz : xpeaks[mi.iB],
                        intensityRank : xIntensities[mi.iB],
                    },
                    errorPPM : mi.errorPPM
                }
            })
            self.set('matches', matches);

        },
   
        /**
         * difference between the experimental precurso mass and the sequence mass (MH)
         */
        deltaPrecMozs : function() {
            var self = this;
            var z = self.get('expSpectrum').get('precCharge');
            var theo = massBuilder.computeMassRichSequence(self.get('richSequence'), z)
            return (self.get('expSpectrum').get('precMoz') - theo) * z
        },
        /**
         *
         * @return {{}} a jso ready string
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
         * return the number of unmatched experimental peak, with a mass greater than the precursor,
         * intensity < inFirst and with tol error
         * @param {Object} tol
         * @param {Object} inFirst
         * @return an integer count
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
