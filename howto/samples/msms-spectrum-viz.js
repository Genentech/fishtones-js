/*
 fetch a spectrum and render it asynchronously
 */
fishtones.wet.Config.set('wet.url.rest', 'data-demo');
new fishtones.wet.ExpMSMSSpectrum({id: 326})
    .fetch({
        success: function (sp) {
            //set target id
            var view = new fishtones.wet.SpectrumView({
                el: '#msms-spectrum-viz',
                model: sp
            });
            //zooming functionality is not set by default
            view.xZoomable();
            //calls the rendering
            view.render();
        }
    });

