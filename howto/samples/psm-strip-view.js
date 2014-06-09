/*
 align a theoretical peptide and an experimental spectrum
 and display the alignment in a grid view
 */
fishtones.wet.Config.set('wet.url.rest', 'data-demo');

var peptide = new fishtones.dry.RichSequence()
  .fromString('{Propionyl}K{Acetyl}SAPATGGVK{Propionyl}K{Propionyl}PHR');

new fishtones.wet.ExpMSMSSpectrum({id: 'K27Ac'})
  .fetch({
    success: function (sp) {
      var psm = new fishtones.match.PSMAlignment({
        richSequence: peptide,
        expSpectrum: sp
      });
      new fishtones.match.MatchMapSlimView({
        model: psm,
        el       : $('#target').find('#psm-viz'),
        tol      : 300,
        xZoomable: true,
        height   :30
      }).render();
    }
  });

