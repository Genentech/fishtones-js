/**
 * Indeed all the testing of XIC extraction and so happen into Injection-test suite
 */
define(['jquery', 'underscore', 'fishtones/models/wet/Injection', 'fishtones/services/wet/XICClipperFactory', 'fishtones/models/wet/XIC', 'fishtones/models/wet/XICClip', 'fishtones/collections/wet/XICCollection'], function($, _, Injection, xicClipperFactory, XIC, XICClip, XICCollection) {
    return describe('XICClipperFactory', function() {

        describe("XICClip extraction", function() {
            var checkXic = function(descr, rtMin, rtMax, testCB) {
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
                                var xicClip = xicClipperFactory.clip(xic, rtMin, rtMax)
                                testCB(xic, xicClip);
                                done();
                            })
                        }
                    });
                });
            }
            checkXic('clip exist and is instanceof XICClip', 0, 1000000, function(xic, xicClip) {
                expect(xicClip).not.toBeUndefined();
                expect(xicClip).not.toBeNull();
                expect( xicClip instanceof XICClip).toBe(true);

            });
            checkXic('RT range is defined', 750, 830, function(xic, xicClip) {
                expect(xicClip.get('rtRange').inf).toBe(750)
                expect(xicClip.get('rtRange').sup).toBe(830)
            });
            checkXic('rentenstion times are according to window', 750, 830, function(xic, xicClip) {
                expect(xic.size()).toBe(628)
                expect(xicClip.size()).toBe(31)
                expect(xicClip.get('retentionTimes').length).toBe(31)
                expect(xicClip.get('intensities').length).toBe(31)

                expect(_.min(xicClip.get('retentionTimes'))).toBeGreaterThan(749.9999999)
                expect(_.max(xicClip.get('retentionTimes'))).toBeLessThan(830.0000001)
            });
            checkXic('msmsspectra only between window', 750, 830, function(xic, xicClip) {
                expect(xic.get('msms').size()).toBe(9)
                expect(xicClip.get('msms').size()).toBe(2)

                var msmsRT = _.collect(xicClip.get('msms').models, function(msms) {
                    return msms.get('retentionTime')
                })
                expect(_.min(msmsRT)).toBeGreaterThan(749.9999999)
                expect(_.max(msmsRT)).toBeLessThan(830.0000001)
            });
            checkXic('toJSON() also jsonify msms collection (inherit method from XIC)', 750, 830, function(xic, xicClip) {
                var json = xicClip.toJSON()
                expect(xicClip.cid).not.toBeUndefined();
                expect(json.cid).toBeUndefined();
                expect(json.msms).not.toBeUndefined();
                expect(json.msms.length).toBe(2);
                expect(json.msms[0].cid).toBeUndefined();
            });
        });
        describe("XICClip array extraction", function() {
            it("array of 2", function(done) {
                var inj = new Injection({
                    id : 31
                });
                var clips = [];
                inj.fetch({
                    success : function() {
                        _.each([408.732335809812, 411.248027309812], function(m) {
                            inj.chromatoXic(m, {
                                charge : 2
                            }, function(x) {
                                clips.push(x);
                                var xicClips = xicClipperFactory.clip(clips, 750, 830)
                                if(xicClips.length==2) {
                                    expect(xicClips instanceof Array).toBe(true);
                                    expect(xicClips.length).toBe(2);
                                    done();
                                }
                            })
                        });
                    }
                });
            });

        });
        describe("XICClip from XICCollection extraction", function() {
            it("collection of 2", function(done) {
                var inj = new Injection({
                    id : 31
                });
                var clipCol = new XICCollection();
                inj.fetch({
                    success : function() {
                        _.each([408.732335809812, 411.248027309812], function(m) {
                            inj.chromatoXic(m, {
                                charge : 2
                            }, function(x) {
                                clipCol.add(x);
                                if(clipCol.length ==2){
                                    var xicClips = xicClipperFactory.clip(clipCol, 750, 830)
                                    expect( xicClips instanceof Array).toBe(true);
                                    expect(xicClips.length).toBe(2);
                                    done();
                                }
                            })
                        });
                    }
                });
            });
        });
    })
});
