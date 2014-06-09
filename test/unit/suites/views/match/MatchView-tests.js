define(['underscore', 'd3', 'fishtones/models/dry/RichSequence', 'fishtones/models/match/PSMAlignment', 'mock/msms-exp-K27Ac', 'fishtones/views/match/MatchMapSlimView', 'fishtones/views/match/MatchMapPQView', 'fishtones/views/match/MatchSpectrumView', 'fishtones/views/match/MatchGridValuesView'], function(_, d3, RichSequence, PSMAlignment, msmsK27Ac, MatchMapSlimView, MatchMapPQView, MatchSpectrumView, MatchGridValuesView) {

  return describe('MatchView', function() {
    var richSeq = new RichSequence().fromString('{Propionyl}K{Acetyl}SAPATGGVK{Propionyl}K{Propionyl}PHR')
    var spm = new PSMAlignment({
      richSequence : richSeq,
      expSpectrum : msmsK27Ac
    });
    var tol = 300;

    it('MatchMapSlimView', function() {
      var div = addDZDiv('match', 'MatchMapSlimView', 200, 20);

      var v_spma = new MatchMapSlimView({
        el:'#'+div.attr('id'),
        height : 20,
        tol : tol,
        model : spm
      });
      v_spma.render();
    })
    it('MatchMapPQView', function() {
      var div = addDZDiv('match', 'MatchMapPQView', 300, 80);
      var v = new MatchMapPQView({
        model : spm,
        el:'#'+div.attr('id'),
        height : 20,
        tol : tol
      });
      v.render();
      v.move(30, 50);
    })
    it('MatchSpectrumView-default', function() {
      var div = addDZDiv('match', 'MatchSpectrumView-default', 500, 200);

      var v_spma = new MatchSpectrumView({
        model : spm,
        el:'#'+div.attr('id'),
        height : 200,
        width : 500,
        tol : tol
      });
      v_spma.render();
    })
    it('MatchSpectrumView-large', function() {
      var div = addDZDiv('match', 'MatchSpectrum_large__xZoomable_trueView', 1000, 400);
      var v_spma = new MatchSpectrumView({
        model : spm,
        el:'#'+div.attr('id'),
        height : 400,
        width : 1000,
        tol : tol,
        xZoomable : true
      });
      v_spma.render();
    })
    it('MatchGridValuesView', function() {
      var div = addDZDiv('match', 'MatchGridValuesView', 400, 400);
      var v_spma = new MatchGridValuesView({
        model : spm,
        el :'#'+div.attr('id'),
        height : 400,
        width : 400,
        tol : tol
      });
      v_spma.render();
    })
  });
});
