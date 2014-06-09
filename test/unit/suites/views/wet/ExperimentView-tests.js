define(['underscore', 'suites/services/wet/ExpServer', 'fishtones/models/wet/Experiment', 'fishtones/services/wet/ExperimentService', 'fishtones/views/wet/ExperimentView'], function(_, expServer, Experiment, experimentService, ExperimentView) {

    return describe('ExperimentView', function() {
            it('show', function(done) {
                var div = addDZDiv('wet-views', 'ExperimentView', '45em', '8em');
                var exp = new Experiment({
                    id : 8
                });
                var view = new ExperimentView({
                    el : div,
                    model : exp
                })

                exp.fetch({
                    success : function() {
                        done();
                    }
                });
            })
    });
});
