/*
 define a simple spectrum
 */
var sp = new fishtones.wet.ExpMSMSSpectrum({
    precMoz: 123.45,
    mozs: [10, 20, 30],
    intensities: [100, 200, 300],
    intensityRanks: [2, 0, 1]
});

$('#target').find('div').text(
        'precursor m/z=' + sp.get('precMoz').toFixed(4)
        + ', size=' + sp.size()
);