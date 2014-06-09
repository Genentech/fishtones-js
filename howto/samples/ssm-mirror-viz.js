/*
 read an MSRun and display 2 pair of aligned spectra
 */
fishtones.wet.Config.set('wet.url.rest', 'data-demo');

new fishtones.wet.MSMSRun({id: 42}).readMsmsInfo({
  success: function (run) {
    run.fetchMSMS({
      scanNumbers: [6867, 6931, 7717],
      success: function (msmsCol) {
        var showAlignment = function(target, idA, idB){
          var alg = new fishtones.match.SpectraPairAlignment({
            spectrumA: msmsCol.get(idA),
            spectrumB: msmsCol.get(idB)
          });

          var view = new fishtones.match.SpectraPairAlignmentView({
            el      : target,
            model   : alg,
            fragTol : 50,
            enhanced: true
          });

          view.xZoomable()
          view.render();
        }

        showAlignment('#ssm-mirror-a', 6867, 6931);
        showAlignment('#ssm-mirror-b', 6867, 7717);
      }
    })
  }})

