require(['underscore', 'fishtones/services/dry/MassBuilder', 'fishtones/models/dry/RichSequence', 'fishtones/services/dry/ImplicitModifier', 'fishtones/collections/dry/ResidueModificationDictionary'], function(_, mb, RichSequence, implicitModifier, dicoResMod) {

    describe("implicitModifier", function() {
        it('singleton instance', function() {
            expect( implicitModifier instanceof ImplicitModifier).toBe(true);
        });

        describe("implicit methods", function() {

            var err;
            try {
                throw Error('')
            } catch(e) {
                err = e
            }

            var checkImpliedModif = function(imName, comment, richSeq, pos, expected) {
                it(comment + ': ' + richSeq + '@' + pos + ' -> ' + expected, function() {
                    var modif = implicitModifier.labelers[imName](new RichSequence().fromString(richSeq), pos);

                    expect((modif === undefined) ? '' : modif.get('name')).toEqual(expected);
                })
            }
            it('availableLabels()', function() {
                expect(implicitModifier.availableLabels().length).toBe(11)
            })
            it('sort order containes them all ()', function() {
                expect(implicitModifier.availableLabels().sort()).toEqual(_.keys(implicitModifier.labelersOrder).sort());
            })
            describe("prop", function() {
                var fLabeling = implicitModifier.labelers.none;
                it("labeler exist", function() {
                    expect(fLabeling).not.toBeUndefined()
                })
                checkImpliedModif('none', 'nterm, no K', 'QKTAR', 0, '')
            })
            describe("prop", function() {
                var fLabeling = implicitModifier.labelers.prop_d0;
                it("labeler exist", function() {
                    expect(fLabeling).not.toBeUndefined()
                })
                checkImpliedModif('prop_d0', 'nterm, no K', 'QKTAR', -1, 'Propionyl')
                checkImpliedModif('prop_d0', 'nterm, no K', 'QKTAR', 0, '')
                checkImpliedModif('prop_d0', 'nterm, K', 'KTAR', -1, 'Propionyl')
                checkImpliedModif('prop_d0', 'nterm, K', 'KTAR', 0, 'Propionyl')

                checkImpliedModif('prop_d0', 'middle, no K', 'QKTAR', 2, '')
                checkImpliedModif('prop_d0', 'middle, K', 'QKTAR', 1, 'Propionyl')

                checkImpliedModif('prop_d0', 'middle, K with Methyl', 'QK{Methyl}TAR', 1, 'Propionyl')
                checkImpliedModif('prop_d0', 'middle, K with DiMethyl', 'QK{Dimethyl}TAR', 1, '')
                checkImpliedModif('prop_d0', 'middle, K with Acetyl', 'QK{Acetyl}TAR', 1, '')

                checkImpliedModif('prop_d0', 'nterm, K with Methyl', 'K{Methyl}TAR', -1, 'Propionyl')
                checkImpliedModif('prop_d0', 'nterm, K with Methyl', 'K{Methyl}TAR', 0, 'Propionyl')

                checkImpliedModif('prop_d0', 'nterm, K with DiMethyl', 'K{Dimethyl}TAR', -1, 'Propionyl')
                checkImpliedModif('prop_d0', 'nterm, K with DiMethyl', 'K{Dimethyl}TAR', 0, '')

                checkImpliedModif('prop_d0', 'nterm, K with Acetyl', 'K{Acetyl}TAR', -1, 'Propionyl')
                checkImpliedModif('prop_d0', 'nterm, K with Acetyl', 'K{Acetyl}TAR', 0, '')
            })
            describe("prop_d5_nterm", function() {
                var fLabeling = implicitModifier.labelers.prop_d5_nterm;
                it("labeler exist", function() {
                    expect(fLabeling).not.toBeUndefined()
                })
                checkImpliedModif('prop_d5_nterm', 'nterm, no K', 'QKTAR', -1, 'Propionyl:2H(5)')
                checkImpliedModif('prop_d5_nterm', 'nterm, no K', 'QKTAR', 0, '')
                checkImpliedModif('prop_d5_nterm', 'nterm, K', 'KTAR', -1, 'Propionyl:2H(5)')
                checkImpliedModif('prop_d5_nterm', 'nterm, K', 'KTAR', 0, 'Propionyl')

                checkImpliedModif('prop_d5_nterm', 'middle, no K', 'QKTAR', 2, '')
                checkImpliedModif('prop_d5_nterm', 'middle, K', 'QKTAR', 1, 'Propionyl')

                checkImpliedModif('prop_d5_nterm', 'middle, K with Methyl', 'QK{Methyl}TAR', 1, 'Propionyl')
                checkImpliedModif('prop_d5_nterm', 'middle, K with DiMethyl', 'QK{Dimethyl}TAR', 1, '')
                checkImpliedModif('prop_d5_nterm', 'middle, K with Acetyl', 'QK{Acetyl}TAR', 1, '')

                checkImpliedModif('prop_d5_nterm', 'nterm, K with Methyl', 'K{Methyl}TAR', -1, 'Propionyl:2H(5)')
                checkImpliedModif('prop_d5_nterm', 'nterm, K with Methyl', 'K{Methyl}TAR', 0, 'Propionyl')
                checkImpliedModif('prop_d5_nterm', 'nterm, K with DiMethyl', 'K{Dimethyl}TAR', -1, 'Propionyl:2H(5)')
                checkImpliedModif('prop_d5_nterm', 'nterm, K with DiMethyl', 'K{Dimethyl}TAR', 0, '')
                checkImpliedModif('prop_d5_nterm', 'nterm, K with Acetyl', 'K{Acetyl}TAR', -1, 'Propionyl:2H(5)')
                checkImpliedModif('prop_d5_nterm', 'nterm, K with Acetyl', 'K{Acetyl}TAR', 0, '')
            })
            describe("pic", function() {
                var fLabeling = implicitModifier.labelers.pic;
                it("labeler exist", function() {
                    expect(fLabeling).not.toBeUndefined()
                })
                checkImpliedModif('pic', 'nterm, no K', 'QKTAR', -1, 'PIC')
                checkImpliedModif('pic', 'nterm, no K', 'QKTAR', 0, '')
                checkImpliedModif('pic', 'nterm, K', 'KTAR', -1, 'PIC')

                checkImpliedModif('pic', 'middle, no K', 'QKTAR', 2, '')
                checkImpliedModif('pic', 'middle, K', 'QKTAR', 1, '')

                checkImpliedModif('pic', 'middle, K with Methyl', 'QK{Methyl}TAR', 1, '')
                checkImpliedModif('pic', 'middle, K with DiMethyl', 'QK{Dimethyl}TAR', 1, '')
                checkImpliedModif('pic', 'middle, K with Acetyl', 'QK{Acetyl}TAR', 1, '')

                checkImpliedModif('pic', 'nterm, K with Methyl', 'K{Methyl}TAR', -1, 'PIC')
                checkImpliedModif('pic', 'nterm, K with DiMethyl', 'K{Dimethyl}TAR', -1, 'PIC')
                checkImpliedModif('pic', 'nterm, K with Acetyl', 'K{Acetyl}TAR', -1, 'PIC')
            })
            describe("prop_d5", function() {
                var fLabeling = implicitModifier.labelers.prop_d5_nterm;
                it("labeler exist", function() {
                    expect(fLabeling).not.toBeUndefined()
                })
                checkImpliedModif('prop_d5', 'nterm, no K', 'QKTAR', -1, 'Propionyl:2H(5)')
                checkImpliedModif('prop_d5', 'nterm, no K', 'QKTAR', 0, '')
                checkImpliedModif('prop_d5', 'nterm, K', 'KTAR', -1, 'Propionyl:2H(5)')
                checkImpliedModif('prop_d5', 'nterm, K', 'KTAR', 0, 'Propionyl:2H(5)')

                checkImpliedModif('prop_d5', 'middle, no K', 'QKTAR', 2, '')
                checkImpliedModif('prop_d5', 'middle, K', 'QKTAR', 1, 'Propionyl:2H(5)')

                checkImpliedModif('prop_d5', 'middle, K with Methyl', 'QK{Methyl}TAR', 1, 'Propionyl:2H(5)')
                checkImpliedModif('prop_d5', 'middle, K with DiMethyl', 'QK{Dimethyl}TAR', 1, '')
                checkImpliedModif('prop_d5', 'middle, K with Acetyl', 'QK{Acetyl}TAR', 1, '')

                checkImpliedModif('prop_d5', 'nterm, K with Methyl', 'K{Methyl}TAR', -1, 'Propionyl:2H(5)')
                checkImpliedModif('prop_d5', 'nterm, K with Methyl', 'K{Methyl}TAR', 0, 'Propionyl:2H(5)')
                checkImpliedModif('prop_d5', 'nterm, K with DiMethyl', 'K{Dimethyl}TAR', -1, 'Propionyl:2H(5)')
                checkImpliedModif('prop_d5', 'nterm, K with DiMethyl', 'K{Dimethyl}TAR', 0, '')
            })
            describe("13C15N", function() {
                var fLabeling = implicitModifier.labelers['13C15N'];
                it("labeler exist", function() {
                    expect(fLabeling).not.toBeUndefined()
                })
                checkImpliedModif('13C15N', 'pos -1', 'QKTAR', -1, '');
                checkImpliedModif('13C15N', 'pos 0', 'QKTAR', 0, '13C15N-Q')
                checkImpliedModif('13C15N', 'pos 1', 'QKTAR', 1, '13C15N-K')
                checkImpliedModif('13C15N', 'pos 4', 'QKTAR', 4, '13C15N-R')

                checkImpliedModif('13C15N', 'K with Methyl', 'K{Methyl}TAR', 0, '13C15N-K')
            })
            describe("aqua", function() {
                var fLabeling = implicitModifier.labelers['aqua'];
                it("labeler exist", function() {
                    expect(fLabeling).not.toBeUndefined()
                })
                checkImpliedModif('aqua', 'pos -1', 'ALCDVFG', -1, '');
                checkImpliedModif('aqua', 'pos 0', 'CLCDVFG', 0, '');
                checkImpliedModif('aqua', 'pos 1', 'ALCDVFG', 1, 'AQUA_L');
                checkImpliedModif('aqua', 'pos 4', 'ALCDVFG', 4, 'AQUA_V');
                checkImpliedModif('aqua', 'pos 6', 'ALCDVFG', 6, 'AQUA_G');
                checkImpliedModif('aqua', 'pos 6 + already modif', 'ALCDVFG{Oxidation}', 6, 'AQUA_G');

            });
            describe("de_aqua", function() {
                var fLabeling = implicitModifier.labelers['de_aqua'];
                it("labeler exist", function() {
                    expect(fLabeling).not.toBeUndefined();
                })
                it('deaqua modif have been instantiated', function(){
                   expect(dicoResMod.get('de_AQUA_G')).not.toBeUndefined(); 
                });
                
                checkImpliedModif('de_aqua', 'pos -1', 'ALCDVFG', -1, '');
                checkImpliedModif('de_aqua', 'pos 0', 'ALCDVFG', 0, '');
                checkImpliedModif('de_aqua', 'pos 1', 'AL{AQUA_L}CDVFG', 1, 'de_AQUA_L');
                checkImpliedModif('de_aqua', 'pos 4', 'ALCDV{AQUA_V}FG', 4, 'de_AQUA_V');
                checkImpliedModif('de_aqua', 'pos 6', 'ALCDVFG{AQUA_G}', 6, 'de_AQUA_G');
                checkImpliedModif('de_aqua', 'pos 2, D', 'ACD{AQUA_D}E', 2, 'de_AQUA_D');
                checkImpliedModif('de_aqua', 'pos 9', 'TWSKLT{Phospho}KEKD{AQUA_D}NK', 9, 'de_AQUA_D');
                checkImpliedModif('de_aqua', 'pos 9', 'TWSKLT{Phospho}KEKL{AQUA_L}NK', 9, 'de_AQUA_L');
                checkImpliedModif('de_aqua', 'pos 1', 'TL{AQUA_L}SKLT{Phospho}KEKD{AQUA_D}NK', 1, 'de_AQUA_L');
                checkImpliedModif('de_aqua', 'pos 1', 'TL{AQUA_L}SKLT{Phospho}KEKL{AQUA_L}NK', 9, 'de_AQUA_L');
                checkImpliedModif('de_aqua', 'pos 6 + already modif', 'ALCDVFG{Oxidation,AQUA_G}', 6, 'de_AQUA_G');

            })
            describe("silac", function() {
                var fLabeling = implicitModifier.labelers.silac;
                it("labeler exist", function() {
                    expect(fLabeling).not.toBeUndefined()
                })
                checkImpliedModif('silac', 'nterm, K', 'KTAR', 0, 'Label:13C(6)15N(2)')
                checkImpliedModif('silac', 'middle, K', 'TKAR', 1, 'Label:13C(6)15N(2)')
                checkImpliedModif('silac', 'cterm, K', 'TKARK', 4, 'Label:13C(6)15N(2)')
                checkImpliedModif('silac', 'double, K', 'KKAR', 1, 'Label:13C(6)15N(2)')

                checkImpliedModif('silac', 'nterm, R', 'RTAR', 0, 'Label:13C(6)15N(4)')
                checkImpliedModif('silac', 'middle, R', 'TRAR', 1, 'Label:13C(6)15N(4)')
                checkImpliedModif('silac', 'cterm, R', 'TKAR', 3, 'Label:13C(6)15N(4)')
                checkImpliedModif('silac', 'double, R', 'RRAR', 1, 'Label:13C(6)15N(4)')
                checkImpliedModif('silac', 'A', 'RRAR', 2, '')
            })
            describe("super_silac", function() {
                var fLabeling = implicitModifier.labelers['super_silac'];
                it("labeler exist", function() {
                    expect(fLabeling).not.toBeUndefined()
                })
                checkImpliedModif('super_silac', 'nterm, K', 'KTAR', 0, 'Label:13C(6)15N(2)')
                checkImpliedModif('super_silac', 'middle, K', 'TKAR', 1, 'Label:13C(6)15N(2)')
                checkImpliedModif('super_silac', 'cterm, K', 'TKARK', 4, 'Label:13C(6)15N(2)')
                checkImpliedModif('super_silac', 'double, K', 'KKAR', 1, 'Label:13C(6)15N(2)')

                checkImpliedModif('super_silac', 'nterm, R', 'RTAR', 0, '')
            })
        });
        describe("label peptide", function() {
            var checkLabel = function(imNames, comment, inRichSeq, expected) {
                it(imNames + ': ' + comment + ': ' + inRichSeq + ' -> ' + expected, function() {
                    var rs = new RichSequence().fromString(inRichSeq)
                    implicitModifier.label(imNames, rs);
                    expect(rs.toString()).toEqual(expected)
                    //idem with array
                    rs = new RichSequence().fromString(inRichSeq)
                    implicitModifier.label(imNames.split(','), rs);
                    expect(rs.toString()).toEqual(expected)
                })
            }
            checkLabel('prop_d0', 'simple', 'QKTAR', '{Propionyl}QK{Propionyl}TAR');
            checkLabel('prop_d5_nterm', 'simple', 'QKTAR', '{Propionyl:2H(5)}QK{Propionyl}TAR');
            checkLabel('pic,prop_d0', 'simple K nterm', 'KTAR', '{PIC}K{Propionyl}TAR');
            checkLabel('pic,prop_d0', 'simple', 'QKTAR', '{PIC}QK{Propionyl}TAR');
            checkLabel('prop_d0', 'should add one on meythyl', 'QK{Methyl}TAR', '{Propionyl}QK{Methyl,Propionyl}TAR');
            checkLabel('prop_d0', 'should add none on Dimethyl', 'QK{Dimethyl}TAR', '{Propionyl}QK{Dimethyl}TAR');
            checkLabel('silac', 'simple', 'QKTAR', 'QK{Label:13C(6)15N(2)}TAR{Label:13C(6)15N(4)}');
            checkLabel('prop_d0,silac', 'simple', 'QKTAR', '{Propionyl}QK{Label:13C(6)15N(2),Propionyl}TAR{Label:13C(6)15N(4)}');
            checkLabel('prop_d0,super_silac', 'simple', 'QKTAR', '{Propionyl}QK{Label:13C(6)15N(2),Propionyl}TAR');
            checkLabel('silac,prop_d0', 'reversed, but silac should happened at the end', 'QKTAR', '{Propionyl}QK{Label:13C(6)15N(2),Propionyl}TAR{Label:13C(6)15N(4)}');
            checkLabel('13C15N', 'simple', 'QKTAR', 'Q{13C15N-Q}K{13C15N-K}T{13C15N-T}A{13C15N-A}R{13C15N-R}');
            checkLabel('13C15N', 'with Phospho', 'QKT{Phospho}AR', 'Q{13C15N-Q}K{13C15N-K}T{13C15N-T,Phospho}A{13C15N-A}R{13C15N-R}');
            checkLabel('de_aqua', 'aqua_d', 'TWSKLT{Phospho}KEKD{AQUA_D}NK', 'TWSKLT{Phospho}KEKD{AQUA_D,de_AQUA_D}NK');
        });
        describe("unlabel peptide", function() {
            var checkLabel = function(imName, comment, inRichSeq, expected) {
                it(imName + ': ' + comment + ': ' + inRichSeq + ' -> ' + expected, function() {
                    var rs = new RichSequence().fromString(inRichSeq)
                    implicitModifier.unlabel(imName, rs);
                    expect(rs.toString()).toEqual(expected)
                })
            }
            checkLabel('prop_d0', 'simple', '{Propionyl}QK{Propionyl}TAR', 'QKTAR');
            checkLabel('prop_d0', '2 on first aa', '{Propionyl}K{Propionyl}K{Propionyl}TAR', 'KKTAR');
            checkLabel('prop_d5_nterm', 'simple', '{Propionyl:2H(5)}QK{Propionyl}TAR', 'QKTAR');
            checkLabel('pic,prop_d0', 'simple', '{PIC}QK{Propionyl}TAR', 'QKTAR');
            checkLabel('pic,prop_d5', 'simple', '{PIC}QK{Propionyl:2H(5)}TAR', 'QKTAR');
            checkLabel('prop_d5', 'simple', '{Propionyl:2H(5)}QK{Propionyl:2H(5)}TAR', 'QKTAR');
            checkLabel('prop_d5_nterm', '2 on first aa', '{Propionyl:2H(5)}K{Propionyl}K{Propionyl}TAR', 'KKTAR');
            checkLabel('prop_d5', '2 on first aa', '{Propionyl:2H(5)}K{Propionyl:2H(5)}K{Propionyl:2H(5)}TAR', 'KKTAR');
            checkLabel('prop_d0', 'should add one on meythyl', '{Propionyl}QK{Methyl,Propionyl}TAR', 'QK{Methyl}TAR');
            checkLabel('prop_d0', 'should add none on Dimethyl', '{Propionyl}QK{Dimethyl}TAR', 'QK{Dimethyl}TAR');
            checkLabel('silac', 'simple', 'QK{Label:13C(6)15N(2)}TAR{Label:13C(6)15N(4)}', 'QKTAR');
            checkLabel('silac', 'simple', 'QK{Acetyl,Label:13C(6)15N(2)}TAR{Label:13C(6)15N(4)}', 'QK{Acetyl}TAR');
            checkLabel('prop_d0,silac', 'simple', '{Propionyl}QK{Label:13C(6)15N(2),Propionyl}TAR{Label:13C(6)15N(4)}', 'QKTAR');
            checkLabel('silac,prop_d0', 'reversed', '{Propionyl}QK{Label:13C(6)15N(2),Propionyl}TAR{Label:13C(6)15N(4)}', 'QKTAR');
            checkLabel('prop_d0,super_silac', 'simple', '{Propionyl}QK{Label:13C(6)15N(2),Propionyl}TAR', 'QKTAR');
            checkLabel('pic,silac,prop_d0', 'reversed', '{PIC}QK{Label:13C(6)15N(2),Propionyl}TAR{Label:13C(6)15N(4)}', 'QKTAR');
            checkLabel('prop_d0,super_silac,pic', 'simple', '{PIC}QK{Label:13C(6)15N(2),Propionyl}TAR', 'QKTAR');
            checkLabel('13C15N', 'simple', 'Q{13C15N-Q}K{13C15N-K}T{13C15N-T}A{13C15N-A}R{13C15N-R}', 'QKTAR');
            checkLabel('13C15N', 'with Phospho', 'Q{13C15N-Q}K{13C15N-K}T{Phospho,13C15N-T}A{13C15N-A}R{13C15N-R}', 'QKT{Phospho}AR');

        });

        describe("isLabeled peptide", function() {
            var checkLabel = function(imName, comment, inRichSeq, expected) {
                it(imName + ': ' + comment + ': ' + inRichSeq + ' -> ' + expected, function() {
                    var rs = new RichSequence().fromString(inRichSeq);
                    expect(implicitModifier.isLabeled(imName, rs)).toEqual(expected)
                })
            }
            checkLabel('prop_d0', 'simple', '{Propionyl}QK{Propionyl}TAR', true);
            checkLabel('prop_d0', 'simple', '{Propionyl}QKTAR', false);
            checkLabel('prop_d0', 'd5 misplaced', '{Propionyl}QK{Propionyl:2H(5)}TAR', false);
            checkLabel('prop_d5_nterm', 'simple', '{Propionyl:2H(5)}QK{Propionyl}TAR', true);
            checkLabel('prop_d5', 'simple', '{Propionyl:2H(5)}QK{Propionyl:2H(5)}TAR', true);

            checkLabel('prop_d0', 'should add one on meythyl', '{Propionyl}QK{Methyl,Propionyl}TAR', true);
            checkLabel('prop_d0', 'should add one on meythyl', '{Propionyl}QK{Methyl}TAR', false);
            checkLabel('prop_d0', 'should add none on Dimethyl', '{Propionyl}QK{Dimethyl}TAR', true);
            checkLabel('prop_d0', 'should add none on Dimethyl', 'QK{Dimethyl}TAR', false);
            checkLabel('silac', 'simple', 'QK{Label:13C(6)15N(2)}TAR{Label:13C(6)15N(4)}', true);
            checkLabel('silac', 'modif inverted', 'QK{Label:13C(6)15N(4)}TAR{Label:13C(6)15N(2)}', false);
            checkLabel('super_silac', 'simple', 'QK{Label:13C(6)15N(2)}TAR', true);
            checkLabel('super_silac', 'multi sites', 'K{Label:13C(6)15N(2)}SAPSTGGVK{Label:13C(6)15N(2)}K{Label:13C(6)15N(2)}PHR', true);
            checkLabel('13C15N', 'simple', 'Q{13C15N-Q}K{13C15N-K}T{13C15N-T}A{13C15N-A}R{13C15N-R}', true);
            checkLabel('13C15N', 'with Phospho', 'Q{13C15N-Q}K{13C15N-K}T{13C15N-T,Phospho}A{13C15N-A}R{13C15N-R}', true);
            checkLabel('13C15N', 'with Phospho', 'Q{13C15N-Q}K{13C15N-K}T{Phospho}A{13C15N-A}R{13C15N-R}', false);

        });
        describe("getLabelsAndClean(peptide)", function() {
            var check = function(comment, inRichSeq, expLabels, expPeptide) {
                it(comment + ': ' + inRichSeq + ' -> ' + expPeptide + ' [' + expLabels + ']', function() {
                    var rs = new RichSequence().fromString(inRichSeq)
                    var labels = implicitModifier.getLabelsAndClean(rs);
                    expect(labels.join(',')).toEqual(expLabels)
                    expect(rs.toString()).toEqual(expPeptide)
                })
            }
            check('no label', 'HHH', '', 'HHH');
            check('nothing (missing K modif)', '{Propionyl}QK{Methyl}TAR', '', '{Propionyl}QK{Methyl}TAR');
            check('nothing d5 (missing K modif)', '{Propionyl:2H(5)}QK{Methyl}TAR', '', '{Propionyl:2H(5)}QK{Methyl}TAR');
            check('simple', '{Propionyl}QK{Propionyl}TAR', 'prop_d0', 'QKTAR');
            check('2 on first aa', '{Propionyl}K{Propionyl}K{Propionyl}TAR', 'prop_d0', 'KKTAR');
            check('missing  on first aa', 'K{Propionyl}K{Propionyl}TAR', '', 'K{Propionyl}K{Propionyl}TAR');
            check('missing on nterm', '{Propionyl}KK{Propionyl}TAR', '', '{Propionyl}KK{Propionyl}TAR');
            check('simple', '{Propionyl:2H(5)}QK{Propionyl}TAR', 'prop_d5_nterm', 'QKTAR');
            check('2 on first aa prop_d5_nterm', '{Propionyl:2H(5)}K{Propionyl}K{Propionyl}TAR', 'prop_d5_nterm', 'KKTAR');
            check('2 on first aa, prop_ic', '{PIC}K{Propionyl}K{Propionyl}TAR', 'pic,prop_d0', 'KKTAR');
            check('should add one on meythyl', '{Propionyl}QK{Methyl,Propionyl}TAR', 'prop_d0', 'QK{Methyl}TAR');
            check('should add none on Dimethyl', '{Propionyl}QK{Dimethyl}TAR', 'prop_d0', 'QK{Dimethyl}TAR');
            check('simple', 'QK{Label:13C(6)15N(2)}TAR{Label:13C(6)15N(4)}', 'silac', 'QKTAR');
            check('two labels', '{Propionyl}QK{Label:13C(6)15N(2),Propionyl}TAR{Label:13C(6)15N(4)}', 'prop_d0,silac', 'QKTAR');
            check('three labels', '{PIC}QK{Label:13C(6)15N(2),Propionyl}TAR{Label:13C(6)15N(4)}', 'pic,prop_d0,silac', 'QKTAR');
            check('super_silac, multi sites', 'K{Label:13C(6)15N(2)}SAPSTGGVK{Label:13C(6)15N(2)}K{Label:13C(6)15N(2)}PHR', 'super_silac', 'KSAPSTGGVKKPHR');
            check('simple aqua', 'CCL{AQUA_L}T{AQUA_T}CR', 'aqua', 'CCLTCR');
            check('with numeric modification', 'C{123.4}CL{AQUA_L}T{AQUA_T}C{99,Methyl}R', 'aqua', 'C{123.4}CLTC{99,Methyl}R');
        });

        describe("nonimplicitModifiedPos", function() {
            var check = function(comment, inRichSeq, exp) {
                it(comment + ': ' + inRichSeq + ' -> [' + exp + ']', function() {
                    var pos = implicitModifier.nonimplicitModifiedPos(new RichSequence().fromString(inRichSeq))
                    expect(pos.join(',')).toEqual(exp)
                })
            }
            check('no label', 'HHH', '');
            check('nothing (missing K modif)', '{Propionyl}QK{Methyl}TAR', '-1,1');
            check('simple', '{Propionyl}QK{Propionyl}TAR', '');
            check('should add one on meythyl', '{Propionyl}QK{Methyl,Propionyl}TAR{Methyl}', '1,4');

        });

    });
});
