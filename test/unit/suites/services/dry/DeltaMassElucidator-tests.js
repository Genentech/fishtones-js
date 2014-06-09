define(['underscore', 'fishtones/services/dry/DeltaMassElucidator'], function(_, deltaMassElucidator) {
    return describe('DeltaMassElucidator', function() {

        it('singleton is defined', function() {
            expect(deltaMassElucidator).not.toBeUndefined();
            expect(deltaMassElucidator).not.toBeNull();
        });

        var checkList = function(comment, mass, refMass, tolPPM, nbMax, expected) {
            it(comment + ':' + refMass + '+' + mass + ' (' + mass + ', ' + nbMax + ') -> ' + expected, function() {
                var l = deltaMassElucidator.what(mass, refMass, tolPPM, nbMax)
                _.each(l, function(e) {
                })
                expect(_.pluck(l, 'name')).toEqual(expected.split(','))
            })
        }
        describe('what', function() {
            checkList('one AA', 71.037114, 0, 1, 1, 'A')
            checkList('one AA ++', 35.518557, 0, 1, 1, 'A++')
            checkList('I/L', 113.084064, 0, 1, 2, 'I,L')
            checkList('CH4SO', 63.998285, 0, 1, 1, 'CH4SO')
            checkList('CH4SO++', 63.998285 / 2, 0, 1, 1, 'CH4SO++')
            checkList('minus AA ', -71.037114, 0, 1, 1, '-A')

        })
        describe('what reverse', function() {
            checkList('G -> ', 56.75763, 876.8976, 300, 10, 'I++,L++,N++,G')
            checkList('G -> ', -56.75763, 933.6552, 300 * 933.6552 / 876.8976, 10, '-I++,-L++,-N++,-G')

        })
        describe('nbMax', function() {
            checkList('ask for 100, but shoud get 1', 71.037114, 0, 1, 110, 'A')

        })
        describe('tolPPM', function() {
            checkList('300ppm, at 0 ref', 71.037114, 0, 300, 10, 'A')
            checkList('300ppm at 10000 ref', 71.037114, 10000, 300, 5, 'A,F++,H++')
        })
        describe('whoList', function() {
            it('4 matches', function() {
                var lPot = deltaMassElucidator.whoList(1000, [20, 30, 1000 - 1.0001 * 45.0214637, 1000 + 1.00728, 1020, 1000 + 45.0214637, 1000 + 137.058912 * 0.99999], 300)
                expect(_.pluck(lPot, 'name')).toEqual(['-CH3NO', 'iso +', 'CH3NO', 'H']);
                expect(_.pluck(lPot, 'index')).toEqual([2,3,5,6]);
            })
            it('4 matches with close modif', function() {
                var lPot = deltaMassElucidator.whoList(1000, [20, 30, 1000 - 1.0001 * 45.0214637, 1000 + 1.00728, 1020, 1000 + 45.0214637, 1000 + 113.084064 * 0.99999,2000], 300)
                expect(_.pluck(lPot, 'name')).toEqual(['-CH3NO', 'iso +', 'CH3NO', 'I', 'L']);
                expect(_.pluck(lPot, 'index')).toEqual([2,3,5,6,6]);
            })
        });

    });
});
