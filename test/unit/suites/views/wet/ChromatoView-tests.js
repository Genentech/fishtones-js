//define(['underscore', 'd3', 'suites/services/wet/ExpServer', 'fishtones/services/dry/MassBuilder', 'fishtones/models/wet/Injection', 'fishtones/models/dry/RichSequence', 'fishtones/collections/wet/XICCollection', 'fishtones/views/wet/XICView', 'fishtones/views/wet/MultiXICView', 'fishtones/views/wet/XICMultiPaneView', 'fishtones/views/utils/D3ScalingArea', 'fishtones/views/utils/D3ScalingContext'], function (_, d3, expServer, massBuilder, Injection, RichSequence, XICCollection, XICView, MultiXICView, XICMultiPaneView, D3ScalingArea, D3ScalingContext) {
define(['underscore', 'd3', 'suites/services/wet/ExpServer', 'fishtones/services/dry/MassBuilder', 'fishtones/models/wet/Injection', 'fishtones/models/dry/RichSequence', 'fishtones/collections/wet/XICCollection',
        'fishtones/views/wet/XICView', 'fishtones/views/wet/MultiXICView', 'fishtones/views/wet/XICMultiPaneView', 'fishtones/views/utils/D3ScalingArea',
        'fishtones/views/utils/D3ScalingContext'],
    function (_, d3, expServer, massBuilder, Injection, RichSequence, XICCollection, XICView, MultiXICView, XICMultiPaneView, D3ScalingArea, D3ScalingContext) {


        return describe('ChromatoView', function () {
            describe('XICView', function () {
                it('one single', function (done) {

                    var inj = new Injection({
                        id: 31
                    });
                    inj.fetch({
                        success: function () {

                            inj.chromatoXic(408.732335809812, {
                                charge: 2
                            }, function (xic) {
                                var height = 200;
                                var width = 800;
                                var div = addDZDiv('chromato', 'XICView (el is div)', width, height);

                                var scalingContext = new D3ScalingContext({
                                    xDomain: [0, _.max(xic.get('retentionTimes')) * 1.05],
                                    yDomain: [0, _.max(xic.get('intensities')) * 1.1],
                                    height: height,
                                    width: width
                                })

                                var richSeq = new RichSequence().fromString('T{Propionyl}K{Propionyl}QTAR')

                                var v = new XICView({
                                    model: xic,
                                    el: div,
                                    richSequence: richSeq,
                                    scalingContext: scalingContext
                                });
                                v.xZoomable()

                                v.render();
                                done();
                            })
                        }
                    });
                })
            });

            describe('MultiXICView', function () {
                it('two one the same line', function () {

                    var height = 200;
                    var width = 800;
                    var div = addDZDiv('chromato', 'MultiXICView', width, height);

                    var xicCol = new XICCollection()

                    var widget = new MultiXICView({
                        el: d3.select('#' + div.attr('id')).append('svg').attr('width', '100%').attr('height', '100%'),
                        model: xicCol,
                        yaxis: true
                    });

                    widget.xZoomable()

                    var inj = new Injection({
                        id: 31
                    });
                    var xic;
                    inj.fetch({
                        success: function () {
                            _.each(['T{Propionyl}K{Propionyl}QTAR', 'T{Propionyl:2H(5)}K{Propionyl}QTAR'], function (s, i) {
                                var richSeq = new RichSequence().fromString(s);
                                inj.chromatoXic(massBuilder.computeMassRichSequence(richSeq, 2), {
                                    charge: 2,
                                    richSequence: richSeq,
                                    target: i
                                }, function (x) {
                                    x.set('id', x.get('mass'));
                                    xicCol.add(x);
                                })
                            })
                        }
                    });
//                waitsFor(function () {
//                    return xicCol.size() == 2
//                }, 3000, 'building xic');
//                runs(function () {
//                    //widget.render();
//                })
                })
            });

            describe('XICMultiPaneView', function () {
                it('experiment chromatos', function () {

                    var height = 400;
                    var width = 800;
                    var div = addDZDiv('chromato', 'XICMultiPaneView', width, height);

                    var injIds = [31, 8];

                    var xicCol = new XICCollection();

                    var widget = new XICMultiPaneView({
                        el: d3.select('#' + div.attr('id')).append('svg').attr('width', '100%').attr('height', '100%'),
                        model: xicCol,
                        groupBy: function (xic) {
                            return xic.get('injectionInfo').id
                        },
                        getGroupName: function (xic) {
                            return xic.get('injectionInfo').name
                        },
                        retentionTimeSelectCallback: function (colXICClip, options) {
                            console.log('caught clipped XIC', colXICClip, options)
                        },
                        legend: true
                    });

                    _.each(['T{Propionyl}K{Propionyl}QTAR', 'T{Propionyl:2H(5)}K{Propionyl}QTAR'], function (s, i) {
                        var richSeq = new RichSequence().fromString(s);
                        var moz = massBuilder.computeMassRichSequence(richSeq, 2);
                        var mozs = [];
                        mozs[2] = moz;
                        xicCol.legends.add({
                            name: s,
                            masses: mozs
                        });
                    });

                    _.each(injIds, function (injId) {
                        var inj = new Injection({
                            id: injId
                        });
                        inj.fetch({
                            success: function () {
                                _.each(['T{Propionyl}K{Propionyl}QTAR', 'T{Propionyl:2H(5)}K{Propionyl}QTAR'], function (s, i) {
                                    var richSeq = new RichSequence().fromString(s);

                                    inj.chromatoXic(massBuilder.computeMassRichSequence(richSeq, 2), {
                                        charge: 2,
                                        richSequence: richSeq,
                                        target: i
                                    }, function (x) {
                                        xicCol.add(x);
                                    })
                                })
                            }
                        });
                    })

                    widget.render();
                })
            });
        });
});
