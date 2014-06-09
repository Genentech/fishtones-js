/*
 fetch an MS/MS run, fetch MS/MS spectra info and display them in a table
 */
fishtones.wet.Config.set('wet.url.rest', 'data-demo');

var tbody = $('#target').find('tbody');
var tmpl  = '<tr><td><%= id %></td><td><%= scanNumber %></td>' +
    '<td><%= precMoz.toFixed(3)%></td>' +
    '<td><%= precCharge %>+</td></tr>';

new fishtones.wet.MSMSRun({id: 8}).readMsmsInfo({
  success: function (run) {
    //for each MS/MS spectrum, plot some information in a table line
    run.get('msms').each(function (sp) {
      tbody.append($(_.template(tmpl, {
        id          : sp.get('id'),
        scanNumber  : sp.get('scanNumber'),
        precMoz     : sp.get('precMoz'),
        precCharge  : sp.get('precCharge')
      })));
    })
  }
});
