define(['underscore', 'fishtones/services/dry/MassBuilder', 'fishtones/models/dry/RichSequence', 'fishtones/views/dry/TheoOnSequenceView'], function(_, massBuilder, RichSequence, TheoOnSequenceView) {

    return describe('TheoSpectrumView', function() {
        var richSeq = new RichSequence().fromString('{Propionyl}K{Acetyl}SAPATGGVK{Propionyl}K{Propionyl}PHR')

        it('TheoOnSequenceView', function() {
            var div = addDZDiv('theo', 'TheoOnSequenceView', 'auto', 'auto');
            var v_theo = new TheoOnSequenceView({
                el : div,
                model : massBuilder.computeTheoSpectrum(richSeq)
            });
            v_theo.render();
        })
    });
}); 
