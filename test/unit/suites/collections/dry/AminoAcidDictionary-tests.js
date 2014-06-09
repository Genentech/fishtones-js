define(['fishtones/collections/dry/AminoAcidDictionary'], function(dicoAA) {

    // console.log('PIPO loaded?', RichSequence);
    return describe('AminoAcidDictionary', function() {
        // console.log('PIPO OPUET', RichSequence)

        it("content size", function() {
            expect(dicoAA.size()).toEqual(20)
        });
        it("get Lysin", function() {
            var aa = dicoAA.get('K');
            expect(aa).not.toBeUndefined();
            expect(aa).not.toBeNull();
            expect(aa.get('code1')).toEqual('K');
            expect(aa.get('mass')).toBeCloseTo(128.094963, 0.00001);
            
        });
    });
});
