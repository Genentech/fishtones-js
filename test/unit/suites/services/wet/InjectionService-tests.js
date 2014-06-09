define(['underscore', 'suites/services/wet/ExpServer', 'fishtones/services/wet/InjectionService'], function(_, expServer, injectiontService) {
    return describe('InjectiontService', function() {
        it('read all injections', function(done) {
            injectiontService.load({
                success : function() {
                    expect(injectiontService.collection.size()).toEqual(3);
                    expect(injectiontService.get('8')).not.toBeUndefined();
                    expect(injectiontService.get('8').get('name')).toEqual('x-A');
                    done();
                }
            });
        });
    });

});
