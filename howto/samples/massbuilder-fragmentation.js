/*
 Computes a theoretical spectrum and add the fragments in the table
 */
var massBuilder = fishtones.dry.MassBuilder;
var peptide     = new fishtones.dry.RichSequence().fromString('PK{Acetyl}PTIDER');
var spTheo      = massBuilder.computeTheoSpectrum(peptide);

var tbody       = $('#target').find('tbody');
var tmpl        = '<tr><td><%= label %></td><td class="text-right"><%= moz.toFixed(5) %></td><td class="text-right"><%= series %></td><td class="text-right"><%= pos %></td></tr>';

spTheo.get('peaks').forEach(function(peak){
    tbody.append(_.template(tmpl, peak));
})
