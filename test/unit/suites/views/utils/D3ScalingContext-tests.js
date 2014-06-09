define(['underscore', 'fishtones/views/utils/D3ScalingContext'], function(_, D3ScalingContext) {

  return describe('D3ScalingContext', function() {
    it('x2i(x)', function() {
      var sc = new D3ScalingContext({
        xDomain : [100, 150],
        width : 1000
      })
      var x = sc.x()

      expect(x(100)).toBe(0)
      expect(x(150)).toBe(1000)
      expect(x(110)).toBe(200)
    })
    it('i2x(i)', function() {
      var sc = new D3ScalingContext({
        xDomain : [100, 150],
        width : 1000
      })
      var x = sc.x()
      expect(x.invert(0)).toBe(100)
      expect(x.invert(1000)).toBe(150)
      expect(x.invert(200)).toBe(110)
    })
    describe('isXZoomed', function() {
      var check = function(x0, x1, ox0, ox1, exp) {
        it(x0 + ', ' + x1 + ', ' + ox0 + ', ' + ox1 + ', ' + exp, function() {
          var sc = new D3ScalingContext({
            xDomain : [ox0, ox1],
            width : 1000
          });
          sc.xDomain(x0, x1);
          expect(sc.isXZoomed()).toBe(exp);
        })
      }
      check(10, 100, 10, 100, false);
      check(15, 100, 10, 100, true);
      check(10, 90, 10, 100, true);
      check(15, 90, 10, 100, true);
    })
  });
});
