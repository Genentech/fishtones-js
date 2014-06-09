/*
 * a AASequencePeptidePtr object transforms peptide sequence into a shorter pointer to the proteins.
 * This alias should be unequivocal regarding to the list of known proteins (AASequenceDictionary)
 *
 * This class is used as a utility by RuichSequenceShortcuter
 *
 * We want to give H3K4 and this kind of shortcut, given an enzyme, and it returns a unambiguous peptide
 * And vice versa, given a peptide, it gives back the shortest possible pointer
 *
 * For example, See AASequencePeptidePtr-test.js for examples
 *
 * Properties:
 * - cleavageEnzyme: either a name refering to the dictionary or an object
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */


define(['underscore', 'Backbone', 'fishtones/collections/dry/CleavageEnzymeDictionary', 'fishtones/collections/dry/AASequenceDictionary'], function (_, Backbone, dicoCE, dicoSeq) {
    var AASequencePeptidePtr = Backbone.Model.extend({
        defaults: {
            cleavageEnzyme: null,
            peptideIndex: {}
        },
        initialize: function () {
        },
        set: function (attrs, options) {
            var self = this;
            var ce = null;
            if (attrs == 'cleavageEnzyme') {
                if (_.isString(options)) {
                    ce = options = dicoCE.get(options)
                } else if (options instanceof CleavageEnzyme) {
                    ce = options;
                }
            } else if (_.isString(attrs.cleavageEnzyme)) {
                ce = attrs.cleavageEnzyme = dicoCE.get(attrs.cleavageEnzyme);
            } else if (attrs.cleavageEnzyme) {
                ce = attrs.cleavageEnzyme;
            }
            if (ce != null) {
                self.p_rebuildPeptideIndex(ce);
            }
            return Backbone.Model.prototype.set.call(self, attrs, options);
        },

        /**
         * rebuild the index peptide -> sequence + positions
         * @param {CleavageEnzyme} optional params (default is the cleavageEnzyme property). We can pass it in case the enzyme pro has not bee set yet (setter overiding)
         */
        p_rebuildPeptideIndex: function (ce) {
            var self = this;
            var pindex = {};

            ce = ce || self.get('cleavageEnzyme');
            if (ce == null) {
                return;
            }
            var n = 0;
            _.each(dicoSeq.models, function (aaSeq) {
                var pos = 0;
                _.each(ce.cleave(aaSeq.get('sequence')), function (pept) {
                    var plist = pindex[pept];
                    if (!plist) {
                        pindex[pept] = [];
                        plist = pindex[pept]
                    }
                    plist.push({
                        aaSeq: aaSeq,
                        offset: pos
                    })
                    pos += pept.length;
                })
                n++
            });
            self.set('peptideIndex', pindex);
            return self;
        },

        /**
         * tansform
         * H3.[1,1T,2] -> H3.1
         * H3.1 -> H3.1
         */
        ptrTrim: function (ptr) {

            if (m = /(.+)\[(.+?),.*?](.*)/.exec(ptr)) {
                return m[1] + m[2] + m[3]
            }
            return ptr;
        },
        /**
         * from the sequence pointer, extract the list of proteins matching
         * H3K4 => all the prot stating with a name H3
         * @param {String} ptr
         */
        ptr2AASequences: function (ptr) {
            var self = this;
            var seqPtr = self.p_ptr2seqAndPeptAnchor(self.ptrTrim(ptr)).seqPtr;

            if (dicoSeq.get(seqPtr) != null) {
                return [dicoSeq.get(seqPtr)];
            }

            var l = _.filter(dicoSeq.models, function (aaseq) {
                return aaseq.get('name').indexOf(seqPtr) == 0
            });

            if (l.length == 0) {
                throw {
                    name: 'IllegalsequencePtrException',
                    message: 'cannot find matching AASequence [' + ptr + ']/[' + seqPtr + ']'
                }
                return null;
            }
            return l;
        },
        /**
         * from the sequence pointer, return one map for the peptide: {sequence: ... , offset:...}
         * It will the be passed to RichSequenceShortcuter for the actualRichSequence creation
         *
         * If the answer is ambiguous, an excpetionHandler.raise(excpetion) is raised
         *
         * @param {String} ptr
         */
        ptr2peptide: function (ptr) {
            var self = this;
            var lSequences = self.ptr2AASequences(ptr);

            var aaptr = self.p_ptr2seqAndPeptAnchor(ptr).aaPtr;
            var m = aaptr.match(/([A-Z])(\d+)/)
            var anchorAA = m[1];
            var anchorPos = parseInt(m[2]);

            var lpept = _.chain(lSequences).collect(function (aaSeq) {
                return self.p_cleavedPeptideAt(aaSeq, anchorPos);
            }).uniq().groupBy(function (p) {
                return p.sequence + '|' + p.offset
            }).values().collect(function (l) {
                return l[0]
            }).value();

            if (lpept.length > 1) {
                throw {
                    name: 'AmbiguousPtrException',
                    message: 'pointer ' + ptr + ' points to multiple peptides: ' + _.collect(lpept, function (p) {
                        return p.sequence + '@' + p.offset
                    }).join(', ') + ".\nChoose a less ambiguous protein name among: " + _.collect(lSequences, function (aaSeq) {
                        return aaSeq.get('name');
                    }).join(', ')
                };
                return null;
            }

            var ret = lpept[0];

            if (ret.sequence.charAt(anchorPos - ret.offset) != anchorAA) {
                throw {
                    name: 'InvalidPtrException',
                    message: 'pointer ' + ptr + ' does not point to aminoacid: ' + anchorAA + ' at position ' + anchorPos + ' (in fact:' + ret.sequence.charAt(anchorPos - ret.offset) + ')'
                };
                return null;

            }

            return ret

        },

        /**
         * from a list of AASequence or names, build a short concatenation on them
         */
        concatenateNames: function (lseq) {
            var self = this;
            var lNames = _.collect(lseq, function (n) {
                if (_.isString(n)) {
                    return n
                }
                return n.get('name');
            });
            lNames = lNames.sort();

            if (lNames.length <= 1) {
                return lNames[0];
            }

            var iCommon = 1;
            while (iCommon <= lNames[0].length) {
                var pref = lNames[0].substr(0, iCommon);

                if (_.any(lNames, function (n) {
                    return n.substr(0, iCommon) != pref;
                })) {

                    iCommon--;
                    break;
                }
                iCommon++
            }
            var common = lNames[0].substr(0, iCommon);

            var allNames4common = _.chain(dicoSeq.models).collect(function (aaseq) {
                return aaseq.get('name')
            }).filter(function (n) {
                return n.indexOf(common) == 0
            }).value().sort()
            if (allNames4common.length == lNames.length) {
                return self.p_shortenName(common)
            }
            return common + lNames[0].substr(iCommon);

            // return common + '[' + _.collect(lNames, function(n) {
            // return n.substr(iCommon);
            // }).join(',') + ']'
        },

        /**
         * from a sequence, return the cleaved peptide containeing position pos
         * @param {AASequence} aaSeq
         * @param {int} pos
         */
        p_cleavedPeptideAt: function (aaSeq, pos) {
            var self = this;
            if (pos >= aaSeq.size()) {
                throw {
                    name: 'IllegalPositionOnSequence',
                    message: 'position ' + pos + ' exceed size ' + aaSeq.size() + ' for seq ' + get.get('name')
                };
                return null;
            }
            var p = 0;

            var regexp = self.get('cleavageEnzyme').get('rule');
            regexp.lastIndex = 0;
            while (m = regexp.exec(aaSeq.get('sequence'))) {
                var pept = m[0]
                p += pept.length;
                if (p > pos) {
                    return {
                        sequence: pept,
                        offset: p - pept.length
                    }
                }
            }
            return null
        },
        /**
         * from H2AK27AcK36Me -> {seqPtr:'H2A', aaPtr:'K27'}
         * @param {String} ptr
         */
        p_ptr2seqAndPeptAnchor: function (ptr) {
            var re = /^\s*([A-Z]+.*?)([A-Z]\d+)/;
            var m = ptr.match(re);
            if (!m) {
                throw {
                    name: 'IllegalsequencePtrException',
                    message: ' cannot extract sequence name head  / AA pos from [' + ptr + '] with ' + re
                };
                return null;
            }
            return {
                seqPtr: m[1],
                aaPtr: m[2]
            }

        },
        // check if have them all stating with common (in this case, we can return only the common part)
        p_shortenName: function (name) {
            var allNames = _.collect(dicoSeq.models, function (aaseq) {
                return aaseq.get('name');
            })
            var curName = name;
            var i = name.length - 1;
            while (i > 0) {
                var truncated = name.substr(0, i);
                if (_.any(allNames, function (n) {

                    var okFull = n.substr(0, name.length) == name;
                    var okTrunc = n.substr(0, truncated.length) == truncated;
                    return (!okFull && okTrunc) || (okFull && !okTrunc);
                })) {
                    break;
                }
                i--;
            }
            return name.substr(0, i + 1)
        },

        toString: function () {
            var self = this;
            return self.get('cleavageEnzyme') + ' # peptides: ' + _.size(self.get('peptideIndex'));
        }
    });
    return AASequencePeptidePtr;
});
