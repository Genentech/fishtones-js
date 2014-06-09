define(['underscore', 'Backbone', 'jquery', 'd3', 'fishtones/views/utils/D3ScalingContext', 'fishtones/views/utils/Annotable', 'fishtones/models/dry/RichSequence', 'fishtones/models/match/PSMAlignment', 'mock/msms-exp-K27Ac', 'fishtones/views/match/MatchSpectrumView'],
    function (_, bb, $, d3, D3ScalingContext, Annotable, RichSequence, PSMAlignment, expSp, MatchSpectrumView) {
        var MockView = bb.View.extend({
            initialize: function (options) {
                var self = this;

                self.el = d3.select(self.el).append('svg').attr('height', '100%').attr('width', '100%');

                self.scalingContext = new D3ScalingContext({
                    xDomain: [100, 150],
                    width: options.width,
                    yDomain: [10000, 15000],
                    height: options.height
                })
                self.model = _.map(_.range(1, 10), function (i) {
                    return {
                        x: 5 * i + 100,
                        y: 10000 + 300 * i,
                        text: 'h' + i
                    }
                });
                self.setup();
            },
            setup: function () {
                var self = this;
                self.g = self.el.append('g')
                self.g.selectAll('text').data(self.model).enter().append('text').text(function (ft) {
                    return ft.text;
                })
                return self;
            },
            render: function () {
                var self = this;
                var x = self.scalingContext.x();
                var y = self.scalingContext.y()
                self.g.selectAll('text').attr('x', function (ft) {
                    return x(ft.x)
                }).attr('y', function (ft) {
                    return y(ft.y)
                }).attr('class', 'pipo');
                return self;
            }
        });

        return describe('Annotable', function () {
            it('MockView', function () {
                var div = addDZDiv('annotable', 'basic', 300, 100)
                var id = div.attr('id');
                var v = new MockView({
                    el: '#'+div.attr('id'),
                    height: 100,
                    width: 300
                });
                expect(v).not.toBeUndefined()
                v.render()
            });

            describe('set Annotable', function () {
                it('enable', function () {
                    var div = addDZDiv('annotable', 'x', 5, 5)
                    var id = div.attr('id');
                    var v = new MockView({
                        el: '#'+div.attr('id'),
                        height: 5,
                        width: 5
                    });
                    Annotable.enable(v);
                    expect(typeof (v.annotAdd)).toEqual('function')
                    expect(typeof (v.annotSize)).toEqual('function')
                    expect(typeof (v.annotClear)).toEqual('function')
                })
            });
            describe('annot list building', function () {
                it('addAnnot el', function () {
                    var div = addDZDiv('annotable', 'y1', 5, 5)
                    var id = div.attr('id');
                    var v = new MockView({
                        el: '#'+div.attr('id'),
                        height: 5,
                        width: 5
                    });
                    Annotable.enable(v);
                    v.annotAdd({
                        x: 120,
                        y: 10000 + 300 * 2,
                        text: 'aa1'
                    }).annotAdd({
                        x: 140,
                        y: 10000 + 300 * 4,
                        text: 'aa2'
                    }).annotAdd({
                        x: 150,
                        y: 10000 + 300 * 5,
                        text: 'aa3'
                    });
                    expect(v.annotSize()).toEqual(3)
                });
                it('addAnnot array', function () {
                    var div = addDZDiv('annotable', 'y2', 5, 5)
                    var id = div.attr('id');
                    var v = new MockView({
                        el: '#'+div.attr('id'),
                        height: 5,
                        width: 5
                    });
                    Annotable.enable(v);
                    v.annotAdd([
                        {
                            x: 120,
                            y: 10000 + 300 * 2,
                            text: 'aa1'
                        },
                        {
                            x: 140,
                            y: 10000 + 300 * 4,
                            text: 'aa2'
                        },
                        {
                            x: 150,
                            y: 10000 + 300 * 5,
                            text: 'aa3'
                        }
                    ]);
                    expect(v.annotSize()).toEqual(3)
                })
                it('addAnnot & clear', function () {
                    var div = addDZDiv('annotable', 'y3', 5, 5)
                    var id = div.attr('id');
                    var v = new MockView({
                        el: '#'+div.attr('id'),
                        height: 5,
                        width: 5
                    });
                    Annotable.enable(v);
                    v.annotAdd([
                        {
                            x: 120,
                            y: 10000 + 300 * 2,
                            text: 'aa1'
                        },
                        {
                            x: 140,
                            y: 10000 + 300 * 4,
                            text: 'aa2'
                        },
                        {
                            x: 150,
                            y: 10000 + 300 * 5,
                            text: 'aa3'
                        }
                    ]);
                    v.annotClear();
                    v.annotAdd({
                        x: 120,
                        y: 10000 + 300 * 2,
                        text: 'aa1'
                    })
                    expect(v.annotSize()).toEqual(1);
                })
            })
            describe('render annot', function () {
                it('render', function () {
                    var div = addDZDiv('annotable', 'render', 400, 200)
                    var id = div.attr('id');
                    var v = new MockView({
                        el: '#'+div.attr('id'),
                        width: 400,
                        height: 200
                    });
                    Annotable.enable(v);

                    v.annotAdd(_.map(v.model, function (d) {
                        return {
                            x: d.x,
                            y: d.y,
                            text: 'aa' + d.text
                        }
                    }));

                    v.render();
                })
            })
            describe('redner with zoomable', function () {
                it('d3 spectrum matche', function () {
                    var richSeq = new RichSequence().fromString('{Propionyl}K{Acetyl}SAPATGGVK{Propionyl}K{Propionyl}PHR')
                    var spm = new PSMAlignment({
                        richSequence: richSeq,
                        expSpectrum: expSp
                    });
                    var div = addDZDiv('annotable', 'MatchSpectrumView-default', 500, 200);
                    var id = div.attr('id');

                    var v_spma = new MatchSpectrumView({
                        model: spm,
                        el: '#'+div.attr('id'),
                        height: 200,
                        width: 500,
                        tol: 300
                    });

                    Annotable.enable(v_spma, {
                        appendTo: v_spma.svgsp
                    });
                    var annots = _.chain(_.zip(expSp.get('mozs'), expSp.get('intensities'), expSp.get('intensityRanks'))).filter(function (t) {
                        return t[2] < 8;
                    }).map(function (t) {
                        return {
                            x: t[0],
                            y: t[1],
                            text: t[2]
                        }
                    }).value();
                    v_spma.annotAdd(annots)

                    v_spma.render();
                });

            })
        });
    });
