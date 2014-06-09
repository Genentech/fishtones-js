define(['underscore', 'fishtones/services/dry/MassBuilder', 'fishtones/models/dry/RichSequence', 'fishtones/services/dry/RichSequenceShortcuter'], function(_, mb, RichSequence, RichSequenceShortcuter) {

    var t_match2array = function(m) {
        var a = [];
        for ( i = 0; i < m.length; i++) {
            a.push(m[i])
        }
        return a
    }
    return describe("RichSequenceShortcuter", function() {
        var rss = new RichSequenceShortcuter();

        it('constructor', function() {
            expect( rss instanceof RichSequenceShortcuter).toBe(true);
            expect(_.size(rss.get('modif2short'))).toBeGreaterThan(5);
            expect(rss.get('short2modif')).not.toBeNull();
            expect(rss.get('short2modif')).not.toBeUndefined();
            expect(_.size(rss.get('short2modif'))).toBeGreaterThan(4);
        });

        var _peptides;

        it('peptide setup is OK', function() {
            expect(_.keys(peptides()).length).toEqual(9);
        });

        it("new instance", function() {
            expect( rss instanceof RichSequenceShortcuter).toBe(true);
        });

        describe("richSeqToString  with reduced modif names", function() {
            _.each(peptides(), function(p, name) {
                var richSeq = new RichSequence().fromString(p.pept)
                it(name, function() {
                    expect(rss.richSeqToString(richSeq)).toEqual(p.str)
                })
            })
        });

        describe("Short name to modif", function() {
            it('Me -> Methyl', function() {
                expect(rss.short2modif('Me')).not.toBe(null)
                expect(rss.short2modif('Me').get('name')).toEqual('Methyl')
            });
            it('Me1 -> Methyl', function() {
                expect(rss.short2modif('Me1')).not.toBe(null)
                expect(rss.short2modif('Me1').get('name')).toEqual('Methyl')
            });
        });
        describe("unexisting Short should throw", function() {
            it('Jkl', function() {
                var f = function() {
                    rss.short2modif('Jkl')
                }
                expect(f).toThrow();
            });
        });
        describe("regular expression for reversing sequence", function() {

            var re = rss.get('reReverse');
            describe('single AA', function() {
                it("single AA's", function() {
                    re.lastIndex = 0;
                    expect('A').toMatch(re)
                    re.lastIndex = 0;
                    expect('a').not.toMatch(re)
                });

            });
            describe('single AA + modif validation', function() {
                it("AA+ modif", function() {
                    _.each(['AMe2', 'AMe2Ac', 'K+', 'K+Ac'], function(s) {
                        re.lastIndex = 0;
                        expect(s).toMatch(re)
                    })
                    _.each(['a', 'aaa'], function(s) {
                        re.lastIndex = 0;
                        expect(s).not.toMatch(re)
                    });
                });
            });

            describe('modification string splitter', function() {
                var modstr2modList = {
                    'Me2' : ['Me2'],
                    'KPrPrMe2Ac' : ['Pr', 'Pr', 'Me2', 'Ac']
                }

                for (k in modstr2modList) {( function(str, expected) {
                            it('spliting modif string ' + str, function() {
                                var listModif = str.match(rss.get('reRevSplitModif'))
                                expect(t_match2array(listModif)).toEqual(expected);
                            });
                        }(k, modstr2modList[k]))
                }
            });

            describe('single AA + modif shortcut extraction ', function() {

                var s2a = {
                    KMe2 : {
                        agroup : ['KMe2', 'K', 'Me2'],
                        amodif : ['Me2']
                    },
                    KMe2Ac : {
                        agroup : ['KMe2Ac', 'K', 'Me2Ac'],
                        amodif : ['Me2', 'Ac']
                    },
                    'KPrPrMe2Ac' : {
                        agroup : ['KPrPrMe2Ac', 'K', 'PrPrMe2Ac'],
                        amodif : ['Pr', 'Pr', 'Me2', 'Ac']
                    }
                };
                for (s in s2a) {( function(str, expected) {
                            it('reversing ' + str, function() {
                                re.lastIndex = 0
                                expect(t_match2array(re.exec(str, 0))).toEqual(expected.agroup)

                            });
                        }(s, s2a[s]));
                }
            });
        });

        describe("extract implicit modif labels", function() {

            var check = function(str, expPept, expLabels) {
                var r = rss.string2peptideAndLabels(str);
                it(str + '-> ' + expPept + '[' + expLabels + ']', function() {
                    expect(r[0]).toEqual(expPept)
                    if (expLabels == '') {
                        expect(r[1]).toEqual([])
                    } else {
                        expect(r[1]).toEqual(expLabels.split(',').sort())
                    }
                });
            }
            check('K9Ac', 'K9Ac', '')
            check('KC{Propionyl}C', 'KC{Propionyl}C', '')
            check('K9Ac [prop_d0]', 'K9Ac', 'prop_d0')
            check('K9Ac [silac,prop_d0]', 'K9Ac', 'prop_d0,silac')

        });

        describe("richSeqFromString with reduced modif names", function() {
            _.each(peptides(), function(p, name) {
                var rsExpect = new RichSequence().fromString(p.pept)
                var rs = rss.richSeqFromString(p.str)

                it("recovering " + p.str, function() {
                    expect(rs.toString()).toEqual(rsExpect.toString())
                });
            });
        });

        describe("richSeqFromString, should throw:", function() {
            var check = function(comment, str) {
                var goCassePipe = function() {
                    rss.richSeqFromString(str);
                }
                it(comment + ' "' + str + '"', function() {
                    expect(goCassePipe).toThrow()
                });
            }
            check('ptr', 'H3K4')
            check('start with modif', 'AcTK')
        });

        describe("aaSequencePeptide: H3 full peptide", function() {
            var check = function(ptr, expected) {
                it(ptr + ' -> ' + expected, function() {
                    expect(rss.richSeqFromSequencePtr(ptr).toString()).toEqual(expected)

                });

            }
            check('H3K4', 'TKQTAR');
            check('H3K4 [prop_d0]', '{Propionyl}TK{Propionyl}QTAR');
            check('H3K4Ub', 'TK{GlyGly}QTAR');
            check('H3K4Me', 'TK{Methyl}QTAR');
            check('H3K4Me1', 'TK{Methyl}QTAR');
            check('H3K4MeAc', 'TK{Acetyl,Methyl}QTAR');
            check('H3.1K14Ac', 'KSTGGK{Acetyl}APR');
            check('H3.1K9MeK14Ac', 'K{Methyl}STGGK{Acetyl}APR');
        });

        describe("aaSequencePeptide: H3K27 non ambivalent", function() {
            var check = function(ptr, expected) {
                it(ptr + ' -> ' + expected, function() {
                    expect(rss.richSeqFromSequencePtr(ptr).toString()).toEqual(expected)

                });
            }
            check('H3.2K27', 'KSAPATGGVKKPHR');
            check('H3.1TK27', 'KSAPATGGVKKPHR');
            check('H3.1K27', 'KSAPATGGVKKPHR');
            check('H3.3K27', 'KSAPSTGGVKKPHR');

        });

        describe("aaSequencePeptide: H3 throw exceptions", function() {
            var check = function(ptr, comment) {
                it(comment + ':' + ptr, function() {
                    var f = function() {
                        rss.richSeqFromSequencePtr(ptr)
                    };
                    expect(f).toThrow();
                });
            }
            check('H3K27', 'ambivalent')
        });

        describe('extends and propionylate peptide', function() {
            var cases = {

                'H3K4 [prop_d0]' : '{Propionyl}TK{Propionyl}QTAR',
                'H3K4 [prop_d5_nterm]' : '{Propionyl:2H(5)}TK{Propionyl}QTAR',
                'H3K4Me [prop_d0]' : '{Propionyl}TK{Methyl,Propionyl}QTAR',
                'H3K4Me [prop_d5_nterm]' : '{Propionyl:2H(5)}TK{Methyl,Propionyl}QTAR',
                'H3K4Me2 [prop_d0]' : '{Propionyl}TK{Dimethyl}QTAR',
                'H3K4Me2 [prop_d5_nterm]' : '{Propionyl:2H(5)}TK{Dimethyl}QTAR',
                'H3K9MeK14Ac [prop_d0]' : '{Propionyl}K{Methyl,Propionyl}STGGK{Acetyl}APR',
                'H3K9MeK14Ac [prop_d5_nterm]' : '{Propionyl:2H(5)}K{Methyl,Propionyl}STGGK{Acetyl}APR',
                'H3K9Me2K14Me [prop_d0]' : '{Propionyl}K{Dimethyl}STGGK{Methyl,Propionyl}APR',
                'H3K9Me2K14Me [prop_d5_nterm]' : '{Propionyl:2H(5)}K{Dimethyl}STGGK{Methyl,Propionyl}APR',
                'H3.1K27 [prop_d0]' : '{Propionyl}K{Propionyl}SAPATGGVK{Propionyl}K{Propionyl}PHR',
                'H3.1TK27 [prop_d0]' : '{Propionyl}K{Propionyl}SAPATGGVK{Propionyl}K{Propionyl}PHR'
            }
            for (n in cases) {( function(orig, expected) {
                        it(orig + ' -> ' + expected, function() {
                            var p = rss.richSeqFromSequencePtr(orig);
                            expect(p.toString()).toEqual(expected);
                        });

                    }(n, cases[n]))
            }
        });

        describe('minimalize H3 peptide String', function() {
            var cases = {
                '{Propionyl}TK{Propionyl}QTAR' : 'H3K4 [prop_d0]',
                'TK{Propionyl}QTAR' : 'H3K4Prop',
                '{Propionyl}TK{Acetyl}QTAR' : 'H3K4Ac [prop_d0]',
                '{Propionyl}TK{Propionyl,Methyl}QTAR' : 'H3K4Me [prop_d0]',
                '{Propionyl:2H(5)}TK{Propionyl,Methyl}QTAR' : 'H3K4Me [prop_d5_nterm]',
                '{PIC}TK{Propionyl,Methyl}QTAR' : 'H3K4Me [pic,prop_d0]',
                '{Propionyl}K{Methyl,Propionyl}STGGK{Acetyl}APR' : 'H3K9MeK14Ac [prop_d0]',
                '{Propionyl:2H(5)}K{Methyl,Propionyl}STGGK{Acetyl}APR' : 'H3K9MeK14Ac [prop_d5_nterm]',
                '{PIC}K{Methyl,Propionyl}STGGK{Acetyl}APR' : 'H3K9MeK14Ac [pic,prop_d0]',
                '{Propionyl}K{Dimethyl}STGGK{Methyl,Propionyl}APR' : 'H3K9Me2K14Me [prop_d0]',
                '{Propionyl:2H(5)}K{Dimethyl}STGGK{Methyl,Propionyl}APR' : 'H3K9Me2K14Me [prop_d5_nterm]',
                '{PIC}K{Dimethyl}STGGK{Methyl,Propionyl}APR' : 'H3K9Me2K14Me [pic,prop_d0]',
                'K{Dimethyl}STGGK{Methyl,Propionyl}APR' : 'H3K9Me2K14MeProp',
                'K{Label:13C(6)15N(2)}SAPSTGGVK{Label:13C(6)15N(2)}K{Label:13C(6)15N(2)}PHR{Label:13C(6)15N(4)}' : 'H3.3K27 [silac]',
                'K{Label:13C(6)15N(2)}SAPSTGGVK{Label:13C(6)15N(2)}K{Label:13C(6)15N(2)}PHR' : 'H3.3K27 [super_silac]',
                '{Propionyl}K{Acetyl,Label:13C(6)15N(2)}SAPSTGGVK{Label:13C(6)15N(2),Propionyl}K{Label:13C(6)15N(2),Propionyl}PHR' : 'H3.3K27Ac [prop_d0,super_silac]'
            }
            for (n in cases) {( function(rsStr, expected) {
                        it(rsStr + ' -> ' + expected, function() {
                            var rs = new RichSequence().fromString(rsStr);
                            var s = rss.richSeqToSequencePtr(rs);
                            expect(s).toEqual(expected);
                        });

                    }(n, cases[n]))
            }
        });
        describe("richSeqFrom(*) either sequence ptr shortcut or explicit string, no propionylation", function() {
            var check = function(ptr, expected) {
                var rs = new RichSequence();
                var rscid = rs.cid;
                it(ptr + ' -> ' + expected, function() {
                    expect(rss.richSeqFrom(ptr).toString()).toEqual(expected)

                });
                it('richSeqReadFrom: ' + ptr + ' -> ' + expected + ' | replace same object (no new)', function() {
                    rss.richSeqReadFrom(rs, ptr);
                    expect(rs.cid).toBe(rscid);
                    expect(rs.toString()).toEqual(expected)
                });

            }
            check('H3K4', 'TKQTAR');
            check('H3.1K14Ac', 'KSTGGK{Acetyl}APR');
            check('H3.1K14Ub', 'KSTGGK{GlyGly}APR');
            check('KSTGGK{Acetyl}APR', 'KSTGGK{Acetyl}APR');
            check('KSTGGK{Methyl}APR', 'KSTGGK{Methyl}APR');
            check('KSTGGKUbAPR', 'KSTGGK{GlyGly}APR');
            check('KSTGGKMeAPR', 'KSTGGK{Methyl}APR');
            check('KSTGGKMe1APR', 'KSTGGK{Methyl}APR');
            check('KSTGGK{123.45}APR', 'KSTGGK{123.45}APR');
            check('TKQTAR', 'TKQTAR');
            check('KSTGGKAcAPR', 'KSTGGK{Acetyl}APR');
            check('{Propionyl:2H(5)}K{Propionyl}STGGK{Propionyl}APR', '{Propionyl:2H(5)}K{Propionyl}STGGK{Propionyl}APR');
            check('K.ACDEFHR.N', 'ACDEFHR');

        });
        describe("richSeqFrom(*) either sequence ptr or explicit string, with propionylation", function() {
            var check = function(ptr, expected) {
                it(ptr + ' -> ' + expected, function() {
                    expect(rss.richSeqFrom(ptr).toString()).toEqual(expected)

                });

            }
            check('H3K4 [prop_d0]', '{Propionyl}TK{Propionyl}QTAR');
            check('H3K4 [prop_d5_nterm]', '{Propionyl:2H(5)}TK{Propionyl}QTAR');
            check('H3K4 [pic,prop_d0]', '{PIC}TK{Propionyl}QTAR');
            check('H3K4 [prop_d5]', '{Propionyl:2H(5)}TK{Propionyl:2H(5)}QTAR');
            check('KSTGGKAPR [prop_d5_nterm]', '{Propionyl:2H(5)}K{Propionyl}STGGK{Propionyl}APR');
            check('KSTG{Phospho}GKAPR [prop_d5_nterm]', '{Propionyl:2H(5)}K{Propionyl}STG{Phospho}GK{Propionyl}APR');
            check('KSTGGKA{111}PR [prop_d5_nterm]', '{Propionyl:2H(5)}K{Propionyl}STGGK{Propionyl}A{111}PR');
        });

        describe("richSeqFrom(*) should throw:", function() {
            var check = function(comment, str) {
                var goCassePipe = function() {
                    rss.richSeqFrom(str);
                }
                it(comment + ' "' + str + '"', function() {
                    expect(goCassePipe).toThrow()
                });
            }
            check('incomplete', 'H3K')
            check('unclosed parenthesis', 'TK{Acety')
        })
        function peptides(key) {
            if (_peptides == undefined) {
                _peptides = {
                    K9_light : {
                        str : 'KSTGGKAPR [prop_d0]',
                        pept : '{Propionyl}K{Propionyl}STGGK{Propionyl}APR'
                    },
                    K9_heavy : {
                        str : 'KSTGGKAPR [prop_d5_nterm]',
                        pept : '{Propionyl:2H(5)}K{Propionyl}STGGK{Propionyl}APR'
                    },
                    K9Me_light : {
                        str : 'KMeSTGGKAPR [prop_d0]',
                        pept : '{Propionyl}K{Propionyl,Methyl}STGGK{Propionyl}APR'
                    },
                    K9Me_heavy : {
                        str : 'KMeSTGGKAPR [prop_d5_nterm]',
                        pept : '{Propionyl:2H(5)}K{Propionyl,Methyl}STGGK{Propionyl}APR'
                    },
                    K9Me_heavy_full : {
                        str : 'KMeSTGGKAPR [prop_d5]',
                        pept : '{Propionyl:2H(5)}K{Propionyl:2H(5),Methyl}STGGK{Propionyl:2H(5)}APR'
                    },
                    K9Me2_light : {
                        str : 'KMe2STGGKAPR [prop_d0]',
                        pept : '{Propionyl}K{Dimethyl}STGGK{Propionyl}APR'
                    },
                    K9MeAc : {
                        str : 'KAcMeSTGGKAPR [prop_d0]',
                        pept : '{Propionyl}K{Methyl,Acetyl}STGGK{Propionyl}APR'
                    },
                    K9Me1Ac : {
                        str : 'KAcMeSTGGKAPR [prop_d0]',
                        pept : '{Propionyl}K{Methyl,Acetyl}STGGK{Propionyl}APR'
                    },
                    K9Me2K14Me3 : {
                        str : 'KMe2STGGKMe3APR [prop_d0]',
                        pept : '{Propionyl}K{Dimethyl}STGGK{Trimethyl}APR'
                    }
                }
            }
            if (key === undefined) {
                return _peptides
            }
            return _peptides[key]

        }

    });
});
