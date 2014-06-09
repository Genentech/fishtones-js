define(['fishtones/services/utils/DataCollector'], function(DataCollector) {
    if (/PhantomJS/.test(navigator.userAgent)) {
        return;
    }
    return describe('DataCollector', function() {
        var checkDCContent = function(dc, text) {
            var checked = null;
            dc.read(function(c) {
                checked = c;
            });
            waitsFor(function() {
                return checked != null
            })
            runs(function() {
                expect(checked).toEqual(text);
            });

        };

        it("new instance", function() {
            var dc = new DataCollector({
                name : 't1'
            })
            expect( dc instanceof DataCollector).toBe(true)

            dc.whenReady(function() {
                expect(dc.fileEntry).not.toBeUndefined();
            });
        });

        it("single write", function(done) {
            var dc = new DataCollector({
                name : 't2'
            });
            var written = false;
            dc.append('pipo', function() {
                written = true
            });
            waitsFor(function() {
                return written;
            }, 'should have written', 3000);

            runs(function() {
                checkDCContent(dc, 'pipo')
            });
        })
        it("size", function() {
            var dc = new DataCollector({
                name : 't2'
            });
            var n = null;
            dc.append('pipo', function() {
                setTimeout(function() {
                    dc.size(function(s) {
                        n = s;
                    }), 200
                });
            });
            waitsFor(function() {
                return n != null;
            }, 'should have written', 3000);

            runs(function() {
                expect(n).toEqual(4)
            });
        })
        it("clear", function() {
            var dc = new DataCollector({
                name : 'tclear'
            });
            var step = 0;
            dc.append('pipooo', function() {
                step++;
            });
            waitsFor(function() {
                return step == 1;
            }, 'step 1', 3000);

            runs(function() {
                checkDCContent(dc, 'pipooo')
            });

            setTimeout(function() {
                dc.append('pouet', function() {
                    step++;
                });
            }, 200);

            waitsFor(function() {
                return step == 2;
            }, 'step 2', 3000);

            runs(function() {
                checkDCContent(dc, 'pipooopouet')

                setTimeout(function() {
                    dc.clear(function() {
                        step++;
                    });
                }, 200);
            });

            waitsFor(function() {
                return step == 3;
            }, 'step 3', 3000);

            runs(function() {
                checkDCContent(dc, '')
            });

        })
        it("onChange callback", function() {
            var n = null;
            var dc = new DataCollector({
                name : 't2',
                onChange : function(d, args) {
                    n = args.length;
                }
            });
            dc.append('pipo');
            waitsFor(function() {
                return n != null;
            }, 'should have written', 3000);

            runs(function() {
                expect(n).toEqual(4)
            });
        })
        it("append on single instance", function() {
            var dc = new DataCollector({
                name : 't3'
            });
            var written = false;

            dc.append("Petzi\n");
            setTimeout(function() {
                dc.append("au pole nord", function() {
                    written = true
                });
            }, 200);
            waitsFor(function() {
                return written;
            }, 'should have written', 3000);

            runs(function() {
                checkDCContent(dc, "Petzi\nau pole nord");

            })
        })
        it("create:false", function() {
            var dc1 = new DataCollector({
                name : 'test-3'
            });
            var written = false;
            dc1.append("shack ", function() {
                var dc2 = new DataCollector({
                    name : 'test-3',
                    create : false
                });
                dc2.append("au pole sud", function() {
                    written = true
                });

            })
            waitsFor(function() {
                return written;
            }, 'should have written', 3000);

            runs(function() {
                checkDCContent(dc1, "shack au pole sud");
            })
        })
        it("doNotDuplicateHeader:true", function() {
            var dc = new DataCollector({
                name : 't4',
                doNotDuplicateHeader : true
            });
            var written = false;

            dc.append("x\ty\n1\t2\n");
            setTimeout(function() {
                dc.append("x\ty\n2\t3\n", function() {
                    written = true
                });
            }, 200);
            waitsFor(function() {
                return written;
            }, 'should have written', 3000);

            runs(function() {
                checkDCContent(dc, "x\ty\n1\t2\n2\t3\n");

            })
        });

    });
})
