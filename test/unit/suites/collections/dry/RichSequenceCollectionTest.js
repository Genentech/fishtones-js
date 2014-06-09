define(['fishtones/collections/dry/RichSequenceCollection'], function(RichSequenceCollection) {

    // console.log('PIPO loaded?', RichSequence);
    return describe('RichSequenceCollection', function() {
        // console.log('PIPO OPUET', RichSequence)

        it("just a creator", function() {
            var rsc = new RichSequenceCollection();
            expect(rsc.size()).toEqual()
        });
    });
});
