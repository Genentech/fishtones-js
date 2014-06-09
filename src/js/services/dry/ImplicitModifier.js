/**
 * an ImplicitModifier is to be linked to labelling or to a global attribution of modification.
 * It easier to say a peptide is Silac either than adding Silac mass shift oin every K & R.
 * This can be even lighter with 13C15N label, where every amino acid is modified with a mass shift (represented as a residue modification).
 * Multiple labels can be applied on the same sequence (there is a defined list of precedence)
 *
 * ImplicitModifier has to know the odds of each labeling method. For example, K can still be propionylated if it has a Methyl, but not a Dimethyl.
 *
 * The main method are
 * label(labName, richSeq): add all the label modification to a given peptide
 * unlabel(labNam, richSequence): remove the modification tighten to this label (if there were enough to label the sequence).
 * getLabel(richSeq): get the label fitting the given richSequence
 *
 * There is a vast set of test available in the ImplicitModifier-tests.js
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define(['jquery', 'underscore', 'Backbone', 'fishtones/models/dry/RichSequence', 'fishtones/collections/dry/ResidueModificationDictionary'], function ($, _, Backbone, RichSequence, dicoResMod) {

    /**
     * labelers are the essence of the implicit labelling
     * they are functions, defined for each prop, prop_d10, silac or whatever, that take a richSequenece and a position and return a modification (or undefined) that should occur there.
     * We need all that because for example for propionylation, we must know if there is alreadn a mono- or a di-methylation on the site...
     *
     * propionylLabeler is just an private function to label K + nterm with propionyl d0 or d5
     */

    var aquaModifs = {};
    _.each('VDLITGFAY'.split(''), function(aa){
    	aquaModifs[aa] =  dicoResMod.get('AQUA_'+aa)
    });
    _.each(aquaModifs, function(mod, aa) {
        dicoResMod.add({
            name : 'de_' + mod.get('name'),
            fullName : 'de_' + mod.get('fullName'),
            mass : -mod.get('mass')
        });
    })
    var propionylLabeler = function(pmod) {
        return function(richSeq, pos) {
            if (pos == -1) {
                if (richSeq.countModificationsAt(-1) > 0) {
                    var mods = richSeq.modifAt(-1);
                    if (mods.length == 1 && mods[0] == pmod) {
                        return pmod;
                    } else {
                        return undefined
                    }
                }
                return pmod;
                //(richSeq.countModificationsAt(-1) > 0) ? undefined : pmod
            }
            if (pos == richSeq.size()) {
                return undefined
            }

            if (richSeq.aaAt(pos).get('code1') === 'K') {
                if (_.any(richSeq.modifAt(pos), function(rm) {
                    return !/(Methyl|Propionyl.*)/.test(rm.get('name'));
                })) {
                } else {
                    return pmod;
                };
            };
            return undefined;
        }
    };

    var labelers = {
        none : function() {
            return undefined;
        },
        prop_d0 : propionylLabeler(dicoResMod.get('Propionyl')),
        prop_d5 : propionylLabeler(dicoResMod.get('Propionyl:2H(5)')),
        '13C15N' : function(richSeq, pos) {
            if (pos == -1 || pos == richSeq.size()) {
                return undefined
            }

            var aa = richSeq.aaAt(pos).get('code1');
            return dicoResMod.get('13C15N-' + aa);
        },
        'aqua' : function(richSeq, pos) {
            if (pos == -1 || pos == richSeq.size()) {
                return undefined;
            }
            return aquaModifs[richSeq.aaAt(pos).get('code1')];
        },
        'de_aqua' : function(richSeq, pos) {
            if (pos == -1 || pos == richSeq.size()) {
                return undefined;
            }

            var am = _.filter(richSeq.modifAt(pos), function(rm){
                return rm.get('name').indexOf('AQUA_') === 0;
                
            })[0];
            if(am === undefined ){
                return undefined;
            }
            return dicoResMod.get('de_'+am.get('name'));
        },
        silac : function(richSeq, pos) {
            if (pos == -1 || pos == richSeq.size()) {
                return undefined
            }

            var aa = richSeq.aaAt(pos).get('code1');

            if (aa === 'K') {
                return dicoResMod.get('Label:13C(6)15N(2)');
            }
            if (aa === 'R') {
                return dicoResMod.get('Label:13C(6)15N(4)');
            }
            return undefined;
            undefined
        },
        'super_silac' : function(richSeq, pos) {
            if (pos == -1 || pos == richSeq.size()) {
                return undefined;
            }

            var aa = richSeq.aaAt(pos).get('code1');

            if (aa === 'K') {
                return dicoResMod.get('Label:13C(6)15N(2)')
            }

            return undefined;
        }
    };
    labelers.prop_d5_nterm = function(richSeq, pos) {
        if (pos == -1) {
            return dicoResMod.get('Propionyl:2H(5)');
        }
        return labelers.prop_d0(richSeq, pos);
    };
    labelers.pic = function(richSeq, pos) {
        if (pos != -1) {
            return undefined
        }
        return dicoResMod.get('PIC');
        //return (richSeq.countModificationsAt(-1) > 0) ? undefined : dicoResMod.get('PIC');
    };
    labelers.pic_heavy = function(richSeq, pos) {
        if (pos != -1) {
            return undefined
        }
        return dicoResMod.get('PIC_HEAVY');
        //return (richSeq.countModificationsAt(-1) > 0) ? undefined : dicoResMod.get('PIC');
    };
    var labelersOrder = {
        '13C15N' : 3,
        'aqua' : 4,
        'de_aqua' : 4,
        prop_d0 : 10,
        prop_d5 : 9,
        prop_d5_nterm : 15,
        pic : 5,
        pic_heavy : 5,
        silac : 100,
        super_silac : 90,
        none : 1000
    }

    ImplicitModifier = function() {
        var self = this;
        self.labelers = labelers;
        self.labelersOrder = labelersOrder;

        return self
    };

    /**
     * Add all modification associated to the label on the richSequence object
     * @param {Object} labelNames a comma separated list of labels, or an array of string (we can have 'silac,prop_d0', or 'prop_d5')
     * @param {Object} richSequence
     */
    ImplicitModifier.prototype.label = function(labelNames, richSequence) {
        var self = this;
        var s = richSequence.size();
        if (! _.isArray(labelNames)) {
            labelNames = labelNames.split(',')
        }
        _.each(_.sortBy(labelNames, function(lname) {
            return self.labelersOrder[lname] || 100000;
        }), function(lname) {
            for (var i = -1; i <= s; i++) {
                var m = self.labelers[lname](richSequence, i);
                if (m !== undefined) {
                    richSequence.addModification(i, m);
                }
            }
        })
    }
    /**
     * just returns a sorted (alphanumeric) list of the available labels
     */
    ImplicitModifier.prototype.availableLabels = function() {
        return _.keys(this.labelers).sort();
    }
    /**
     * Remove all modification associated to the label on the richSequence object.
     * At this stage, we assume the richSequence has the modif associated with the label
     * @param {Object} labelNames a comma separated list of labels (we can have 'silac,prop_d0', or 'prop_d10')
     * @param {Object} rishSequence
     */
    ImplicitModifier.prototype.unlabel = function(labelNames, richSequence) {
        var self = this;

        var s = richSequence.size();
        if (! _.isArray(labelNames)) {
            labelNames = labelNames.split(',')
        }
        _.each(_.sortBy(labelNames, function(lname) {
            return -(self.labelersOrder[lname] || 100000);
        }), function(lname) {
            for ( i = -1; i <= s; i++) {
                var modifs = richSequence.getModificationArray(i);
                if (!modifs) {
                    continue;
                }
                modifs = _.difference(modifs, self.labelers[lname](richSequence, i));
                richSequence.setModificationArray(i, modifs)

            }
        });
    }
    /**
     * returns an array with the modified poisitions, once labeing modif have been removed
     * (-1 => nterm)
     */
    ImplicitModifier.prototype.nonimplicitModifiedPos = function(richSequence) {
        var self = this;
        var rs = richSequence.clone();
        self.getLabelsAndClean(rs);
        return _.filter(_.range(-1, rs.size()), function(i) {
            return rs.countModificationsAt(i) > 0;
        })
    }
    /**
     * return true/false if the RichSequence is filled with the modification corresponding to the given label.
     * i.e. we can remove all the modif and consider the RichSequence as implicitely modified
     * @param {Object} labelName one label name
     * @param {Object} rishSequence
     */
    ImplicitModifier.prototype.isLabeled = function(labelName, richSequence) {
        var self = this;

        var atLeastOne = false
        return _.all(_.range(-1, richSequence.size() + 1), function(i) {
            var expectedModif = self.labelers[labelName](richSequence, i);
            if (expectedModif === undefined) {
                return true
            }

            if (richSequence.countModificationsAt(i) == 0) {
                return false;
            }

            atLeastOne = true;

            return _.any(richSequence.getModificationArray(i), function(m) {
                return m == expectedModif;
            });

        }) && atLeastOne;

    }
    /**
     * clean up the implicit modifications  and return a list of (sorted alpha) label names that were used for cleanup
     * @param {Object} richSequence
     */
    ImplicitModifier.prototype.getLabelsAndClean = function(richSequence) {
        var self = this;

        var labels = [];
        _.each(_.sortBy(_.keys(self.labelersOrder), function(lname) {
            return -(self.labelersOrder[lname] || 100000);
        }), function(lname) {
            if (!self.isLabeled(lname, richSequence)) {
                return
            }
            self.unlabel(lname, richSequence);
            labels.push(lname)
        });
        return labels.sort()
    }
    return new ImplicitModifier();
});
