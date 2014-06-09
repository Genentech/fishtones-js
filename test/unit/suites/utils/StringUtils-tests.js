define(['underscore', 'fishtones/utils/StringUtils'], function(_, StringUtils) {

    return describe('StringUtils', function() {
        it('singleton exists', function() {
            expect(StringUtils).not.toBeUndefined()
        })
        describe("commonPrefix", function() {
            it('empty', function() {
                expect(StringUtils.commonPrefix([])).toEqual('')
            })
            it('one', function() {
                expect(StringUtils.commonPrefix(['abcdef'])).toEqual('')
            })
            it('mutliple with prefix', function() {
                expect(StringUtils.commonPrefix(['aaaabcdzzzzz', 'aaaghizzzzz', 'aaalmnzzzzz'])).toEqual('aaa')
            })
            it('mutliple without prefix', function() {
                expect(StringUtils.commonPrefix(['1aaaabcdzzzzz1', '2aaaghizzzzz2', '3aaalmnzzzzz3'])).toEqual('')
            })
        })
        describe("commonSuffix", function() {
            it('empty', function() {
                expect(StringUtils.commonSuffix([])).toEqual('')
            })
            it('one', function() {
                expect(StringUtils.commonSuffix(['abcdef'])).toEqual('')
            })
            it('mutliple with suffix', function() {
                expect(StringUtils.commonSuffix(['aaaabcdzzzzz', 'aaaghizzzzz', 'aaalmnzzzzz'])).toEqual('zzzzz')
            })
            it('mutliple without suffix', function() {
                expect(StringUtils.commonSuffix(['1aaaabcdzzzzz1', '2aaaghizzzzz2', '3aaalmnzzzzz3'])).toEqual('')
            })
        })
        describe("reduceCommons", function() {
            it('single string', function() {
                expect(StringUtils.reduceCommons(['abcd'])).toEqual({
                    prefix : '',
                    suffix : '',
                    diff : ['abcd']
                })
            })
            it('prefix only', function() {
                expect(StringUtils.reduceCommons(['aaaabcd', 'aaaghi'])).toEqual({
                    prefix : 'aaa',
                    suffix : '',
                    diff : ['abcd', 'ghi']
                })
            })
            it('all different', function() {
                expect(StringUtils.reduceCommons(['abcdefg', 'bcdefgh', 'cdefghi'])).toEqual({
                    prefix : '',
                    suffix : '',
                    diff : ['abcdefg', 'bcdefgh', 'cdefghi']
                })
            })
            it('suffix only', function() {
                expect(StringUtils.reduceCommons(['abcdzzzzz', 'ghizzzzz', 'lmnzzzzz'])).toEqual({
                    prefix : '',
                    suffix : 'zzzzz',
                    diff : ['abcd', 'ghi', 'lmn']
                })
            })
            it('prefix-suffix', function() {
                expect(StringUtils.reduceCommons(['aaaabcdzzzzz', 'aaaghizzzzz', 'aaalmnzzzzz'])).toEqual({
                    prefix : 'aaa',
                    suffix : 'zzzzz',
                    diff : ['abcd', 'ghi', 'lmn']
                })
            })
        })
    });
});
