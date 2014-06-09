define(['jquery', 'underscore', 'suites/services/wet/ExpServer', 'fishtones/models/wet/ExpMSMSSpectrum'], function ($, _, expServer, ExpMSMSSpectrum) {
    return describe('ExpServer', function () {
        function expectGet(url, callback) {
            $.get(url, function (d) {
                callback(d)
            });
        }

        it('ping', function (done) {
            expectGet('/sinon/ping', function (resp) {
                expect(resp).toMatch(/pong/);
                done();
            });
        });
        it('msmsspectrum, rest access', function (done) {
            expectGet('/sinon/msmsspectrum/326', function (resp) {
                expect(resp).not.toBeNull();
                expect(resp).not.toBeUndefined();
                expect(resp.id).toEqual(326);
                done();
            });
        });

        it('msmsspectrum, populated from msmsrun', function (done) {
            expectGet('/sinon/msmsspectrum/81123', function (resp) {
                expect(resp).not.toBeNull();
                expect(resp).not.toBeUndefined();
                expect(resp.id).toEqual(81123);
                expect(resp.scanNumber).toEqual(6634);
                done();
            });
        });
        xit('msmsspectrum, rest access,  is null', function (done) {
            expectGet('/sinon/msmsspectrum/99999', function (resp) {
                expect(resp).toBeNull();
                done();
            });
        });
        it('ms1scan, rest access', function (done) {
            expectGet('/sinon/ms1scan/14', function (resp) {
                expect(resp).not.toBeNull();
                expect(resp).not.toBeUndefined();
                expect(resp.id).toEqual(14);
                done();
            });
        });

        it('experiment, rest list access', function (done) {
            expectGet('/sinon/experiment', function (resp) {
                expect(resp).not.toBeNull();
                expect(resp).not.toBeUndefined();
                expect(resp.length).toEqual(2);
                expect(resp[0].id).not.toBeUndefined();
                done();
            });
        });

        describe('chromato', function () {
            it('31/408.732335809812', function (done) {
                expectGet('/sinon/chromato/xic/31?m=408.732335809812&msms=true', function (resp) {
                    expect(resp).not.toBeNull();
                    expect(resp).not.toBeUndefined();
                    expect(resp.msms.retentionTimes.length).toEqual(9);
                    done();
                });
            });
            it('31/411.248027309812', function (done) {
                expectGet('/sinon/chromato/xic/31?m=411.248027309812&msms=true', function (resp) {
                    expect(resp).not.toBeNull();
                    expect(resp).not.toBeUndefined();
                    expect(resp.msms.retentionTimes.length).toEqual(5);
                    done();
                });
            });
            it('8/408.732335809812', function (done) {
                expectGet('/sinon/chromato/xic/8?m=408.732335809812&msms=true', function (resp) {
                    expect(resp).not.toBeNull();
                    expect(resp).not.toBeUndefined();
                    expect(resp.msms.retentionTimes.length).toEqual(10);
                    done();
                });
            });
            it('31/411.248027309812', function (done) {
                expectGet('/sinon/chromato/xic/8?m=411.248027309812&msms=true', function (resp) {
                    expect(resp).not.toBeNull();
                    expect(resp).not.toBeUndefined();
                    expect(resp.msms.retentionTimes.length).toEqual(11);
                    done();
                });
            });
        });

        describe('mmsrun', function () {
            it('just raw information', function (done) {
                expectGet('/sinon/msmsrun/8', function (resp) {
                    expect(_.size(resp)).toBe(2);
                    done();
                });
            });
            it('all msms', function (done) {
                expectGet('/sinon/msmsrun/8?msms=true', function (resp) {
                    expect(_.size(resp)).toBe(3)
                    expect(_.size(resp.msmsSpectra)).toBe(98)
                    expect(_.size(resp.msmsSpectra[0].mozs)).toBe(20)
                    done();
                });
            });
            it('msms spectra, but no peaks', function (done) {
                expectGet('/sinon/msmsrun/8?msms=true&noPeaks=true', function (resp) {
                    expect(_.size(resp)).toBe(3)
                    expect(_.size(resp.msmsSpectra)).toBe(98)
                    expect(resp.msmsSpectra[0].mozs).toBeUndefined();
                    done();
                });
            });
        });
        describe('mmsrun/autocomplete', function () {
            it('partial', function (done) {
                expectGet('/sinon/msmsrun/autocomplete/name/n', function (resp) {
                    expect(_.size(resp)).toBe(3);
                    done();
                });
            });
        });
    });
});
