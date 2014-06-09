define(['underscore', 'suites/services/wet/ExpServer', 'fishtones/models/wet/Experiment', 'fishtones/models/wet/Injection', 'fishtones/services/wet/InjectionService', 'fishtones/views/wet/ExperimentForm', 'fishtones/views/wet/InjectionUpdateForm', 'fishtones/views/wet/InjectionNewForm'], function (_, expServer, Experiment, Injection, injectionService, ExperimentForm, InjectionUpdateForm, InjectionNewForm) {

    return describe('SampleForms', function () {
        beforeEach(function () {
            injectionService.load()
        })
        describe('ExperimentForm', function () {
            it('update', function (done) {
                var div = addDZDiv('wet-forms', 'ExperimentForm-update', '30em', '12em');
                var exp = new Experiment({
                    id: 8
                });

                var view = new ExperimentForm({
                    el: div,
                    model: exp
                })

                var ok = false;
                exp.fetch({
                    success: function () {
                        view.render();
                        done()
                    }
                });
            })
            it('create', function () {
                var div = addDZDiv('wet-forms', 'ExperimentForm-create', '30em', '8em');

                var exp = new Experiment()
                var view = new ExperimentForm({
                    el: div,
                    model: exp
                })
                view.render()
            });
        });
        describe('Injection Forms', function () {
            it('new', function () {
                var div = addDZDiv('wet-forms', 'InjectionNewForm', '30em', '22em');
                new InjectionNewForm({
                    el: div
                }).render()
            });
            it('update', function () {
                var div = addDZDiv('wet-forms', 'InjectionUpdateForm', '30em', '22em');
                var inj = new Injection({
                    id: 31
                })
                inj.fetch({
                    success: function () {
                        new InjectionUpdateForm({
                            el: div,
                            model: inj
                        }).render()

                    }
                })

            });
        });

    });
});
