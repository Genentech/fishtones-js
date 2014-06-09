/*
 * Builds and unbuilds peptide sequence atlas composing
 * ImplicitModifier for labels
 * AASequencePeptidePtr to point a tryptic peptide to an unambiguous protein sequence an position
 * transform common modidifications into a shortcut ACD{Phospho}EF{Dimethyl}G -> ACDPoEFMe2G
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define(['jquery', 'underscore', 'Backbone', 'fishtones/models/dry/RichSequence', 'fishtones/models/dry/AASequencePeptidePtr', 'fishtones/collections/dry/AminoAcidDictionary', 'fishtones/collections/dry/ResidueModificationDictionary', 'fishtones/services/dry/ImplicitModifier'], function($, _, Backbone, RichSequence, AASequencePeptidePtr, dicoAA, dicoResMod, implicitModifier) {

    var RichSequenceShortcuter = Backbone.Model.extend({
        defaults : {
            modif2short : {
                // 'Label:13C(6)15N(2)':'Silack',
                // 'Label:13C(6)15N(4)':'Silacr',
                Propionyl : "Prop",
                'Propionyl:2H(5)' : 'Propd5',
                Methyl : ['Me', 'Me1'],
                Dimethyl : 'Me2',
                Trimethyl : 'Me3',
                Acetyl : 'Ac',
                Phospho : 'Po',
                GlyGly : 'Ub'
            },
            reReverse : /([A-Z])((?:[A-Z][a-z0-9]+)*)/g,
            reRevSplitModif : /(?:[A-Z][a-z0-9]+)/g

        },
        initialize : function(options) {
            var self = this;
            options = options || {cleavageEnzyme: 'arg-c'};
            self.set('aaSequencePeptidePtr', new AASequencePeptidePtr());
            self.get('aaSequencePeptidePtr').set('cleavageEnzyme', options.cleavageEnzyme);
        },
        set : function(attrs, options) {
            var self = this;
            if (attrs.modif2short) {
                self.p_init_short2modif(attrs.modif2short);
            }
            return Backbone.Model.prototype.set.call(this, attrs, options);
        },

        // this.short2modif = null;
        // this.p_init_short2modif = p_init_short2modif;
        short2modif : function(modifShorctut) {
            var rm = this.get('short2modif')[modifShorctut];
            if (!rm) {
                console.error('UnknownShortModifName', modifShorctut, this.get('short2modif'))
                throw {
                    name : 'UnknownShortModifName',
                    message : modifShorctut
                }
            }
            return rm;
        },
        /**
         * from one odif, return the short form of it.
         * The only trick is that one modif can have several short forms (Methyl -> Me and Me1)
         * and we pick the first in the list
         */
        modif2short : function(resmod) {
            var self = this;
            var short = self.get('modif2short')[resmod.get('name')];
            if (!short) {
                return resmod.get('name');
            }
            return ( short instanceof Array) ? short[0] : short;
        },

        /*
         * construct a map from short name to modif object. In case 2 shortcut point
         * to the same modif, we take the one with the shortest name
         */
        p_init_short2modif : function(newVal) {
            var self = this;
            var tmp_short2modif = {};
            var tmp_modif2short = newVal || self.get('modif2short');
            for (mod in tmp_modif2short) {
                var vals = tmp_modif2short[mod]
                var lshorts = ( vals instanceof Array) ? vals : [vals];
                _.each(lshorts, function(short) {
                    if (tmp_short2modif[short] && tmp_short2modif[short].get('name').length < mod.length) {
                        return;
                    }
                    tmp_short2modif[short] = dicoResMod.get(mod);
                })
            }
            self.set('short2modif', tmp_short2modif);
            return self;
        },

        /**
         * extract label at the end betewwen curly bracket if any
         * return an array with two element
         * [0]: peptide string without any treatment
         * [1]: an array, maybe empty with the labels in an alphanumerical order
         */
        string2peptideAndLabels : function(str) {
            var re = /(.+)\[(.*)\]\s*$/;
            var m = re.exec(str);
            if (!m) {
                return [str.trim(), []]
            }
            return [m[1].trim(), m[2].trim().split(',').sort()]

        },

        /**
         * from a minified string, build a full RichSequence pbject
         */
        richSeqFromString : function(str) {
            var self = this;

            var t = self.string2peptideAndLabels(str)
            str = t[0]
            var modifLabels = t[1];

            var rs;
            try {
                rs = new RichSequence().fromString(str)
            } catch(e) {
                var tmp_seq = []
                var tmp_reRevSplitModif = self.get('reRevSplitModif');
                var matches = new RegExpFullSpliter().split(self.get('reReverse'), str.trim())

                _.each(matches, function(m) {
                    var raa = {
                        aa : dicoAA.get(m[1])
                    };
                    var modifStr = m[2];
                    if (modifStr) {
                        raa.modifications = [];
                        _.each(modifStr.match(tmp_reRevSplitModif), function(m) {
                            raa.modifications.push(self.short2modif(m) || dicoResMod.get(m))
                        });
                    }
                    tmp_seq.push(raa);
                });

                rs = new RichSequence({
                    sequence : tmp_seq
                });
            }
            implicitModifier.label(modifLabels, rs)
            return rs;

        },

        /**
         * The inverse of richSeqFromString
         */
        richSeqToString : function(richSeq) {
            var self = this;
            var s = '';

            richSeq = richSeq.clone()
            var labels = implicitModifier.getLabelsAndClean(richSeq)

            var tmp_seq = richSeq.get('sequence');
            var tmp_modif2short = self.get('modif2short');

            for ( i = 0; i < tmp_seq.length; i++) {
                s += tmp_seq[i].aa.get('code1');
                if (tmp_seq[i].modifications) {

                    s += _.collect(tmp_seq[i].modifications, function(m) {
                        var mname = self.modif2short(m);
                        if (mname == m.get('name')) {
                            return ('{' + mname + '}')
                        } else {
                            return mname
                        }
                        //return (tmp_modif2short[m.get('name')] != undefined) ? tmp_modif2short[m.get('name')] : ('{' + m.name + '}')
                    }).join('');
                }
            }
            if (labels.length > 0) {
                s += ' [' + labels.join(',') + ']';
            }
            return s;
        },
        /**
         * 'H3.1K9Me', 'H3K4', 'H3.CK9MeAc', 'H3K9MeK14AC',  'H3.CK9MeAc [prop_d10]', return the modified full RichSeq
         *
         */
        richSeqFromSequencePtr : function(ptr) {
            var self = this;

            var t = self.string2peptideAndLabels(ptr)
            ptr = t[0]
            var modifLabels = t[1];

            var pept = self.get('aaSequencePeptidePtr').ptr2peptide(ptr);

            if (pept == null) {
                return null;
            }
            var aa = pept.sequence.split('');
            var re = /([A-Z])(\d+)((?:[A-Z][a-z][a-z0-9]*)*)/g;

            while ( m = re.exec(ptr)) {
                var i = parseInt(m[2]) - pept.offset
                aa[i] += m[3]
            }
            var seqpp = aa.join('')

            var richSeq = self.richSeqFromString(seqpp)
            implicitModifier.label(modifLabels, richSeq)
            return richSeq;

        },

        /**
         * Well, that's the reverse of richSeqFromSequencePtr.
         * from a rich sequence, we try to find the shortest possible ptr
         *
         * @param {Object} richSeq
         */
        richSeqToSequencePtr : function(richSeqOrig) {
            var self = this;

            var richSeq = richSeqOrig.clone()
            var labels = implicitModifier.getLabelsAndClean(richSeq)
            if (labels.length > 0) {
                labels = ' [' + labels.join(',') + ']';
            } else {
                labels = ''
            }

            var aaseq = _.collect(richSeq.get('sequence'), function(raa) {
                return raa.aa.get('code1');
            }).join('');

            var regSeqList = self.get('aaSequencePeptidePtr').get('peptideIndex')[aaseq];

            if (!regSeqList) {
                return self.richSeqToString(richSeq);
            }

            var seqPtr = self.get('aaSequencePeptidePtr').concatenateNames(_.collect(regSeqList, function(pp) {
                return pp.aaSeq.get('name')
            }));

            //caputre the starting position. must the same for all peptides
            var offset = _.chain(regSeqList).collect(function(pp) {
                return pp.offset
            }).uniq().value();
            if (offset.length > 1) {
                //we have different sizes
                return self.richSeqToString(richSeq);
            }
            offset = offset[0]

            var miniStr = '';
            _.each(richSeq.get('sequence'), function(raa, i) {
                var mods = _.chain(raa.modifications).collect(function(m) {
                    return self.modif2short(m);
                }).value().join('');
                if (mods !== '') {
                    miniStr += raa.aa.get('code1') + (i + offset) + mods
                }
            });
            if (miniStr === '') {
                //find at least one lysine
                var ik = _.collect(richSeq.get('sequence'), function(raa) {
                    return raa.aa.get('code1')
                }).join('').indexOf('K');
                if (ik >= 0) {
                    miniStr = 'K' + (ik + offset)
                }
            }
            if (miniStr === '') {
                return self.richSeqToString(richSeq);
            }

            //back check that the reverse is give the same
            miniStr = seqPtr + miniStr + labels;
            var backPept = self.richSeqFromSequencePtr(miniStr, true);

            if (!backPept.equalsTo(richSeqOrig)) {
                return self.richSeqToString(richSeqOrig);
            }
            return miniStr
        },
        /**
         * Will try to build the sequence from a sequencePtr or a classic sequence
         * @param {Object} str
         * @param {RichSequence} ipRichSeq, for inplace replacement instead of creating a new one...
         */
        richSeqFrom : function(str, ipRichSeq) {
            var self = this;
            if (arguments.length == 3) {
                console.error('3 parameters, no good!!')
            }
            str = str.replace(/^\w\./, '');
            str = str.replace(/\.\w$/, '');
            try {
                return new RichSequence().fromString(str);
            } catch(exc) {
                try {
                    return self.richSeqFromSequencePtr(str)
                } catch(exc) {
                    var rs = self.richSeqFromString(str)
                    return rs
                }
            }

        },
        /**
         * Will try to build the sequence from a sequencePtr or a classic sequence
         * compared to richSeqFrom, inplace replacement of ipRichSeq, instead of reating a new one...
         * @param {RichSequence} ipRichSeq,
         * @param {Object} str
         */
        richSeqReadFrom : function(ipRichSeq, str) {
            var self = this;
            var rs = self.richSeqFrom(str);

            //ok, we can do better, bu that will fly for the moment
            ipRichSeq.fromString(rs.toString());
        }
    });

    return RichSequenceShortcuter;
});
