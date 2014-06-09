define(['jquery', 'underscore', 'Config', 'fishtones/models/wet/ExpMSMSSpectrum'], function($, _, config, ExpMSMSSpectrum) {
    return describe('ExpMSMSSpectrum', function() {
        beforeEach(function() {
            config.set('wet.url.rest', '/sinon')
        });

        it('check url set accordingly with sino', function() {
            var sp = new ExpMSMSSpectrum();
            expect(sp.urlRoot()).toEqual("/sinon/msmsspectrum");
        });
        it('ExpMSMSSpectrum, fetch from id, full', function(done) {
            var sp = new ExpMSMSSpectrum({
                id : 326
            });

            var ok = false
            sp.fetch({
                success : function() {
                    ok = true;
                    expect(sp.get('id')).toEqual(326);
                    expect(sp.size()).toEqual(36);
                    expect(sp.mozs()).not.toBeUndefined();
                    expect(sp.mozs().length).toBe(36);
                    done();
                }
            });
        });

        it("ExpMSMSSpectrum, fetch from id, {fields:'precursorOnly'}", function(done) {
            var sp = new ExpMSMSSpectrum({
                id : 326
            });
            sp.fetch({
                success : function() {
                    expect(sp.get('id')).toEqual(326);
                    expect(sp.size()).toEqual(0);
                    expect(sp.mozs()).toBeUndefined();
                    done();
                },
                params : {
                    fields : 'precursorOnly'
                }
            });
        });

        describe('shift', function() {
            var sp = new ExpMSMSSpectrum({
                precMoz : 1000,
                mozs : [100, 150, 200, 350],
                intensities : [10, 20, 10, 15]
            });
            it('shiftByMoz(7)', function() {
                var sp2 = sp.shiftByMoz(7);
                expect(sp.get('mozs')).toEqual([100, 150, 200, 350]);

                expect(sp2.get('mozs')).toEqual([107, 157, 207, 357]);
                expect(sp2.get('intensities')).toEqual([10, 20, 10, 15]);
                expect(sp2.get('precMoz')).toEqual(1000)
            })
        });
        describe('concat', function() {
            var spA = new ExpMSMSSpectrum({
                precMoz : 1000,
                mozs : [100, 150, 200, 350],
                intensities : [10, 20, 10, 15],
                intensityRanks : [2, 0, 2, 1]
            });
            var spB = new ExpMSMSSpectrum({
                precMoz : 1000,
                mozs : [101, 148, 223, 250],
                intensities : [10, 5, 10, 15],
                intensityRanks : [1, 3, 1, 0]
            });
            it('spA.concatFragments(spB)', function() {
                var sp = spA.concatFragments(spB)
                expect(spA.get('mozs')).toEqual([100, 150, 200, 350]);
                expect(sp.get('mozs')).toEqual([100, 101, 148, 150, 200, 223, 250, 350]);
                expect(sp.get('intensities')).toEqual([10, 10, 5, 20, 10, 10, 15, 15]);
                expect(sp.get('intensityRanks')).toEqual([2, 1, 3, 0, 2, 1, 0, 1]);

            })
            it('spB.concatFragments(spA)', function() {
                var sp = spA.concatFragments(spB)
                expect(spA.get('mozs')).toEqual([100, 150, 200, 350]);
                expect(sp.get('mozs')).toEqual([100, 101, 148, 150, 200, 223, 250, 350]);
                expect(sp.get('intensities')).toEqual([10, 10, 5, 20, 10, 10, 15, 15]);
                expect(sp.get('intensityRanks')).toEqual([2, 1, 3, 0, 2, 1, 0, 1]);

            })
            it('sp.concatFragments(sp.shiftByMoz(7))', function() {
                var sp = spA.concatFragments(spA.shiftByMoz(7));

                expect(spA.get('mozs')).toEqual([100, 150, 200, 350]);
                expect(sp.get('mozs')).toEqual([100, 107, 150, 157, 200, 207, 350, 357]);
                expect(sp.get('intensities')).toEqual([10, 10, 20, 20, 10, 10, 15, 15]);
                expect(sp.get('intensityRanks')).toEqual([2, 2, 0, 0, 2, 2, 1, 1]);

            })
        })
    });
});
