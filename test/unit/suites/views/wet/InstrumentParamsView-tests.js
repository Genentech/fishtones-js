define(['underscore', 'suites/services/wet/ExpServer', 'fishtones/models/wet/InstrumentParams', 'fishtones/views/wet/InstrumentParamsView'], function (_, expServer, InstrumentParams, InstrumentParamsView) {
    if (/PhantomJS/.test(navigator.userAgent)) {
        return;
    }

    return describe('InstrumentParams', function () {
        it('show', function (done) {
            var div = addDZDiv('wet-views', 'InstrumentParams', '25em', '2em');

            var ip = new InstrumentParams({
                id: 2
            });
            var view = new InstrumentParamsView({
                el: div,
                model: ip
            })
            var ok = false;
            ip.fetch({
                success: function () {
                    expect($(view.el).children().length).not.toEqual(0);
                    done();
                }
            });
        })
        describe('modidy save the element', function () {
            xit("second view is also modified", function (done) {
                var div = addDZDiv('wet-views', 'InstrumentParams-mod', '25em', '2em');
                var div2 = addDZDiv('wet-views', 'InstrumentParams-mod-2', '25em', '2em');

                var ip = new InstrumentParams({
                    id: 2
                });
                var view = new InstrumentParamsView({
                    el: div,
                    model: ip
                })
                var view2 = new InstrumentParamsView({
                    el: div2,
                    model: ip
                })
                var ok = false;
                ip.fetch({
                    success: function () {
                        var e = $(view.el).find('input[name=precursorTol]');
                        e.val(43.7);
                        e.trigger('change');

                        expect(parseFloat($(view.el).find('input[name=precursorTol]').val())).toEqual(43.7)
                        setTimeout(function () {
                            var ip2 = new InstrumentParams({
                                id: 2
                            });
                            expect(ip2.get('precursorTol')).toBeUndefined();
                            var ok = false;
                            ip2.fetch({
                                success: function () {
                                    expect(ip2.get('precursorTol')).toEqual(43.7);
                                    done();
                                }
                            });
                        }, 100);
                    }
                });
//                waitsFor(function() {
//                    return $(view.el).find('input[name=precursorTol]').val() == 43.7
//                }, 3000, 'getting instrumentParams');
//                runs(function() {
//                });
            });
        })
    });

});
