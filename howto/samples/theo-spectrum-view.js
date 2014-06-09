/*
 Computes a theoretical spectrum & visualize it
 */
var peptide = new fishtones.dry.RichSequence().fromString('PK{Acetyl}PTIDER');
var spTheo  = fishtones.dry.MassBuilder.computeTheoSpectrum(peptide);

var v_theo = new fishtones.dry.TheoOnSequenceView({
    el   : $('#target'),
    model: spTheo
});
v_theo.render();
