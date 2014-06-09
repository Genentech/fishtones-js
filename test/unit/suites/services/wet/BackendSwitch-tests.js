define(['underscore', 'jquery', 'Config', 'jQueryCookie', 'fishtones/services/wet/BackendSwitch', 'fishtones/models/wet/ExpMSMSSpectrum', 'fishtones/views/wet/BackendSwitchView'],
    function(_, $, config, undef, backendSwitch, ExpMSMSSpectrum, BackendSwitchView) {

    return describe('BackendSwitch', function() {

        it('singleton exists', function() {
            expect(backendSwitch).not.toBeUndefined()
        })
        it('defult val', function() {
            expect(backendSwitch.val()).toEqual("GFY");
            expect(backendSwitch.url()).toEqual("/fishtones/backend/ms");
        });
        it('change val set url and cookie', function() {
            backendSwitch.val('STANDALONE');
            expect(backendSwitch.val()).toEqual("STANDALONE");
            expect(backendSwitch.url()).toEqual("/fishtones/backend/wet-access");

            expect($.cookie('backend_switch')).toEqual("STANDALONE");
        });

        it('switch val set the models urls', function() {
            backendSwitch.val('GFY');
            var sp = new ExpMSMSSpectrum()
            expect(sp.urlRoot()).toEqual("/fishtones/backend/ms/gfy-wet/msmsspectrum");

            backendSwitch.val('STANDALONE')
            sp = new ExpMSMSSpectrum()
            expect(sp.urlRoot()).toEqual("/fishtones/backend/wet-access/msmsspectrum");

        });

        it('clean out cookie - for next test to pass, back to standalone for other test...', function() {
            backendSwitch.val('STANDALONE')
            backendSwitch.clearCookie();
            expect(!$.cookie('backend_switch')).toBe(true);
            config.set('wet.url.rest', '/sinon')
        })
    });

    describe('BackendSwitchView', function() {
        var div;
        beforeEach(function() {
            if (div !== undefined) {
                return
            }
            div = addDZDiv('backend-switch', 'backend-switch', 300, 100);
            new BackendSwitchView({
                el : div,
                preventReload : true
            });
        })
        it('constructor', function() {
            var v = new BackendSwitchView();
            expect(v).not.toBeUndefined();
            expect( v instanceof BackendSwitchView).toBe(true);
            expect(v.model).toBe(backendSwitch);
        })
        // it('click changes model', function() {
            // // reload page on unit test is kind of llooping forever
            // var el = div.find('button[name=GFY]')
            // expect(el.size()).toBe(1);
            // expect(backendSwitch.val()).toEqual('STANDALONE');
// 
            // el.click();
// 
            // waitsFor(function() {
                // return backendSwitch.val() == 'GFY'
            // }, 'click effect', 200)
//             
            // runs(function() {
                // expect(backendSwitch.val()).toEqual('GFY');
            // })
        // });
        // it('model changes view', function() {
// 
            // var el = div.find('button.disabled');
            // expect(el.attr('name')).toEqual('GFY')
// 
            // backendSwitch.val('STANDALONE');
// 
            // el = div.find('button.disabled');
            // expect(el.attr('name')).toEqual('STANDALONE');
        // });
        it('clean out cookie - for next test to pass, back to standalone for other test...', function() {
            backendSwitch.val('STANDALONE')
            backendSwitch.clearCookie();
            expect(!$.cookie('backend_switch')).toBe(true);
            config.set('wet.url.rest', '/sinon')
        })
    });
});
