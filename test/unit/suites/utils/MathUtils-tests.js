define(['underscore', 'fishtones/utils/MathUtils'], function(_, mathUtils) {

    return describe('MathUtils', function() {
        it('singleton exists', function() {
            expect(mathUtils).not.toBeUndefined()
        })
        it('integrate (trapezoid)', function() {
            var x = [1, 2, 4, 5, 10]
            var y = [0, 1, 3, 5, 0]

            expect(mathUtils.integrate(x, y)).toBeCloseTo(21.0, 0.00001)
        })
        describe('interpolate (linear)', function() {
            describe("2 points", function() {
                var xs = [10, 20]
                var ys = [1, 2]
                var check = function(x, exp) {
                    expect(isNaN(mathUtils.interpolate(xs, ys, x))).toBe(false)
                    expect(mathUtils.interpolate(xs, ys, x)).toEqual(exp)
                }
                var checkNan = function(x) {
                    expect(isNaN(mathUtils.interpolate(xs, ys, x))).toBe(true)
                }
                it("middle", function() {
                    check(13, 1.3)
                })
                it("inf bound", function() {
                    check(10, 1)
                })
                it("sup bound", function() {
                    check(20, 2)
                })
                it("under", function() {
                    checkNan(9)
                })
                it("over", function() {
                    checkNan(21)
                })
            })
            describe("4 points", function() {
                var xs = [10, 20, 22, 42]
                var ys = [1, 2, 10, 0]
                var check = function(x, exp) {
                    expect(isNaN(mathUtils.interpolate(xs, ys, x))).toBe(false)
                    expect(mathUtils.interpolate(xs, ys, x)).toEqual(exp)
                }
                var checkNan = function(x) {
                    expect(isNaN(mathUtils.interpolate(xs, ys, x))).toBe(true)
                }
                it("21", function() {
                    check(21, 6)
                })
                it("20", function() {
                    check(20, 2)
                })
                it("sup bound", function() {
                    check(42, 0)
                })
                it("32", function() {
                    checkNan(5)
                })
                it("under", function() {
                    checkNan(9)
                })
                it("over", function() {
                    checkNan(43)
                })
            })
        });
    });
});
