 define(['underscore', 'fishtones/models/dry/ProteinGraph', 'fishtones/views/dry/ProteinGraphView', 'mock/prot-graphes'], function(_, ProteinGraph, ProteinGraphView, mProtGraphes) {

    return describe('ProteinGraphView', function() {
        var pg = new ProteinGraph(mProtGraphes.PEPTIDE)
        it('conversion', function() {
            var view = new ProteinGraphView({
                model : pg
            });

            var d3g = view.d3graph;
            expect(d3g.nodes.length).toEqual(15);
            expect(d3g.links.length).toEqual(14);
        })
        it('straight', function() {
            var svg = addDZDiv('protein-graph', 'straight-peptide', '600', '200');
            var view = new ProteinGraphView({
                el : svg,
                model : pg
            });
            view.render();
        })
        it('K27 prop_d0', function() {
            var svg = addDZDiv('protein-graph', 'K27-prop_d0', '800', '200');
            var view = new ProteinGraphView({
                el : svg,
                model : new ProteinGraph(mProtGraphes.K27_prop_d0)
            });
            view.render();
        })
        it('K27 K27_methyl_acety_prop', function() {
            var svg = addDZDiv('protein-graph', 'K27_methyl_acety_prop', '800', '700');
            var view = new ProteinGraphView({
                el : svg,
                model : new ProteinGraph(mProtGraphes.K27_methyl_acety_prop)
            });
            view.render();
        })
    });
});
