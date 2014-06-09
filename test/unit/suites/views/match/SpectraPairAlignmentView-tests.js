define(['underscore', 'd3', 'fishtones/models/match/SpectraPairAlignment', 'mock/msms-exp-K27Ac', 'fishtones/views/match/SpectraPairAlignmentView', 'fishtones/models/wet/ExpMSMSSpectrum', 'mock/list-msmsspectra-HCD'], function(_, d3, SpectraPairAlignment, msmsK27Ac, SpectraPairAlignmentView, ExpMSMSSpectrum, lSpectra) {
    var spectra = {};
    _.each(lSpectra, function(sp) {
        spectra[sp.scanNumber] = new ExpMSMSSpectrum(sp)
    })//529/362    340/335
    return describe('SpectraPairAlignmentView', function() {
        it('self mirror', function() {
            var div = addDZDiv('SpectraPairAlignment', 'simple, mirror match', 200, 50);
            var alg = new SpectraPairAlignment({
                spectrumA : msmsK27Ac,
                spectrumB : msmsK27Ac
            })

            var view = new SpectraPairAlignmentView({
                el : div,
                model : alg,
                height : 50,
                width : 200
            });

            expect(view.height()).toBe(50)
            expect(view.width()).toBe(200)

            //view.xZoomable()
            view.render();
        });
        it('self mirror, zoomable', function() {
            var div = addDZDiv('SpectraPairAlignment', 'zoomable, mirror match', 400, 100);
            var alg = new SpectraPairAlignment({
                spectrumA : msmsK27Ac,
                spectrumB : msmsK27Ac
            })

            var view = new SpectraPairAlignmentView({
                el : div,
                model : alg
            });

            view.xZoomable()
            view.render();
        });

        it('s340-335', function() {
            var div = addDZDiv('SpectraPairAlignment', 'zoomable', 600, 300);
            var alg = new SpectraPairAlignment({
                spectrumA : spectra[340],
                spectrumB : spectra[335]
            })

            var view = new SpectraPairAlignmentView({
                el : div,
                model : alg
            });

            view.xZoomable()
            view.render();
        });

        it('s340-335, color peaks', function() {
            var div = addDZDiv('SpectraPairAlignment', 'zoomable, colorPeaks:true', 600, 300);
            var alg = new SpectraPairAlignment({
                spectrumA : spectra[340],
                spectrumB : spectra[335]
            })

            var view = new SpectraPairAlignmentView({
                el : div,
                model : alg,
                colorPeaks : true
            });

            view.xZoomable()
            view.render();
        });
        it('s340-335, bold match', function() {
            var div = addDZDiv('SpectraPairAlignment', 'zoomable, enhanced:true', 600, 300);
            var alg = new SpectraPairAlignment({
                spectrumA : spectra[340],
                spectrumB : spectra[335]
            })

            var view = new SpectraPairAlignmentView({
                el : div,
                model : alg,
                fragTol : 50,
                enhanced : true
            });

            view.xZoomable()
            view.render();
        });
        it('s340-335, bold match', function() {
            var div = addDZDiv('SpectraPairAlignment', 'zoomable, enhanced:true,maxPeaks:20,independentYScales:true', 600, 300);
            var alg = new SpectraPairAlignment({
                spectrumA : spectra[340],
                spectrumB : spectra[335]
            })

            var view = new SpectraPairAlignmentView({
                el : div,
                model : alg,
                fragTol : 50,
                enhanced : true,
                maxPeaks : 20,
                independentYScales:true
            });

            view.xZoomable()
            view.render();
        });
        it('s340-335, bold match and colored peaks', function() {
            var div = addDZDiv('SpectraPairAlignment', 'zoomable, enhanced:true, colorPeaks:true', 600, 300);
            var alg = new SpectraPairAlignment({
                spectrumA : spectra[340],
                spectrumB : spectra[335]
            })

            var view = new SpectraPairAlignmentView({
                el : div,
                model : alg,
                fragTol : 50,
                enhanced : true,
                colorPeaks : true
            });

            view.xZoomable()
            view.render();
        });
    })
});
