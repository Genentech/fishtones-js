define(['fishtones/collections/dry/AASequenceDictionary'], function(dicoSeq) {

    // console.log('PIPO loaded?', RichSequence);
    return describe('AASequenceDictionary', function() {
        // console.log('PIPO OPUET', RichSequence)

        it("content size", function() {
            expect(dicoSeq.size()).toBeGreaterThan(5)
        });
        it("get H3.2", function() {
            var aaseq = dicoSeq.get('H3.2');
            expect(aaseq).not.toBeUndefined();
            expect(aaseq).not.toBeNull();
            expect(aaseq.get('name')).toEqual('H3.2');
            expect(aaseq.get('accessionCode')).toEqual('Q71DI3');
            expect(aaseq.get('sequence')).toEqual('MARTKQTARKSTGGKAPRKQLATKAARKSAPATGGVKKPHRYRPGTVALREIRRYQKSTELLIRKLPFQRLVREIAQDFKTDLRFQSSAVMALQEASEAYLVGLFEDTNLCAIHAKRVTIMPKDIQLARRIRGERA');
            expect(aaseq.size()).toEqual(136);
        });
    });
});
