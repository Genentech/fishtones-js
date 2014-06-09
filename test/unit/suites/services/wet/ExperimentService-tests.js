define(['underscore', 'suites/services/wet/ExpServer', 'fishtones/services/wet/ExperimentService'], function(_, expServer, experimentService) {
    return describe('ExperimentService', function() {
        it('read all experiments', function(done) {
            experimentService.load({
                success : function() {
                    expect(experimentService.collection.size()).toEqual(2);
                    expect(experimentService.get('12')).not.toBeUndefined();
                    expect(experimentService.get('12').get('rtRange').max).toEqual(100);
                    done();
                }
            })
        });
    });

});
