define(['fishtones/models/dry/RichSequence', 'fishtones/collections/dry/ResidueModificationDictionary', 'fishtones/services/dry/MassBuilder'], function (RichSequence, dicoResMod, massBuilder) {
    return describe('RichSequenceClass', function () {
        it("read from string,  no modif", function () {
            var rs = new RichSequence()
            rs.fromString('KSAPATGGVKKPHR');
            expect(rs.size()).toEqual(14);
            expect(rs.countModificationsAt(-1)).toEqual(0);
            expect(rs.countModificationsAt(0)).toEqual(0);
        });
        it("read from string,  nterm only", function () {
            var rs = new RichSequence()
            rs.fromString('{Propionyl}KSAPATGGVKKPHR');
            expect(rs.size()).toEqual(14);
            expect(rs.countModificationsAt(-1)).toEqual(1);
            expect(rs.countModificationsAt(0)).toEqual(0);
        });
        it("read from string,  last aa ACDEF{Methyl}", function () {
            var rs = new RichSequence()
            rs.fromString('ACDEF{Methyl}');
            expect(rs.size()).toEqual(5);
            expect(rs.countModificationsAt(4)).toEqual(1);
            expect(rs.countModificationsAt(5)).toEqual(0);
        });
        it("read from string,  empty modif ACDE{}F", function () {
            var rs = new RichSequence()
            rs.fromString('ACDE{}F');
            expect(rs.size()).toEqual(5);
            expect(rs.countModificationsAt(3)).toEqual(0);
            expect(rs.countModificationsAt(4)).toEqual(0);
        });
        it("read from string,  cterm ACDEF-{Methyl}", function () {
            var rs = new RichSequence()
            rs.fromString('ACDEF-{Methyl}');
            expect(rs.size()).toEqual(5);
            expect(rs.countModificationsAt(4)).toEqual(0);
            expect(rs.countModificationsAt(5)).toEqual(1);
        });
        it("read from string,  cterm ACDEF{}{Methyl}", function () {
            var rs = new RichSequence()
            rs.fromString('ACDEF{}{Methyl}');
            expect(rs.size()).toEqual(5);
            expect(rs.countModificationsAt(4)).toEqual(0);
            expect(rs.countModificationsAt(5)).toEqual(1);
        });
        it("read from string,  cterm ACDEF{Acetyl}{Methyl}", function () {
            var rs = new RichSequence()
            rs.fromString('ACDEF{Acetyl}{Methyl}');
            expect(rs.size()).toEqual(5);
            expect(rs.countModificationsAt(4)).toEqual(1);
            expect(rs.countModificationsAt(5)).toEqual(1);
        });
        it("read from string,  last aa ACDEF{Methyl}", function () {
            var rs = new RichSequence()
            rs.fromString('ACDEF{Methyl}');
            expect(rs.size()).toEqual(5);
            expect(rs.countModificationsAt(4)).toEqual(1);
            expect(rs.countModificationsAt(5)).toEqual(0);
        });
        it("read from String", function () {
            var rs = new RichSequence()
            rs.fromString('{Propionyl}K{Dimethyl}SAPATGGVK{Propionyl}K{Propionyl}PHR');
            expect(rs.size()).toEqual(14);
            expect(rs.countModificationsAt(-1)).toEqual(1);
            expect(rs.countModificationsAt(0)).toEqual(1);
        });
        it("read from String with Propionyl:2H(5) nterm", function () {
            var rs = new RichSequence()
            rs.fromString('{Propionyl:2H(5)}K{Propionyl}STGGK{Propionyl}APR');
            expect(rs.size()).toEqual(9);
            expect(rs.countModificationsAt(-1)).toEqual(1);
            expect(rs.countModificationsAt(0)).toEqual(1);
        });

        it("aaAt", function () {
            var rs = new RichSequence()
            rs.fromString('{Propionyl}K{Dimethyl}SAPATGGVK{Propionyl}K{Propionyl}PHR');
            expect(rs.aaAt(5).get('code1')).toEqual('T');
        });
        it("read from String, with modif as numbers", function () {
            var rs = new RichSequence()
            rs.fromString('K{10.43,11.22}SAPATGGVK{111.34}K{-22.4}PHR');
            expect(rs.size()).toEqual(14);
            expect(rs.countModificationsAt(0)).toEqual(2);
            expect(rs.modifAt(0)[1].get('mass')).toBeCloseTo(11.22, 0.00001)
            expect(rs.modifAt(10)[0].get('mass')).toBeCloseTo(-22.4, 0.00001)
        });

        it("read from String, with modif as a mix string + numbers", function () {
            var rs = new RichSequence()
            rs.fromString('{Propionyl}K{11.22}SAPATGGVK{Propionyl}K{Propionyl}PHR');
            expect(rs.size()).toEqual(14);
            expect(rs.countModificationsAt(0)).toEqual(1);
            expect(rs.modifAt(0)[0].get('mass')).toBeCloseTo(11.22, 0.00001)
        });

        it("from string, inplace inner", function () {
            var rs = new RichSequence().fromString('KSAPATGGVKKPHR');
            expect(massBuilder.computeMassRichSequence(rs)).toBeCloseTo(1432.8262, 0.001);

            expect(rs.size()).toEqual(14);
            expect(rs.countModificationsAt(0)).toEqual(0);
            expect(rs.countModificationsAt(-1)).toEqual(0);
            expect(rs.countModificationsAt(2)).toEqual(0);

            rs.fromString('KS{100}APATGGVKKPHR');
            expect(massBuilder.computeMassRichSequence(rs)).toBeCloseTo(1432.8262 + 100, 0.001);
            rs.fromString('KS{100}APATGGVKKPHR');
            expect(massBuilder.computeMassRichSequence(rs)).toBeCloseTo(1432.8262 + 100, 0.001);

        });

        it("from string, inplace inner, remove", function () {
            var rs = new RichSequence().fromString('KS{100}APATGGVKKPHR');
            expect(massBuilder.computeMassRichSequence(rs)).toBeCloseTo(1432.8262 + 100, 0.001);

            expect(rs.size()).toEqual(14);
            expect(rs.countModificationsAt(1)).toEqual(1);

            rs.fromString('KSAPATGGVKKPHR');
            expect(massBuilder.computeMassRichSequence(rs)).toBeCloseTo(1432.8262, 0.001);
            expect(rs.countModificationsAt(1)).toEqual(0);

        });

        it("from string, inplace nterm", function () {
            var rs = new RichSequence().fromString('KSAPATGGVKKPHR');
            expect(massBuilder.computeMassRichSequence(rs)).toBeCloseTo(1432.8262, 0.001);

            expect(rs.size()).toEqual(14);
            expect(rs.countModificationsAt(0)).toEqual(0);
            expect(rs.countModificationsAt(-1)).toEqual(0);
            expect(rs.countModificationsAt(2)).toEqual(0);

            rs.fromString('{100}KSAPATGGVKKPHR');
            expect(massBuilder.computeMassRichSequence(rs)).toBeCloseTo(1432.8262 + 100, 0.001);
            //modifying strng did not reset termini modifcation at once
            rs.fromString('{100}KSAPATGGVKKPHR');
            expect(massBuilder.computeMassRichSequence(rs)).toBeCloseTo(1432.8262 + 100, 0.001);

        });
        it("from string, inplace nterm, remove", function () {
            var rs = new RichSequence().fromString('{100}KSAPATGGVKKPHR');
            expect(massBuilder.computeMassRichSequence(rs)).toBeCloseTo(1432.8262 + 100, 0.001);

            expect(rs.size()).toEqual(14);
            expect(rs.countModificationsAt(-1)).toEqual(1);

            rs.fromString('KSAPATGGVKKPHR');
            expect(massBuilder.computeMassRichSequence(rs)).toBeCloseTo(1432.8262, 0.001);
            expect(rs.countModificationsAt(-1)).toEqual(0);

        });

        it("equal/clone", function () {
            var str = '{Propionyl}K{Dimethyl}SAPATGGVK{Propionyl}K{Propionyl}PHR';
            var rs1 = new RichSequence().fromString(str);
            var rs2 = rs1.clone();

            expect(rs2.size()).toEqual(14);
            expect(rs2.countModificationsAt(-1)).toEqual(1);
            expect(rs2.countModificationsAt(0)).toEqual(1);

            expect(rs2.toString()).toEqual(str);

            expect(rs1.equalsTo(rs2)).toBe(true)

            rs2.get('sequence')[0].modifications[1] = dicoResMod.get('Phospho')

            expect(rs2.get('sequence')[0].modifications[1]).not.toBeUndefined();
            expect(rs1.equalsTo(rs2)).toBe(false)

        });

        describe('fromString => toString ', function () {
            var check = function (str) {
                var rs = new RichSequence().fromString(str);
                it(str, function () {
                    expect(rs.toString()).toEqual(str)
                })
            }
            check('AAAA')
            check('{Methyl,Propionyl}A{Dimethyl}AAA')
            check('A{Dimethyl}AAA')
            check('A{Dimethyl}AAA{Methyl}')
            check('A{Dimethyl}AAA{Methyl}{Deamidated}')
            check('A{Dimethyl}CCA-{Methyl}')
            check('A{99.44,Dimethyl}CCA-{123}')
            check('A{999.4}CCA')
        });

        describe("fromString() should throw:", function () {
            var check = function (comment, str) {
                var goCassePipe = function () {
                    new RichSequence().fromString(str);
                }
                it(comment + ' "' + str + '"', function () {
                    expect(goCassePipe).toThrow()
                });
            }
            check('lower case', 'AAxCC')
            check('lower case start', 'xAACC')
            check('lower case end', 'AACCx')

            check('numbers', 'H3K4')

            check('unknown modif', 'AAA{pipo}CCC')
            check('unknown residue', 'AAZZCC')
        })
    });
});
