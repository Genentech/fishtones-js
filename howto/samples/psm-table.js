/*
 align a theoretical peptide and an experimental spectrum
 and print the first 5 fragment matches in a table
 */
fishtones.wet.Config.set('wet.url.rest', 'data-demo');

var peptide = new fishtones.dry.RichSequence()
  .fromString('{Propionyl}K{Acetyl}SAPATGGVK{Propionyl}K{Propionyl}PHR');

var tbody = $('#target').find('tbody');
var tmpl = '<tr>' +
  '<td><%= theo.label %></td>' +
  '<td class="text-right"><%= theo.moz.toFixed(4) %></td>' +
  '<td class="text-right"><%= theo.series %></td>' +
  '<td class="text-right"><%= theo.pos %></td>' +
  '<td class="text-right"><%= exp.index %></td>' +
  '<td class="text-right"><%= exp.moz.toFixed(4) %></td>' +
  '</tr>';


new fishtones.wet.ExpMSMSSpectrum({id: 'K27Ac'})
  .fetch({
    success: function (sp) {
      var psm = new fishtones.match.PSMAlignment({
        richSequence: peptide,
        expSpectrum: sp
      });

      //take the first fragment matches only and append the in the list
      _.chain(psm.closerThanPPM(300))
        .first(5)
        .each(function (fragMatch) {
          tbody.append($(_.template(tmpl, fragMatch)));
        });
    }
  });
