define(['jquery', 'underscore', 'Config', 'suites/services/wet/ExpServer', 'fishtones/models/wet/Experiment', 'fishtones/services/wet/InjectionService'], function ($, _, config, expServer, Experiment, injectionService) {
    return describe('Experiment', function () {
        beforeEach(function () {
            config.set('wet.url.rest', '/sinon')
        });

        it('Experiment, fetch from id', function (done) {
            var exp = new Experiment({
                id: 8
            });
            exp.fetch({
                success: function () {
                    expect(exp.get('id')).toEqual(8);
                    var rtRange = exp.get('rtRange');
                    expect(rtRange.min).toBeCloseTo(0.1876, 0.0001)
                    expect(rtRange.max).toBeCloseTo(5400.68, 0.0001)
                    expect(exp.get('injections').size()).toEqual(2);
                    done();
                }
            });
        });
        it('add injection, re-fecth and count them', function (done) {
            var exp = new Experiment({
                id: 8
            });
            exp.fetch({
                success: function () {
                    injectionService.load({
                        success: function () {
                            exp.injections_add(injectionService.get(42), {
                                save: true,
                                success: function () {
                                    exp.fetch({
                                        success: function () {
                                            expect(exp.get('injections').size()).toEqual(3);
                                            done();
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            });
        });
    });
});
