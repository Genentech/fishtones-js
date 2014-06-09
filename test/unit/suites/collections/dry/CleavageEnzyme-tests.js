define(['underscore', 'fishtones/models/dry/CleavageEnzyme', 'fishtones/collections/dry/CleavageEnzymeDictionary'], function(_, CleavageEnzyme, dicoCE) {

    return describe('CleavageEnzyme', function() {
        // console.log('PIPO loaded?', RichSequence);
        describe('simple bean', function() {
            // console.log('PIPO OPUET', RichSequence)
            var ce = new CleavageEnzyme({
                name : 'pipoTryspin',
                rule : '(?:[RK]|.+?(?:[RK]|$))(?=[^P]|$)'
            });

            it('rule changed from string to Regexp', function() {
                expect(_.isString(ce.get('name'))).toBe(true);
                expect(_.isString(ce.get('rule'))).toBe(false);
                expect(ce.get('rule') instanceof RegExp).toBe(true);
            });
            it('capture peptides', function() {
                var seq = 'AAAKBBBRCCCKRDDDKPEEERFFF';
                var pepts = ce.cleave(seq);
                expect(pepts).toEqual(['AAAK', 'BBBR', 'CCCK', 'R', 'DDDKPEEER', 'FFF']);
            });
        });
        describe('sequence cleavages', function() {
            var checkCleave = function(cename, seq, expected) {
                it(seq + '/' + cename + ' -> '+expected, function() {
                    var ce = dicoCE.get(cename);
                    expect(ce).not.toBeUndefined()
                    expect(ce.cleave(seq)).toEqual(expected);
                });
            };
            checkCleave('trypsin', 'AAAKBBBRCCCKRDDDKPEEERFFF', ['AAAK', 'BBBR', 'CCCK', 'R', 'DDDKPEEER', 'FFF']);
            checkCleave('trypsin', 'KAKA', ['K', 'AK', 'A']);
            checkCleave('trypsin', 'KKR', ['K', 'K', 'R']);
            checkCleave('trypsin', 'KKRP', ['K', 'K', 'RP']);
            checkCleave('arg-c', 'AAAKBBBRCCCKRDDDKPEEERFFF', ['AAAKBBBR', 'CCCKR', 'DDDKPEEER', 'FFF']);
            checkCleave('chymotrypsin', 'AAAKBBBRCCCKRDDDKPEEERFFF', ['AAAKBBBRCCCKRDDDKPEEERF','F','F']);
            checkCleave('chymotrypsin', 'AAAFBBBRLCCKRWDDWPEEERYZZ', ['AAAF', 'BBBRL', 'CCKRW', 'DDWPEEERY', 'ZZ' ]);
        });
        describe('dictionary', function() {
            // console.log('PIPO OPUET', RichSequence)

            it("content size", function() {
                expect(dicoCE.size()).toBeGreaterThan(2)
            });
            it("get arg-c", function() {
                var ce = dicoCE.get('arg-c');
                expect(ce).not.toBeUndefined();
                expect(ce).not.toBeNull();
                expect(ce.get('name')).toEqual('arg-c');
                expect(ce.get('rule') instanceof RegExp).toBe(true);
            });
        });
    });
});
