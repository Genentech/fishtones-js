define(['underscore', 'fishtones/models/dry/RichSequence', 'fishtones/models/match/PSMAlignment', 'fishtones/services/dry/MassBuilder', 'mock/msms-exp-K27Ac'], function(_, RichSequence, PSMAlignment, mb, sp) {

    return describe('PSMAlignment', function() {
        it("read spectrum", function() {
            expect(sp).not.toBeUndefined()
            expect(sp.get('mozs').length).toEqual(129)
            expect(sp.size()).toEqual(129)
        });

        var richSeq = new RichSequence().fromString('{Propionyl}K{Acetyl}SAPATGGVK{Propionyl}K{Propionyl}PHR')
        it("percursor mass", function() {
            expect(mb.computeMassRichSequence(richSeq, sp.get('precCharge'))).toBeCloseTo(sp.get('precMoz'), 0.001);
        });

        it('peak matching', function() {
            var psm = new PSMAlignment({
                richSequence : richSeq,
                expSpectrum : sp
            });

            expect( psm instanceof PSMAlignment).toBe(true);
            expect(psm.get('matches').length).toEqual(42);

            var dmatches = psm.closerThanPPM(300)
            var b0 = _.find(dmatches, function(m) {
                return m.theo.label == 'b0'
            })
            expect(b0).toBeUndefined();

            expect(dmatches.length).toEqual(16);
        });

        it('unmatched factor', function() {
            var psm = new PSMAlignment({
                richSequence : richSeq,
                expSpectrum : sp
            });

            expect(psm.unmatchedFactor(300, 10)).toEqual(3)
        })
        it('high termini mass should get b/y 0 theo', function() {
            var psm = new PSMAlignment({
                richSequence : new RichSequence().fromString('{313.17}APATGGVK{Propionyl}K{Propionyl}{390.213}'), //
                expSpectrum : sp
            });
            expect( psm instanceof PSMAlignment).toBe(true);

            var dmatches = psm.closerThanPPM(300)

            expect(dmatches.length).toEqual(10);

            var y0 = _.find(dmatches, function(m) {
                return m.theo.label == 'y0'
            })
            expect(y0).not.toBeUndefined()
            expect(y0.theo.moz).toBeCloseTo(409.23, 0.1)

        });

    });
});
