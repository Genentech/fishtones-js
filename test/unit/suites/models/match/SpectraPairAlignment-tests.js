define(['underscore', 'fishtones/models/match/SpectraPairAlignment', 'fishtones/models/wet/ExpMSMSSpectrum', 'mock/msms-exp-K27Ac'], function(_, SpectraPairAlignment, ExpMSMSSpectrum, sp) {

    return describe('SpectraPairAlignment', function() {
        var mz = _.clone(sp.get('mozs'))
        mz.length = 10;
        mz = mz.concat([3.0, 45.0, 224.0, 10000.0])
        mz = _.sortBy(mz, function(m) {
            return m
        });

        var spSmall = new ExpMSMSSpectrum({
            mozs : mz,
            intensityRanks : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        });
        it('just check mocks', function() {
            expect(sp.size()).toBe(129)
            expect(spSmall.size()).toBe(14)
        });

        it('self alignment', function() {
            var alg = new SpectraPairAlignment({
                spectrumA : sp,
                spectrumB : sp
            })

            expect(sp.size()).toBe(129)
            expect(alg.get('matches').length).toBe(129);
            expect(alg.closerThanPPM(0.001).length).toBe(129);
        })
        it('large to small', function() {

            var alg = new SpectraPairAlignment({
                spectrumA : sp,
                spectrumB : spSmall
            })

            expect(alg.get('matches').length).toBe(11);

            expect(alg.closerThanPPM(0.001).length).toBe(10);
        })
        it('small to large', function() {

            var alg = new SpectraPairAlignment({
                spectrumB : sp,
                spectrumA : spSmall
            })
            expect(alg.get('matches').length).toBe(11);
            expect(alg.closerThanPPM(0.001).length).toBe(10);
        })
    });
});
