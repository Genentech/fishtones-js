/*
 fetch a spectrum and render it asynchronously
 */
fishtones.wet.Config.set('wet.url.rest', 'data-demo');

new fishtones.wet.ExpMSMSSpectrum({id: 326})
    .fetch({
        success: function (sp) {
            //fill the text with the answer
            $('#target').find('div').text(
                    'precursor m/z=' + sp.get('precMoz').toFixed(4)
                    + ', size=' + sp.size()
            );
        }
    });

