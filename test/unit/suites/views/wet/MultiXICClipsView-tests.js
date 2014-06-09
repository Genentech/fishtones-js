define(['underscore', 'suites/services/wet/ExpServer', 'fishtones/services/dry/MassBuilder', 'fishtones/models/wet/Injection', 'fishtones/services/wet/XICClipperFactory', 'fishtones/collections/wet/XICCollection', 'fishtones/views/wet/MultiXICClipsView'], function (_, expServer, massBuilder, Injection, xicClipperFactory, XICCollection, MultiXICClipsView) {

    return describe('MultiXICClipsView', function () {
        describe('shoot', function () {
            it('one single', function (done) {
                var height = 250;
                var width = 600;
                var div = addDZDiv('MultiXICClipsView', 'shoot', width, height);

                var inj = new Injection({
                    id: 31
                });
                var clips = new XICCollection();
                inj.fetch({
                    success: function () {
                        _.each([408.732335809812, 411.248027309812], function (m) {
                            inj.chromatoXic(m, {
                                charge: 2
                            }, function (x) {
                                clips.add(x);
                                if (clips.length == 2) {
                                    var xicClips = xicClipperFactory.clip(clips, 750, 830)
                                    var pcmx = new MultiXICClipsView({
                                        el: div,
                                        model: xicClips
                                    })
                                    pcmx.render();
                                    done();
                                }
                            });
                        });
                    }
                });
            });
        });
    });
});
