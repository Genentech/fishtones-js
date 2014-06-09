define(['jquery', 'underscore', 'Config', 'fishtones/models/wet/InstrumentParams'], function($, _, config, InstrumentParams) {
    return describe('InstrumentParams', function() {
        beforeEach(function() {
            config.set('wet.url.rest', '/sinon')
        });

        it('InstrumentParams, fetch from id', function(done) {
            var sp = new InstrumentParams({
                id : 35
            });
            sp.fetch({
                success : function() {
                    expect(sp.get('id')).toEqual(35);
                    expect(sp.precursorTol).not.toBe(7)
                    done();
                }
            });
        });

    });
});
