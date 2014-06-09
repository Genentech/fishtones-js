define(['jquery', 'underscore', 'Config', 'bootstrap', 'fishtones/views/wet/gfy/GFYMSRunSelector'], function($, _, config, bootstrap, GFYMSRunSelector){
    
    return describe('GFYMSRunSelector', function(){
                var div;
        beforeEach(function() {
            if (div !== undefined) {
                return
            }
            div = addDZDiv('backend-switch', 'backend-switch', 600, 500);
            new GFYMSRunSelector({
                el : div
            });
            config.set('wet.url.rest', '/sinon');
        })
        
        
       

        it('show one', function(){
            expect(0).toBe(0)     
        });
    })
});
