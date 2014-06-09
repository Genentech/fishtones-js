/*
 Computes intact masses with various charge states. Passing 'undefined' is equivalent to ask for MH
 */
var massBuilder = fishtones.dry.MassBuilder;
var peptide     = new fishtones.dry.RichSequence().fromString('PK{Acetyl}PTIDER');
var container   = $('#target').find('div.masses');
container.append('<div class="col-md-2 text-muted">' + peptide.toString() + '</div>');

[undefined, 1, 2, 3].forEach(function (z) {
    var mass = massBuilder.computeMassRichSequence(peptide, z);
    container.append('<div class="col-md-2 text-right">' + mass.toFixed(4) + '</div>');
})
