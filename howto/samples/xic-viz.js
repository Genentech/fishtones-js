/*
 fetch an XIC and display it
 */
fishtones.wet.Config.set('wet.url.rest', 'data-demo');

new fishtones.wet.Injection({id: 42}).fetch({
    success: function (inj) {
      inj.chromatoXic(569.661535028812, {
        success: function (xic) {
          var v = new fishtones.wet.XICView({
            model: xic,
            el: '#xic-viz'
          });
          v.xZoomable()
          v.render();
        }
      });
    }
  }
);

