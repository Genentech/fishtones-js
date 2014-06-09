define(['fishtones/views/id/ProteinSearchSpaceView', 'fishtones/models/id/ProteinSearchSpace'], function(ProteinSearchSpaceView, ProteinSearchSpace) {
        return describe('ProteinSearchSpaceView', function() {
            it("raw form", function() {
                var div = addDZDiv('ProteinSearchSpace', 'form', 1000, 500);
                var pss = new ProteinSearchSpace();
                var v = new ProteinSearchSpaceView({
                    el : div,
                    model : pss,
                    submit:function(pss){
                        window.alert($.param(pss.toMap()))
                    }
                });

            })
        });
});
