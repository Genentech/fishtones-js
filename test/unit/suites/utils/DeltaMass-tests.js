define(['underscore', 'fishtones/utils/DeltaMass'], function(_, deltaMass) {
    return describe('DeltaMass', function() {
        describe('ppm', function() {
            it('defined', function() {
                expect(deltaMass.ppm).not.toBeUndefined()
            })
            describe('difference', function() {
                var check = function(x, y, exp) {
                    it(y + ' - ' + x + ' = ' + exp, function() {
                        expect(deltaMass.ppm.delta(x, y)).toBeCloseTo(exp, 0.001)
                    })
                }
                check(1000, 1000, 0)
                check(1000, 1001, 999.50025)
                check(1001, 1000, -999.50025)
                check(1000, 999.000999, -999.50025)
                check(999.000999, 1000, 999.50025)
                check(100, 100.1, 999.50025)
            })
            describe('range', function() {
                var check = function(x, t, exp) {
                    it(x + ' +/- ' + t + ' -> ' + exp, function() {
                        var r = deltaMass.ppm.range(x, t)
                        expect(r[0]).toBeCloseTo(exp[0], 0.000001)
                        expect(r[1]).toBeCloseTo(exp[1], 0.000001)
                    })
                }
                check(1000, 0, [1000, 1000])
                check(1000, 999.50025, [999.000999, 1001])
                check(500, 1000000, [166.6667, 1500])
            })
            describe('isCloserThan', function() {
                var check = function(x, t, y, exp) {
                    it('(target, tol, candidate):' + x + ' +/- ' + t + '? ' + y + ' -> ' + exp, function() {
                        expect(deltaMass.ppm.isCloseTo(x, t, y)).toBe(exp)
                    })
                    var f = deltaMass.ppm.isCloseTo(x, t);
                    it('(target, tol)(candidate):' + x + ' +/- ' + t + '? ' + y + ' -> ' + exp, function() {
                        expect(f(y)).toBe(exp)
                    })
                }
                check(1000, 0, 1000, true)
                check(1000, 0, 1000.00001, false)
                check(1000, 0.001, 1000, true)

                check(1000, 999.50025, 1000.99999, true)
                check(1000, 999.50025, 1001.0001, false)
                check(1000, 999.50025, 999.001, true)
                check(1000, 999.50025, 999.00097, false)
            })
        })
    })
})
