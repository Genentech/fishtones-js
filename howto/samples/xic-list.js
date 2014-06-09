/*
 fetch an MS/MS run, fetch MS/MS spectra info and display them in a table
 */
fishtones.wet.Config.set('wet.url.rest', 'data-demo');

var elTarget  = $('#target');
var elSummary = elTarget.find('span');
var elTBody   = elTarget.find('tbody');

var tmpl = '<tr><td><%= id %></td><td><%= scanNumber %></td>' +
  '<td><%= precMoz.toFixed(3)%></td>' +
  '<td><%= precCharge %>+</td></tr>';

new fishtones.wet.Injection({id: 31}).fetch({
  success: function (inj) {
    inj.chromatoXic(408.732335809812, {
      success: function (xic) {
        //add some xic root level information
        elSummary.text('xic.size()='+xic.size());

        //fill the list by looping on MS/MS spectra
        xic.get('msms').each(function (sp) {
          elTBody.append($(_.template(tmpl, {
            id        : sp.get('id'),
            scanNumber: sp.get('scanNumber'),
            precMoz   : sp.get('precMoz'),
            precCharge: sp.get('precCharge')
          })));
        })
      }
    })
  }}
);

