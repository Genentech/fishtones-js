/**
 * wrapp all exposed function handlers and prototypes
 *
 * there is some repetition and some order. But I cannot figure out what is happening with almond, which look like it does not interpret 'define' in some cassic way...
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

(function () {
    define('jquery-plus', ['jquery', 'bootstrap', 'typeahead', 'jQueryCookie'], function ($) {
        return $;
    });

    var exported = {
        wet: ['Config', 'fishtones/models/wet/ExpMSMSSpectrum', 'fishtones/collections/wet/ExpMSMSSpectrumCollection', 'fishtones/models/wet/MSMSRun', 'fishtones/models/wet/Injection', 'fishtones/models/wet/Experiment', 'fishtones/collections/wet/XICCollection', 'fishtones/views/wet/XICView', 'fishtones/views/wet/MultiXICView', 'fishtones/views/wet/XICMultiPaneView', 'fishtones/views/wet/SpectrumView'],
        dry: ['fishtones/models/dry/RichSequence', 'fishtones/services/dry/ImplicitModifier', 'fishtones/services/dry/MassBuilder', 'fishtones/services/dry/RichSequenceShortcuter', 'fishtones/collections/dry/ResidueModificationDictionary', 'fishtones/collections/dry/AminoAcidDictionary', 'fishtones/views/dry/forms/RichSequenceInput', 'fishtones/views/dry/TheoOnSequenceView'],
        match: ['fishtones/models/match/SpectraPairAlignment', 'fishtones/views/match/SpectraPairAlignmentView', 'fishtones/models/match/PSMAlignment', 'fishtones/views/match/MatchSpectrumView', 'fishtones/views/match/MatchGridValuesView', 'fishtones/views/match/MatchMapPQView', 'fishtones/views/match/MatchMapSlimView', 'fishtones/views/match/SpectraPairAlignmentIcon'],
        utils: ['fishtones/views/utils/D3ScalingContext', 'fishtones/utils/DeltaMass']
    }

    const classPaths = [];
    var all = [];
    var type2cat = {};

    ['wet', 'dry', 'match', 'utils'].forEach(function (cat) {
        var l = exported[cat];
        for (i in l) {
            var type = l[i];
            type2cat[type] = cat;
            all.push(type);
        }
    });

    var buildExport = function (_) {
        var args = Array.prototype.slice.call(arguments);
        var $ = args.shift();
        var exp = {}
        for (i in all) {
            var arg = args[i];
            var type = all[i]
            var simpleName = type.replace(/.*\//, '');
            var cat = type2cat[type];

            if (exp[cat] === undefined) {
                exp[cat] = {};
            }
            exp[cat][simpleName] = args[i];
        }
        exp.deps = {
            '$': $
        };
        return exp;
    };

    define([
        'jquery',
        'Config', 'fishtones/models/wet/ExpMSMSSpectrum', 'fishtones/collections/wet/ExpMSMSSpectrumCollection', 'fishtones/models/wet/MSMSRun', 'fishtones/models/wet/Injection', 'fishtones/models/wet/Experiment', 'fishtones/collections/wet/XICCollection', 'fishtones/views/wet/XICView', 'fishtones/views/wet/MultiXICView', 'fishtones/views/wet/XICMultiPaneView', 'fishtones/views/wet/SpectrumView',
        'fishtones/models/dry/RichSequence', 'fishtones/services/dry/ImplicitModifier', 'fishtones/services/dry/MassBuilder', 'fishtones/services/dry/RichSequenceShortcuter', 'fishtones/collections/dry/ResidueModificationDictionary', 'fishtones/collections/dry/AminoAcidDictionary', 'fishtones/views/dry/forms/RichSequenceInput', 'fishtones/views/dry/TheoOnSequenceView',
        'fishtones/models/match/SpectraPairAlignment', 'fishtones/views/match/SpectraPairAlignmentView', 'fishtones/models/match/PSMAlignment', 'fishtones/views/match/MatchSpectrumView', 'fishtones/views/match/MatchGridValuesView', 'fishtones/views/match/MatchMapPQView', 'fishtones/views/match/MatchMapSlimView', 'fishtones/views/match/SpectraPairAlignmentIcon',
        'fishtones/views/utils/D3ScalingContext', 'fishtones/utils/DeltaMass',
    ], buildExport);

})();
