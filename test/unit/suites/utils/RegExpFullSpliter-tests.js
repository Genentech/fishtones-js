define(['underscore', 'fishtones/utils/RegExpFullSpliter'], function(_, RegExpFullSpliter) {

    return describe('RegExpFullSpliter', function() {
        it('default instance', function() {
            var refs = new RegExpFullSpliter();
            expect(refs).not.toBeNull();
            expect(refs).not.toBeUndefined();
        })
        it('split, with regexp as RegExp object', function() {
            var frags = new RegExpFullSpliter().split(/\w/, 'ABCDEF')
            expect(frags.length).toEqual(6)
        })
        it('split, with regexp as string', function() {
            var frags = new RegExpFullSpliter().split('\\w', 'ABCDEF')
            expect(frags.length).toEqual(6)
        })
        it('does not modify orignal regexp', function() {
            var re = /\w/
            var frags = new RegExpFullSpliter().split(re, 'ABCDEF')
            expect(re.global).toBe(false)
        })
        it('with capture pattern', function() {
            var frags = new RegExpFullSpliter().split(/(\w)(\d*)/, 'AB99CD5EF')
            expect(frags.length).toEqual(6)
            expect(frags[1][0]).toEqual('B99')
            expect(frags[1][1]).toEqual('B')
            expect(frags[1][2]).toEqual('99')
        })
        describe("throw:", function() {
            var check = function(comment, str, re) {
                var goCassePipe = function() {
                    new RegExpFullSpliter().split(re, str)
                }
                it(comment + ' "' + str + '" '+re, function() {
                    expect(goCassePipe).toThrow()
                });
            }
            check('middle', 'A9BC99E24', /\w\d+/)
            check('end', 'A9B11C99E24F', /\w\d+/)
        })

    });
});
