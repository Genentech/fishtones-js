define(['jquery', 'underscore', 'Config', 'fishtones/models/wet/Injection', 'fishtones/models/wet/InstrumentParams', 'fishtones/models/wet/ExpMSMSSpectrum', 'fishtones/models/wet/XIC'], function($, _, config, Injection, InstrumentParams, ExpMSMSSpectrum, XIC) {
    return describe('Injection', function() {
        beforeEach(function() {
            config.set('wet.url.rest', '/sinon')
        });

        it('Injection, fetch from id', function(done) {
            var inj = new Injection({
                id : 31
            });
            inj.fetch({
                success : function() {
                    expect(inj.get('id')).toEqual(31);
                    expect(inj.get('name')).toEqual('x-B');
                    expect(inj.get('instrumentParamsId')).toBeUndefined();
                    expect(inj.get('instrumentParams')).not.toBeUndefined();
                    expect(inj.get('instrumentParams') instanceof InstrumentParams).toBe(true);
                    done();
                }
            });
        });

        describe("chromato extraction", function() {
            var checkXic = function(descr, testCB) {
                it(descr, function(done) {
                    var inj = new Injection({
                        id : 31
                    });
                    inj.fetch({
                        success : function() {
                            inj.chromatoXic(408.732335809812, {
                                charge : 2,
                                success:function(x) {
                                    var xic = x;
                                    testCB(xic);
                                    done();
                                }
                            })
                        }
                    });
                });
            }
            checkXic('instanceof XIC', function(xic) {
                expect( xic instanceof XIC).toBe(true);
            });
            checkXic('default arguments', function(xic) {
                expect(xic.get('mass')).toEqual(408.732335809812);
            });
            checkXic('toJSON() also jsonify msms collection', function(xic) {
                var json = xic.toJSON()
                expect(xic.cid).not.toBeUndefined();
                expect(json.cid).toBeUndefined();
                expect(json.msms).not.toBeUndefined();
                expect(json.msms.length).toBe(9);

            });

            checkXic('injection', function(xic) {
                expect(xic.get('injectionInfo').id).toEqual(31);
                expect(xic.get('injectionInfo').name).toEqual('x-B');
            });
            checkXic('addtional params passed as options', function(xic) {
                expect(xic.get('charge')).toEqual(2);
            });

            checkXic('msmsPointers', function(xic) {
                //msmsPointers are 'where to disply the msms spectra on the chromato (mainly, we interpolate intensity on the ms1 scan)'
                expect(xic.get('msmsPointers')).not.toBeUndefined();
                expect(xic.get('msmsPointers').length).toEqual(9);
                expect(xic.get('msmsPointers')[2].spectrum.get('id')).toEqual(211606);
                expect(xic.get('msmsPointers')[2].retentionTime).toEqual(773.078);
                expect(xic.get('msmsPointers')[2].retentionTime).toEqual(xic.get('msmsPointers')[2].spectrum.get('retentionTime'));
                expect(xic.get('msmsPointers')[2].intensity).toEqual(3820980.499658616);
            });
            checkXic('peak list', function(xic) {
                expect(xic.get('retentionTimes').length).toEqual(628);
                expect(xic.get('intensities').length).toEqual(628);
            });

            checkXic('embedded msms', function(xic) {

                //msms spectra that fall ni the XIC
                expect(xic.get('msms').size()).toEqual(9);

                //unexisting msmsm
                var sp = xic.get('msms').get(9999);
                expect(sp).toBeUndefined();

                //existing msms
                sp = xic.get('msms').get(211606);
                expect(sp).not.toBeUndefined();
                expect( sp instanceof ExpMSMSSpectrum).toBe(true);
                expect(sp.size()).toEqual(128);
            })
        });
        describe("chromato extraction #8", function() {
            var checkXic = function(descr, testCB) {
                it(descr, function(done) {
                    var inj = new Injection({
                        id : 31
                    });
                    var xic;
                    inj.fetch({
                        success : function() {
                            inj.chromatoXic(408.732335809812, {
                                charge : 2
                            }, function(x) {
                                var xic = x;
                                testCB(xic);
                                done();
                            })
                        }
                    });
                });
            }
            checkXic('default arguments', function(xic) {
                expect(xic.get('mass')).toEqual(408.732335809812);
            });

        });
    })
});
