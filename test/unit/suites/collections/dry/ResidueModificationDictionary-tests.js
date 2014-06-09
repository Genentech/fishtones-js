define(['fishtones/collections/dry/ResidueModificationDictionary'], function(dicoResMod) {

    // console.log('PIPO loaded?', RichSequence);
    return describe('ResidueModificationDictionary', function() {
        // console.log('PIPO OPUET', RichSequence)

        it("content size", function() {
            expect(dicoResMod.size()).toBeGreaterThan(520)
        });
        it("get Phospho", function() {
            var mod = dicoResMod.get('Phospho');
            expect(mod).not.toBeUndefined();
            expect(mod).not.toBeNull();
            expect(mod.get('name')).toEqual('Phospho');
            expect(mod.get('mass')).toBeCloseTo(79.966331, 0.00001);
            
        });
    });
});
