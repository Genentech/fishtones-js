define(['underscore', 'suites/services/wet/ExpServer', 'fishtones/models/id/searchSpace/PGPipelineStepsDico'], function(_, expServer, pgPipelineStepsDico) {
    return describe('PGPipelineStepsDico', function() {
        it('service instance', function() {
            expect(pgPipelineStepsDico).not.toBeUndefined();
        });
        it('collection init', function() {
            expect(pgPipelineStepsDico.size()).toBe(6);
        });
        
        it('by category', function(){
           var byCat = pgPipelineStepsDico.byCategory(); 
           expect(_.size(byCat)).toBe(3)
           expect(_.size(byCat.varModif)).toBe(2);
        });
    })
});
