define(['underscore', 'fishtones/models/match/PeakListPairAlignment'], function(_, PeakListPairAlignment) {

    return describe('PeakListPairAlignment', function() {
        var newPkl = function(mozs) {
            return {
                mozs : function() {
                    return _.sortBy(mozs, function(x) {
                        return x
                    });
                },
                size : function() {
                    return mozs.length
                }
            }
        }
        it('just check mocks', function() {
            var pkl = newPkl([3., 1., 10.])
            expect(pkl.size()).toBe(3);
            expect(pkl.mozs()).toEqual([1.0, 3.0, 10.0])
        });

        it('self alignment', function() {
            var alg = new PeakListPairAlignment({
                pklA : newPkl([1, 4, 10]),
                pklB : newPkl([1, 4, 10])
            })

            var matches = alg.matches();
            expect(matches).toEqual([{
                iA : 0,
                iB : 0,
                errorPPM : 0.
            }, {
                iA : 1,
                iB : 1,
                errorPPM : 0.
            }, {
                iA : 2,
                iB : 2,
                errorPPM : 0.
            }]);
        });

        it('raw matches, 3x3', function() {
            var alg = new PeakListPairAlignment({
                pklA : newPkl([1000, 1500, 2000]),
                pklB : newPkl([1001, 1499, 2000])
            })

            var matches = alg.matches();
            expect(matches).toEqual([{
                iA : 0,
                iB : 0,
                errorPPM : -999.5002498750624
            }, {
                iA : 1,
                iB : 1,
                errorPPM : 666.8889629876625
            }, {
                iA : 2,
                iB : 2,
                errorPPM : 0.
            }]);
        });

        describe('match indeices', function() {

            var checkMatchIndices = function(comment, mozsA, mozsB, expIdx) {
                it(comment + '(forwards)', function() {
                    var alg = new PeakListPairAlignment({
                        pklA : newPkl(mozsA),
                        pklB : newPkl(mozsB)
                    })

                    var matches = alg.matches();
                    expect(_.map(matches, function(m) {
                        return [m.iA, m.iB]
                    })).toEqual(expIdx);

                })
                it(comment + '(reverse)', function() {
                    var alg = new PeakListPairAlignment({
                        pklA : newPkl(mozsB),
                        pklB : newPkl(mozsA)
                    })

                    var matches = alg.matches();
                    expect(_.map(matches, function(m) {
                        return [m.iB, m.iA]
                    })).toEqual(expIdx);

                })
            }
            checkMatchIndices('idem', [1, 4, 10], [1, 4, 10], [[0, 0], [1, 1], [2, 2]])
            checkMatchIndices('asymm, middle, gt', [1, 4, 5, 10], [1, 4, 10], [[0, 0], [1, 1], [3, 2]])
            checkMatchIndices('asymm, middle, multi gt', [1, 4, 5, 6,7, 10], [1, 4, 10], [[0, 0], [1, 1], [5, 2]])
            checkMatchIndices('asymm, middle, multi lt and gt', [1, 1.5, 2.5, 3, 4, 5, 6,7, 10], [1, 4, 10], [[0, 0], [4, 1], [8, 2]])
            checkMatchIndices('asymm, everywhere , multi lt and gt', [0.2, 1, 1.5, 2.5, 3, 4, 5, 6,7, 10], [1, 4, 10, 100], [[1, 0], [5, 1], [9, 2]])

        })
        // it('self alignment', function() {
        // var alg = new SpectraPairAlignment({
        // spectrumA : sp,
        // spectrumB : sp
        // })
        //
        // expect(sp.size()).toBe(129)
        // //            console.log()
        // expect(alg.get('matches').length).toBe(129);
        // expect(alg.closerThanPPM(0.001).length).toBe(129);
        // })
        // it('large to small', function() {
        //
        // var alg = new SpectraPairAlignment({
        // spectrumA : sp,
        // spectrumB : spSmall
        // })
        //
        // expect(alg.get('matches').length).toBe(14);
        //
        // expect(alg.closerThanPPM(0.001).length).toBe(10);
        // })
        // it('small to large', function() {
        //
        // var alg = new SpectraPairAlignment({
        // spectrumB : sp,
        // spectrumA : spSmall
        // })
        // expect(alg.get('matches').length).toBe(14);
        // expect(alg.closerThanPPM(0.001).length).toBe(10);
        // })
    });
});
