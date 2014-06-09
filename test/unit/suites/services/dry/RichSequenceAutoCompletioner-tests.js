define(['underscore', 'fishtones/services/dry/RichSequenceAutoCompletioner'], function(_, RichSequenceAutoCompletioner) {

    return describe("RichSequenceAutoCompletioner", function() {
        var rsac = new RichSequenceAutoCompletioner();

        it('constructor', function() {
            expect( rsac instanceof RichSequenceAutoCompletioner).toBe(true);
        });

        describe('close curly', function() {
            var check = function(comment, txt, pos, expected) {
                it(comment + ': ' + txt.substring(0, pos) + '_' + txt.substring(pos), function() {
                    expect(rsac.closeCurly(txt, pos)).toBe(expected);
                });
            }
            check('end open', 'AAA{', 4, true)
            check('open middle', 'A{AA', 2, true)
            check('one close', 'A{A}A', 2, false)
            check('not close, but open/close further', 'A{A{A}', 2, true)
        })
        describe('replaceable', function() {
            var check = function(comment, txt, pos, expPrefix, expPosStart, expPosEnd) {
                var expTxt;
                if (expPrefix == null) {
                    expTxt = 'null'
                } else {
                    expTxt = '"' + expPrefix + '" [' + expPosStart + '-' + expPosEnd + ']'
                }
                it(comment + ': ' + txt.substring(0, pos) + '_' + txt.substring(pos) + ' -> ' + expTxt, function() {
                    var rep = rsac.replaceable(txt, pos)
                    if (expPrefix == null) {
                        expect(rep).toBeNull();
                        return
                    }
                    expect(rep.prefix).toBe(expPrefix);
                    expect(rep.posStart).toBe(expPosStart);
                    expect(rep.posEnd).toBe(expPosEnd);
                });
            }
            check('nothing end pos', 'ABCD', 4, null)
            check('nothing start pos', 'ABCD', 0, null)
            check('nothing middle pos', 'ABCD', 2, null)
            check('after open close', 'A{B}CD', 5, null)

            check('simple curly, end of word', 'A{Bbb}CD', 5, 'Bbb', 2, 5)
            check('simple curly, start of word', 'A{Bbb}CD', 2, '', 2, 5)
            check('simple curly, middle of word', 'A{Bbb}CD', 4, 'Bb', 2, 5)

            check('another open close curly before should not influence', 'X{xyz}A{Bbb}CD', 10, 'Bb', 8, 11)

            check('after comma, end of word', 'A{Dd,Bbb}CD', 8, 'Bbb', 5, 8)
            check('after comma, start of word', 'A{Dd,Bbb}CD', 5, '', 5, 8)
            check('after comma, middle of word', 'A{Dd,Bbb}CD', 7, 'Bb', 5, 8)

        })
        describe('modif list', function() {
            var check = function(comment, prefix, lexp) {
                it(comment + ': ' + prefix + ' -> [' + lexp+']', function() {
                    var l = rsac.getList(prefix)
                    expect(l.join(',')).toEqual(lexp.join(','))
                })
            }
            check('single modif, full name', 'Biotin', ['Biotin'])
            check('single modif, part name', 'Biot', ['Biotin'])
            check('single modif, wrong case', 'bioT', ['Biotin'])

            check('unexisting, empty list', 'SDFSDGSG', [])
            check('list', 'ac', ['Acetyl', 'Acetyl_heavy_Lys'])
            
            check('mass', 56, ['Propionyl','G>I','G>L','M>W','T>R'])
            check('impossible mass', 56000, [])
            
            

        })
    });
});
