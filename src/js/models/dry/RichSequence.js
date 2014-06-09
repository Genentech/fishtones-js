/*
 * RichSequence is the expression of a peptide, with modifications. It is certainly one of the most used class among fishTones-js.
 * It hold the peptide sequence, with any number of possible modification on a amino acid.
 * It also holds C/N-terms modification(s) (multiple can also apply on the termini.
 * This implementation is not done with speed in mind, but versatility of use.
 *
 * A RichSequence object will contains a 'sequence' properties which is an array of {aa:x, modifications:[]}
 *
 * When getting modification per positions on a peptide of length l:
 * 0 -> modif one the first amino acid
 * l-1 -> on the last amino acid
 * -1 -> NTerm
 * l -> CTerm
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define(['jquery', 'underscore', 'Backbone', 'fishtones/utils/RegExpFullSpliter', 'fishtones/collections/dry/AminoAcidDictionary', 'fishtones/collections/dry/ResidueModificationDictionary', 'fishtones/models/dry/ResidueModification'], function ($, _, Backbone, RegExpFullSpliter, dicoAA, dicoResMod, ResidueModification) {

    var RichSequence = Backbone.Model.extend({
        defaults: {
            sequence: []
        },
        initialize: function () {
        },

        clone: function () {
            return new RichSequence().fromString(this.toString())
        },
        /**
         * get the modification array for a given amino acid position
         * @param pos
         * @param create : create such an arrya on the object if it was not existing [default false]
         * @return {*}
         * @private
         */
        getModificationArray: function (pos, create) {
            var self = this;
            if (pos == -1) {
                if (self.get('nTermModifications') === undefined && create) {
                    self.set('nTermModifications', [])
                }
                return self.get('nTermModifications');
            }
            if (pos == self.size()) {
                if (self.get('cTermModifications') === undefined && create) {
                    self.set('cTermModifications', [])
                }
                return self.get('cTermModifications');
            }
            if (!self.get('sequence')[pos].modifications && create) {
                self.get('sequence')[pos].modifications = [];
            }
            return self.get('sequence')[pos].modifications;

        },
        /**
         * set the moficiation array
         * @param pos
         * @param modifarray
         * @return this
         * @private
         */
        setModificationArray: function (pos, modifarray) {
            var self = this;
            if (pos == -1) {
                self.set('nTermModifications', modifarray);
                return self;
            }

            if (pos == self.size()) {
                self.set('cTermModifications', modifarray)
                return self;
            }

            self.get('sequence')[pos].modifications = modifarray;
            return self;

        },
        /**
         * add one modification or an array of modif at a given position to the exisiting list.
         * @param pos: position beetween -1 and len
         * @param mod: one modificaiton or an array of it
         */
        setModification: function (pos, mod) {
            var self = this;
            self.setModificationArray(pos, undefined);
            self.addModification(pos, mod);
            self.trigger('change')
        },
        /**
         * add one modification or an array of modif at a given position to the exisiting list.
         * @param pos: position beetween -1 and len
         * @param mod: one modificaiton or an array of it
         */
        addModification: function (pos, mod) {
            var self = this;

            if (mod === undefined) {
                return self;
            }
            var modArr = self.getModificationArray(pos, true)
            if (_.isArray(mod)) {
                _.each(mod, function (rm) {
                    modArr.push(rm);
                });
            } else {
                modArr.push(mod);
            }
            return self;
        },

        /**
         * @param pos: between -1 and len
         * @return the list of modification at this position (-1 and size() position for termini)
         */
        countModificationsAt: function (pos) {
            var a = this.getModificationArray(pos);
            return a ? a.length : 0;
        },
        /**
         * @param pos: between -1 and len
         * @return the list of modification at this position
         */
        modifAt: function (pos) {
            return this.getModificationArray(pos)
        },

        /**
         * @paeram pos: between 0 and len-1
         * @return the amino aicd at this position
         */
        aaAt: function (pos) {
            return this.get('sequence')[pos].aa
        },
        /**
         * read the object back from the toString method. See toString for more details 'ACD{Oxidation}EFG{123.45,Phosphorylation}HIK-{Acetyl}'
         * RichSequence-tests.js wil show plenty of examples
         * @param str
         * @return {RichSequence}
         */
        fromString: function (str) {
            var self = this;
            self.set('sequence', []);

            str = str.trim()
            var matchNterm = /^\{([^\}]*)\}/.exec(str)
            if (matchNterm) {
                str = str.substring(matchNterm[0].length);
                self.setModification(-1, self.string2modifs(matchNterm[1]));
            } else {
                self.setModification(-1, undefined);
            }
            var matchCterm = /([\}\-])\{([^\}]*)\}$/.exec(str);
            var ctermModifs = undefined;
            if (matchCterm) {
                str = str.substr(0, str.length - matchCterm[0].length);
                if (matchCterm[1] == '}')
                    str += '}';
                ctermModifs = self.string2modifs(matchCterm[2]);
            }

            var matches = new RegExpFullSpliter().split(/([A-Z])(\{([^\}]*)\})?/, str)

            _.each(matches, function (m) {
                var raa = {
                    aa: dicoAA.get(m[1])
                };
                if (!raa.aa) {
                    throw {
                        name: 'UnknwownAminoAcid',
                        message: 'unknwon amino acid ' + m[1]
                    }
                }
                if (m[3]) {
                    raa.modifications = self.string2modifs(m[3]);
                }
                self.get('sequence').push(raa);
            })
            self.setModification(self.size(), ctermModifs);
            //self.change();
            return self;
        },
        /**
         * parse a modification string string
         * @param strMods
         * @return {Array}
         * @private
         */
        string2modifs: function (strMods) {
            var l = [];
            _.each(strMods.split(','), function (mn) {
                var mod = dicoResMod.get(mn);
                if (!mod) {
                    var mmass = parseFloat(mn);
                    if (!_.isFinite(mmass)) {
                        throw {
                            name: 'UnknwownResidueModification',
                            message: 'unknown modification [' + mod + '] in ' + mn
                        }
                    }
                    mod = new ResidueModification({
                        name: "" + mmass,
                        mass: mmass
                    })
                }
                l.push(mod)
            });
            return l;
        },

        /**
         * check equality betwee 2 rich sequence.
         * That can be not that straight forwards, because the modification order on a given amino acid is not relevant.
         * @param ors
         * @return {*}
         */
        equalsTo: function (ors) {
            var self = this;
            if ((ors == null) || (self.size() != ors.size())) {
                return false;
            }
            return _.all(self.get('sequence'), function (raa, i) {
                oraa = ors.get('sequence')[i];
                //                    console.log(raa.aa.code1, oraa.aa.code)
                //                    console.log(_.pluck(raa.modifications, 'name').sort().join(
                //                                    ''), _.pluck(oraa.modifications, 'name')
                //                                    .sort().join(''));
                return (raa.aa.get('code1') == oraa.aa.get('code1')) && (_.collect(raa.modifications, function (m) {
                    return m.get('name')
                }).sort().join('') == _.collect(oraa.modifications, function (m) {
                    return m.get('name')
                }).sort().join(''));
            });
        },

        /**
         * @return just the amino acid list as a string
         */
        toAAString: function () {
            return _.collect(this.get('sequence'), function (raa) {
                return raa.aa.get('code1');
            }).join('');
        },

        /**
         * full string, compatible with the fromString/constructor syntax
         * see RichSequence-tests.js for examples
         * @return a string
         */
        toString: function () {
            var self = this;

            var modif2string = function (modifs) {
                if (!modifs || modifs.length == 0) {
                    return '';
                }
                return '{' + _.collect(modifs, function (m) {
                    return m.get('name')
                }).sort().join(',') + '}'
            }
            var s = modif2string(self.get('nTermModifications'));
            var size = self.size();
            for (i = 0; i < size; i++) {
                s += self.get('sequence')[i].aa.get('code1');
                s += modif2string(self.get('sequence')[i].modifications);
            }

            if (self.countModificationsAt(size) > 0) {
                if (self.countModificationsAt(size - 1) == 0) {
                    s += '-'
                }
                ;
                s += modif2string(self.get('cTermModifications'));
            }
            ;

            return s;
        },
        /**
         *
         * @return a sequence length
         */
        size: function () {
            return this.get('sequence').length;
        }
    });

    return RichSequence;
});
