define(['underscore', 'suites/services/wet/ExpServer', 'fishtones/models/wet/Injection', 'fishtones/views/wet/InjectionView'], function(_, expServer, Injection, InjectionView) {
    if (/PhantomJS/.test(navigator.userAgent)) {
        return;
    }

    return describe('InjectionView', function() {
        it('show', function(done) {
            var div = addDZDiv('wet-views', 'InjectionView', '45em', '4em');

            var inj = new Injection({
                id : 31
            });
            var view = new InjectionView({
                el : div,
                model : inj
            })
            inj.fetch({
                success : function(m) {
                    expect($(view.el).html()).toMatch(/Tolerance/);
                    done();
                }
            });

        })
        it('hide name and runName', function(done) {
            var div = addDZDiv('wet-views', 'InjectionView', '45em', '4em');

            var inj = new Injection({
                id : 31
            });

            div.append('<div class="ip"></div><div><span class="message"/></div>')

            var view = new InjectionView({
                el : div.find('.ip'),
                model : inj,
                hide : ['name', 'runName']
            })

            var msg = div.find('.message');
            inj.on('changeInstrumentParams', function(changes) {
                msg.text(msg.text() + '. ['+ inj.get('instrumentParams').get(_.keys(changes)[0]) +']')
            })
            inj.fetch({
                success : function(m) {
                    inj.get('instrumentParams').on('change', function() {
                        msg.text(msg.text() + '|')
                    })
                    expect($(view.el).html()).toMatch(/Tolerance/);
                    done();

                }
            });
        })
    });

});
