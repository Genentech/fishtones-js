define(['underscore', 'd3', 'fishtones/models/dry/RichSequence', 'fishtones/models/match/PSMAlignment', 'mock/msms-exp-K27Ac', 'fishtones/views/match/PSMAlignmentTable'], function(_, d3, RichSequence, PSMAlignment, msmsK27Ac, PSMAlignmentTable) {

    return describe('PSMAlignmentTable', function() {

        var col = new PSMAlignmentCollection([{
            richSequence : new RichSequence().fromString('{Propionyl}K{Acetyl}SAPATGGVK{Propionyl}K{Propionyl}PHR'),
            expSpectrum : msmsK27Ac
        },{
            richSequence : new RichSequence().fromString('{Propionyl}K{Acetyl}SAPATGGVK{Propionyl}K{Propionyl}'),
            expSpectrum : msmsK27Ac
        },{
            richSequence : new RichSequence().fromString('PATGGVK{Propionyl}K{Propionyl}PHR'),
            expSpectrum : msmsK27Ac
        },]);
        
        col.setFragmentTol(300)

        it('PSMAlignmentTabDiv', function() {
            var div = addDZDiv('match-table', 'PSMAlignmentTable', '1600px', '800px');
            var spmaTable = new PSMAlignmentTable({el:div, model:col});
            spmaTable.render();
        })
    });
});
