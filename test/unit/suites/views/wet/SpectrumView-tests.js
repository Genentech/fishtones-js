define(['underscore', 'd3',  'fishtones/views/wet/SpectrumView', 'fishtones/models/wet/ExpMSMSSpectrum', 'mock/list-msmsspectra-HCD'],
    function (_, d3,  SpectrumView, ExpMSMSSpectrum, lSpectra) {
    var spectra = {};
    _.each(lSpectra, function (sp) {
        spectra[sp.scanNumber] = new ExpMSMSSpectrum(sp)
    })//529/362    340/335
    return describe('SpectrumView', function () {
        it('self mirror, zoomable', function () {
            var div = addDZDiv('SpectrumView', 'zoomable, mirror match', 400, 100);
            var view = new SpectrumView({
                el: div,
                model: spectra[340]
            });

            view.xZoomable()
            view.render();
        });


    })
});
