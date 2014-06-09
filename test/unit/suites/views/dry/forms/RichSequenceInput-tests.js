define(['underscore', 'fishtones/views/dry/forms/RichSequenceInput', 'fishtones/services/dry/MassBuilder'], function(_, RichSequenceInput, massBuilder) {

    return describe('RichSequenceInput', function() {

        it('default instanciante a richSequence model', function() {
            var rsi = new RichSequenceInput();
            expect(rsi.model).not.toBeUndefined();
        })
        it('RichSequenceInput widget', function() {
            var divMother = addDZDiv('input-form', 'RichSequenceInput', 'auto', 'auto');

            var divRSI = $('<div/>');
            divMother.append(divRSI);
            var divOutput = $('<div/>');
            divMother.append(divOutput);
            var divMass = $('<div/>');
            divMother.append(divMass);

            var rsi = new RichSequenceInput({
                el : divRSI
            });
            rsi.addCallbackValid(function(rss) {
                divOutput.html(rss.toString())
            })
            rsi.addCallbackInvalid(function(exc) {
                divOutput.html('Warning: ' + exc.message)
            })
            rsi.action = function(rss) {
                divMass.html('mass 2+=' + massBuilder.computeMassRichSequence(rss, 2))
            }
            rsi.render();
        })
        
        it('RichSequenceInput widget', function() {
            var div = addDZDiv('input-form', 'RichSequenceInput no button', 'auto', 'auto');
            var rsi = new RichSequenceInput({
                el : div,
                hideButton: true,
                hideValidIndicator: false
            });
      
            rsi.render();
        })
    });
});
