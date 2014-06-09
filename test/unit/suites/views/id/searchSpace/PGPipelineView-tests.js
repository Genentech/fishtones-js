define(['underscore', 'suites/services/wet/ExpServer', 'fishtones/models/id/searchSpace/PGPipeline', 'fishtones/views/id/searchSpace/PGPipelineView', 'fishtones/views/id/searchSpace/PGPipelineStepsSelector'], function(_, expServer, PGPipeline, PGPipelineView, PGPipelineStepsSelector) {
    return describe('PGPipelineStepsSelector', function() {
        it('straight render', function() {
            var div = addDZDiv('ProteinSearchSpace', 'form', 400, 450);

            var divSel = $('<div>');
            var divPipe = $('<div>');
            var divTxt = $('<div>');

            div.append(divSel);
            div.append(divPipe);
            div.append(divTxt);

            var pipeline = new PGPipeline();
            pipeline.setCallback(function(pp) {
                divTxt.html(pp.toString())
            });
            var viewSel = new PGPipelineStepsSelector({
                el : divSel,
                pipeline : pipeline
            });
            var viewPipe = new PGPipelineView({
                el : divPipe,
                model : pipeline
            });
            viewSel.render()
            viewPipe.render()
        });
    })
});
