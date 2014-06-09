define(['fishtones/services/dry/MassBuilder', 'fishtones/models/dry/RichSequence', 'fishtones/models/dry/TheoSpectrum', 'fishtones/collections/dry/AminoAcidDictionary', 'fishtones/collections/dry/ResidueModificationDictionary'], function(mb, RichSequence, TheoSpectrum, dicoAA, dicoResMod) {
    return describe('MassBuilder', function() {

        it('single aminoacid', function() {
            var aa = dicoAA.get('K');
            var raa = {
                aa : aa
            }
            var m = mb.computeMassRichAA(raa);
            expect(m).toBeCloseTo(128.094963, 0.00001);

            raa.modifications = [dicoResMod.get('Phospho'), dicoResMod.get('Acetyl')]
            m = mb.computeMassRichAA(raa);
            expect(m).toBeCloseTo(128.094963 + 79.966331 + 42.010565, 0.00001);

        });

        it("entire mass, no modif", function() {
            var rs = new RichSequence().fromString('KSAPATGGVKKPHR');
            expect(mb.computeMassRichSequence(rs)).toBeCloseTo(1432.8262, 0.001);
            for ( i = 1; i <= 3; i++) {
                expect(mb.computeMassRichSequence(rs, i)).toBeCloseTo(1432.8262 / i + 1.00728, 0.001);
            }
        });
        it("entire mass, cterm modif", function() {
            var rs = new RichSequence().fromString('KSAPATGGVKKPHR{100}');
            expect(mb.computeMassRichSequence(rs)).toBeCloseTo(1532.8262, 0.001);
            for ( i = 1; i <= 3; i++) {
                expect(mb.computeMassRichSequence(rs, i)).toBeCloseTo(1532.8262 / i + 1.00728, 0.001);
            }
        });
       it("entire mass, nterm modif", function() {
            var rs = new RichSequence().fromString('{100}KSAPATGGVKKPHR');
            expect(mb.computeMassRichSequence(rs)).toBeCloseTo(1532.8262, 0.001);
            for ( i = 1; i <= 3; i++) {
                expect(mb.computeMassRichSequence(rs, i)).toBeCloseTo(1532.8262 / i + 1.00728, 0.001);
            }
        });

        it("entire mass, with modif", function() {
            var rs = new RichSequence().fromString('{Propionyl}K{Dimethyl}SAPATGGVK{Propionyl}K{Propionyl}PHR');
            expect(mb.computeMassRichSequence(rs)).toBeCloseTo(1628.9361, 0.001);
            for ( i = 1; i <= 3; i++) {
                expect(mb.computeMassRichSequence(rs, i)).toBeCloseTo(1628.9361 / i + 1.00728, 0.001);
            }
        });

        it("entire mass, modif as double values", function() {
            var rs = new RichSequence().fromString('KSAP{53.45}ATGGVK{89}KPHR');
            var mExpected = 1432.8262 + 53.45 + 89;
            expect(mb.computeMassRichSequence(rs)).toBeCloseTo(mExpected, 0.001);
            for ( i = 1; i <= 3; i++) {
                expect(mb.computeMassRichSequence(rs, i)).toBeCloseTo(mExpected / i + 1.00728, 0.001);
            }
        });
        it("entire mass, with modif as mix of double and string", function() {
            var rs = new RichSequence().fromString('{Propionyl}K{Dimethyl,-100.0}SAPATGGVK{Propionyl}K{Propionyl}PHR');
            expect(mb.computeMassRichSequence(rs)).toBeCloseTo(1528.9361, 0.001);
            for ( i = 1; i <= 3; i++) {
                expect(mb.computeMassRichSequence(rs, i)).toBeCloseTo(1528.9361 / i + 1.00728, 0.001);
            }
        });

        it("theoretical spectrum, no modif", function() {
            var rs = new RichSequence().fromString('KSAPATGGVKKPHR');
            var theo = mb.computeTheoSpectrum(rs);

            expect( theo instanceof TheoSpectrum).toBe(true);

            // check context values
            expect(theo.get('fragSeries')).toEqual(['b', 'b++', 'y', 'y++']);
            expect(theo.get('peaks').length).toEqual(56);
            expect(theo.get('lenSeq')).toEqual(14);

            // check they are sorted
            var masses = _.pluck(theo.peaks, 'moz')
            expect(masses.sort()).toEqual(masses)

            // peak masses with protein prospector
            assertPeak(theo, 'y3', 409.2306);
            assertPeak(theo, 'y++12', 609.8569);
            assertPeak(theo, 'b4', 384.2241);
            assertPeak(theo, 'b++4', 192.6157);
        })
          it("theoretical spectrum, get mozs", function() {
            var rs = new RichSequence().fromString('KSAPATGGVKKPHR');
            var theo = mb.computeTheoSpectrum(rs);
            
            var mozs = theo.mozs();
            expect(mozs).not.toBeUndefined();
            expect(mozs.length).toBe(56)
            expect(mozs).toEqual(_.sortBy(mozs, function(m){return m}));
        })
        it("theoretical spectrum, modif", function() {
            var rs = new RichSequence().fromString('{100}K{200}SAPATGGVKKPHR-{1000}');
            var theo = mb.computeTheoSpectrum(rs);

            expect( theo instanceof TheoSpectrum).toBe(true);

            // check context values
            expect(theo.get('fragSeries')).toEqual(['b', 'b++', 'y', 'y++']);
            expect(theo.get('peaks').length).toEqual(60);
            expect(theo.get('lenSeq')).toEqual(14);

            // check they are sorted
            var masses = _.pluck(theo.peaks, 'moz')
            expect(masses.sort()).toEqual(masses)

            // peak masses with protein prospector
            assertPeak(theo, 'y0', 1000+15.994914622 + 1.007825032*2+ + 1.00728);
            assertPeak(theo, 'b0', 100 + 1.007825032 );
            assertPeak(theo, 'y3', 1000+409.2306);
            assertPeak(theo, 'y++12', 500+609.8569);
            assertPeak(theo, 'b4', 300+384.2241);
            assertPeak(theo, 'b++4', 150+192.6157);
        })
        // ---------- utilities
        function assertPeak(theo, label, tmoz) {
            var lpks = _.filter(theo.get('peaks'), function(p) {
                return p.label == label
            });
            expect(lpks.length).toEqual(1);

            var pk = lpks[0];
            expect(pk.label).toEqual(label);
            expect(pk.label).toMatch('^' + (pk.series.replace(/\+/g, '\\+')));
            if (pk.label < 'm') {//cterm
                expect(pk.label).toMatch((pk.pos + 1) + '$');
            } else {
                expect(pk.label).toMatch((theo.get('lenSeq') - pk.pos ) + '$');
            }
            expect(pk.moz).toBeCloseTo(tmoz, 0.001);
        }

    });
});
