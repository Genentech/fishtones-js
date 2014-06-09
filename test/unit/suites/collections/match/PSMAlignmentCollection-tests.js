define(['underscore', 'fishtones/models/dry/RichSequence', 'fishtones/collections/match/PSMAlignmentCollection', 'fishtones/models/match/PSMAlignment', 'fishtones/services/dry/MassBuilder', 'mock/msms-exp-K27Ac'], function(_, RichSequence, PSMAlignmentCollection, PSMAlignment, mb, sp) {

    return describe('PSMAlignmentCollection', function() {
            var col = new PSMAlignmentCollection();
            col.add(new PSMAlignment({
                richSequence :  new RichSequence().fromString('K{Acetyl,Propionyl}SAPATGGVK{Propionyl}K{Propionyl}PHR'),
                expSpectrum : sp
            }));
            col.add(new PSMAlignment({
                richSequence :  new RichSequence().fromString('K{Acetyl,Propionyl}SAPATGGVK{Propionyl}K{Propionyl}PHR'),
                expSpectrum : sp
            }));
            

            it('size', function() {
                expect(col.size()).toBe(2)
            });
    });
});
