/**
 * Indeed all the testing of XIC extraction and so happen into Injection-test suite
 */
define(['jquery', 'underscore', 'fishtones/models/wet/Injection', 'fishtones/services/wet/XICComputeService'], function($, _, Injection, xicComputeService) {
    return describe('XICComputeService', function() {
        it('singleton exists', function(){
            expect(xicComputeService).not.toBeUndefined();
        });

        describe("AUC", function() {
            var checkXic = function(descr, testCB) {
                it(descr, function(done) {
                    var inj = new Injection({
                        id : 31
                    });
                    inj.fetch({
                        success : function() {
                            inj.chromatoXic(408.732335809812, {
                                charge : 2
                            }, function(x) {
                                var xic = x;
                                testCB(xic)
                                done();
                            })
                        }
                    });
                });
            }
            checkXic('total AUC', function(xic) {
                expect(xicComputeService.auc(xic)).toBeCloseTo(672667474.864, 0.01);
            });
        });
    })
});
