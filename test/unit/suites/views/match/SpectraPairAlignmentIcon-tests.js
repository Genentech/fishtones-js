define(['underscore', 'd3', 'fishtones/models/match/SpectraPairAlignment', 'mock/list-msmsspectra-HCD', 'fishtones/views/match/SpectraPairAlignmentIcon', 'fishtones/models/wet/ExpMSMSSpectrum'], function(_, d3, SpectraPairAlignment, lSpectra, SpectraPairAlignmentIcon, ExpMSMSSpectrum) {
    return describe('SpectraPairAlignmentIcon', function() {
        var spectra = {};
        _.each(lSpectra, function(sp) {
            spectra[sp.scanNumber] = new ExpMSMSSpectrum(sp)
        })//529/362    340/335


        it('self mirror', function() {
            var div = addDZDiv('SpectraPairAlignment', 'mirror', 200, 50);
            var alg = new SpectraPairAlignment({
                spectrumA : spectra[340],
                spectrumB : spectra[340]
            })

            var view = new SpectraPairAlignmentIcon({
                el : div,
                model : alg,
                height : 50,
                width : 200,
                maxPeaks: 50
            });

            expect(view.height()).toBe(50)
            expect(view.width()).toBe(200)

            view.render();
        }); 
        it('335-340, 50 peaks', function() {
            var div = addDZDiv('SpectraPairAlignment', '335-340, 50 most intense peaks', 200, 50);
            var alg = new SpectraPairAlignment({
                spectrumA : spectra[340],
                spectrumB : spectra[335]
            })

            var view = new SpectraPairAlignmentIcon({
                el : div,
                model : alg,
                height : 50,
                width : 200,
                maxPeaks: 50
            });

            expect(view.height()).toBe(50)
            expect(view.width()).toBe(200)

            view.render();
        }); 
      it('335-340, 20 peaks', function() {
            var div = addDZDiv('SpectraPairAlignment', '335-340, 20 most intense peaks', 200, 50);
            var alg = new SpectraPairAlignment({
                spectrumA : spectra[340],
                spectrumB : spectra[335]
            })

            var view = new SpectraPairAlignmentIcon({
                el : div,
                model : alg,
                height : 50,
                width : 200,
                maxPeaks: 20
            });

            expect(view.height()).toBe(50)
            expect(view.width()).toBe(200)

            view.render();
        });     })
}); 
