/*
 fetch an XIC and display it, aigning MS/MS spectra with a targeted peptide
 */
fishtones.wet.Config.set('wet.url.rest', 'data-demo');

var peptide = new fishtones.dry.RichSequence()
    .fromString('{PIC}K{Trimethyl}SAPATGGVK{Propionyl}K{Propionyl}PHR');

new fishtones.wet.Injection({id: 42}).fetch({
    success: function (inj) {
      inj.chromatoXic(fishtones.dry.MassBuilder.computeMassRichSequence(peptide,3), {
        success: function (xic) {
          var v = new fishtones.wet.XICView({
            model       : xic,
            el          : '#xic-viz',
            richSequence:peptide
          });
          v.xZoomable()
          v.render();
        }
      });
    }
  }
);

