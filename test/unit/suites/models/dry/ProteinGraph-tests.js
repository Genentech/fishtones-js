define(['underscore', 'fishtones/models/dry/ProteinGraph', 'fishtones/services/dry/ProteinGraphService', 'mock/prot-graphes'], function (_, ProteinGraph, service, mProtGraphes) {
    return describe('ProteinGraph', function () {
        describe('ProteinGraphSerive', function () {
            it("get by sequence", function (done) {
                var pg;

                service.fetchBySequence('PEPTIDE', {
                    success: function (g) {
                        pg = g;
                        expect(pg.get('posRange').min).toEqual(0);
                        expect(pg.get('posRange').max).toEqual(6);
                        expect(pg.get('vertices').length).toEqual(15);

                        done()
                    }
                });
            });
        })
        describe('Gaph', function () {
            it("read from mock", function () {
                var pg = new ProteinGraph(mProtGraphes.PEPTIDE);
                expect(pg.get('posRange').min).toEqual(0);
                expect(pg.get('posRange').max).toEqual(6);
                expect(pg.get('vertices').length).toEqual(15);
            })
        });
    })
})
