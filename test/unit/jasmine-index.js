requireJsConfig.baseUrl = '../../src/js';
requireJsConfig.paths['fishtones'] = '../js'
requireJsConfig.paths['fishtones-templates'] = '../templates'
requireJsConfig.paths.suites = '../../test/unit/suites';
requireJsConfig.paths.jstests = '../../test/unit';
requireJsConfig.paths.mock = '../../test/mocks';

requireJsConfig.paths.sinon = '../../test/lib/sinon-1.9.1'
//requireJsConfig.urlArgs = "bust=" + (new Date()).getTime();

requirejs.onError = function(err) {
    describe("require.js dep", function() {
        it(err.requireType + ': ' + err.requireModules, function() {
            expect(err).toBeNull()
        })
    });
}
var addShim = {
    sinon : {
        exports : 'sinon'
    }
}
for (n in addShim) {
    requireJsConfig.shim[n] = addShim[n];
}
requirejs.config(requireJsConfig);
var reqs = ['jquery', 'underscore', 'Config', 'sinon', 'suites/services/wet/ExpServer'];
reqs.push('suites/models/dry/RichSequence-tests');
reqs.push('suites/models/dry/AASequencePeptidePtr-tests');
reqs.push('suites/models/dry/ProteinGraph-tests');
reqs.push('suites/models/id/searchSpace/PGPipelineStepsDico-tests');

reqs.push('suites/collections/dry/AminoAcidDictionary-tests');
reqs.push('suites/collections/dry/AASequenceDictionary-tests');
reqs.push('suites/collections/dry/ResidueModificationDictionary-tests');
reqs.push('suites/collections/dry/CleavageEnzyme-tests');

reqs.push('suites/services/dry/MassBuilder-tests');
reqs.push('suites/services/dry/DeltaMassElucidator-tests');
reqs.push('suites/services/dry/ImplicitModifier-tests');
reqs.push('suites/services/dry/RichSequenceShortcuter-tests');
reqs.push('suites/services/dry/RichSequenceAutoCompletioner-tests');

reqs.push('suites/views/dry/TheoSpectrumView-tests');
reqs.push('suites/views/dry/ProteinGraphView-tests');
reqs.push('suites/views/dry/forms/RichSequenceInput-tests');


reqs.push('suites/models/match/PSMAlignment-tests');
reqs.push('suites/models/match/SpectraPairAlignment-tests');
reqs.push('suites/models/match/PeakListPairAlignment-tests');
reqs.push('suites/collections/match/PSMAlignmentCollection-tests');
reqs.push('suites/views/match/MatchView-tests');
reqs.push('suites/views/match/PSMAlignmentTable-tests');
reqs.push('suites/views/match/SpectraPairAlignmentView-tests');
reqs.push('suites/views/match/SpectraPairAlignmentIcon-tests');

reqs.push('suites/services/wet/ExpServer-tests');
reqs.push('suites/models/wet/ExpMSMSSpectrum-tests');
reqs.push('suites/models/wet/MSMSRun-tests');
reqs.push('suites/models/wet/InstrumentParams-tests');
reqs.push('suites/models/wet/Injection-tests');
reqs.push('suites/models/wet/Experiment-tests');
reqs.push('suites/services/wet/ExperimentService-tests');
reqs.push('suites/services/wet/InjectionService-tests');
reqs.push('suites/services/wet/XICClipperFactory-tests');
reqs.push('suites/services/wet/XICComputeService-tests');
reqs.push('suites/services/wet/BackendSwitch-tests');

reqs.push('suites/views/utils/D3ScalingContext-tests');
reqs.push('suites/views/utils/Favorizable-tests');
reqs.push('suites/views/utils/Annotable-tests');

reqs.push('suites/views/wet/SpectrumView-tests');
reqs.push('suites/views/wet/ChromatoView-tests');
reqs.push('suites/views/wet/InstrumentParamsView-tests');
reqs.push('suites/views/wet/InjectionView-tests');
reqs.push('suites/views/wet/ExperimentView-tests');
reqs.push('suites/views/wet/SampleForms-tests');
reqs.push('suites/views/wet/InjectionSelect-tests');
reqs.push('suites/views/wet/MultiXICClipsView-tests');
reqs.push('suites/views/wet/gfy/GFYMSRunSelector-tests');
reqs.push('suites/views/id/ProteinSearchSpaceView-tests');
reqs.push('suites/views/id/searchSpace/PGPipelineView-tests');

reqs.push('suites/utils/RegExpFullSpliter-tests');
reqs.push('suites/utils/MathUtils-tests');
reqs.push('suites/utils/StringUtils-tests');
reqs.push('suites/utils/DeltaMass-tests');

//deprecated
//reqs.push('suites/services/utils/DataCollector-tests');

