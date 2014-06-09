/*
 fetch an MS/MS run, load 3 fragmentation spectra based on scan numbers and display them
 */
fishtones.wet.Config.set('wet.url.rest', 'data-demo');

var elTarget = $('#target').find('div.row');

new fishtones.wet.MSMSRun({id: 8}).readMsmsInfo({
  success: function (run) {
    run.fetchMSMS({
      scanNumbers: [6634, 7091, 2303],
      //success get an ExpMSMSSpectrumCollection
      success: function (msmsCol) {
        msmsCol.each(function (msmsSpectrum) {
          //create a div container
          var div = $('<div style="height:150px;width:250px;float:left;padding-left:30px"></div>');
          elTarget.append(div);

          //render a SpectrumView
          new fishtones.wet.SpectrumView({
            el: div,
            model: msmsSpectrum
          }).render();
        });
      }
    });
  }
});