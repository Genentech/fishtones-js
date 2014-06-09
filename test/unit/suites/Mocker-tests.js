define(['underscore', 'jstests/Mocker', 'mock/msms-exp-K27Ac'], function(_) {
    return describe('Mocker READ', function() {
        it("basic mocks", function() {
            expect(_.keys(Mocker.data).length).toBeGreaterThan(0);
            expect(Mocker.get('msms-exp-K27Ac')).not.toBeUndefined();
        });
    })
}); 
