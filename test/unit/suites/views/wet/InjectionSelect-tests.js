define(['underscore', 'suites/services/wet/ExpServer', 'fishtones/views/wet/InjectionSelect'], function (_, expServer, InjectionSelect) {

    return describe('InjectionSelect', function () {
        it('show', function (done) {
            var div = addDZDiv('wet-views', 'InjectionSelect', '20em', '8em');

            var view = new InjectionSelect({
                el: div,
                action: function (inj) {
                    div.append('<br/>selected injection ' + inj.get('name') + ' runid:', inj.get('run').get('id'));
                }
            });
            setTimeout(function () {
                expect($(view.el).find('option').length).not.toBe(0);
                done();
            }, 100);
        })
    });
});
