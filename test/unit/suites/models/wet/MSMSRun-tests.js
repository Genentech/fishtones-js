define(['jquery', 'underscore', 'Config', 'fishtones/models/wet/MSMSRun', 'fishtones/collections/wet/ExpMSMSSpectrumCollection'], function ($, _, config, MSMSRun, ExpMSMSSpectrumCollection) {
    return describe('MSMSRun', function () {
        beforeEach(function () {
            config.set('wet.url.rest', '/sinon')
        });

        it('fetch from id, basic', function (done) {
            var run = new MSMSRun({
                id: 8
            });
            run.fetch({
                success: function () {
                    expect(run.get('id')).toEqual('8');
                    expect(run.get('msms')).toBeUndefined()
                    done();
                }
            });
        });

        it('fetch from id, msms but no peaks', function (done) {
            var run = new MSMSRun({
                id: 8
            });
            run.fetch({
                success: function () {
                    run.readMsmsInfo({
                        success: function () {
                            expect(run.get('id')).toEqual('8');
                            expect(run.get('msms')).not.toBeUndefined()
                            expect(run.get('msms').size()).toBe(98)
                            done();
                        }
                    });
                }
            });
        });

        it('extract a sub ExpMSMSSpectrumCollection from ids', function (done) {
            var run = new MSMSRun({
                id: 8
            });
            run.fetch({
                success: function () {
                    run.readMsmsInfo({
                        success: function () {
                            var col = run.getMSMSSubCollection({
                                ids: [81127, 81132]
                            });
                            expect(col.size()).toBe(2);
                            done();
                        }
                    });
                }
            });
        });

        it('extract a sub ExpMSMSSpectrumCollection from scanNumbers', function (done) {
            var run = new MSMSRun({
                id: 8
            });
            run.fetch({
                success: function () {
                    run.readMsmsInfo({
                        success: function () {
                            var col = run.getMSMSSubCollection({
                                scanNumbers: [5030, 3498]
                            });
                            expect(col instanceof ExpMSMSSpectrumCollection)
                            expect(col.size()).toBe(2)
                            expect(col.models[1].get('retentionTime')).toBe(2214.01)
                            expect(col.models[1].get('mozs')).toBeUndefined();
                            done();
                        }
                    });
                }
            });
        });

        it('fetchMSMSFromScanNumbers: extract a sub ExpMSMSSpectrumCollection from scanNumbers with direct fecth', function (done) {
            var run = new MSMSRun({
                id: 8
            });
            run.fetch({
                success: function () {
                    run.readMsmsInfo({
                        success: function () {
                            run.fetchMSMSFromScanNumbers([5030, 3498], {
                                success: function (run, msmsCol) {
                                    var col = msmsCol;
                                    expect(col instanceof ExpMSMSSpectrumCollection)
                                    expect(col.size()).toBe(2)
                                    expect(col.models[1].get('retentionTime')).toBe(2214.01)
                                    expect(col.models[1].get('mozs')).not.toBeUndefined();
                                    done();
                                }
                            })
                        }
                    });
                }
            });
        });
        it('fetchMSMS: get msms information for a subset', function (done) {
            var run = new MSMSRun({
                id: 8
            });
            var col = null;
            run.fetch({
                success: function () {
                    run.readMsmsInfo({
                        success: function () {
                            run.fetchMSMS({
                                scanNumbers: [5030, 3498],
                                success: function (c) {
                                    var col = c;
                                    expect(col instanceof ExpMSMSSpectrumCollection)
                                    expect(col.size()).toBe(2)
                                    expect(col.models[1].get('retentionTime')).toBe(2214.01)

                                    //this time, mozs array is populated
                                    expect(col.models[1].get('mozs').length).toBe(20);
                                    done();
                                }
                            });
                        }
                    });
                }
            });
        });
    });
});
