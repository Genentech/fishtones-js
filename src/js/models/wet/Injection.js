/*
 * an Injection handles one experimental run (MSRun), tolerances , name etc.
 * It is typically fecthed from a server.
 * Properties
 * * a name
 * * an MSMSRun
 * * an InstrumentParams
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define(['jquery', 'underscore', 'Backbone', 'Config', 'fishtones/utils/MathUtils', './InstrumentParams', './XIC', 'fishtones/collections/wet/ExpMSMSSpectrumCollection', 'fishtones/models/wet/MSMSRun'], function ($, _, Backbone, config, mathUtils, InstrumentParams, XIC, ExpMSMSSpectrumCollection, MSMSRun) {
    var Injection = Backbone.Model.extend({
            defaults: {
            },
            urlRoot: function () {
                return config.get('wet.url.rest') + '/injection';
            },
            urls: {
                chromatoXic: function () {
                    return config.get('wet.url.rest') + '/chromato/xic'
                }
            },
            initialize: function (options) {
            },
            /**
             * the set method needs to be slighlty overriden, beacause
             * - an instrumentParams attr should be cast into an actual InstrumentParams
             * - an runInfo attr shall be casted into an MSMSRun, evene if it does not contain much
             * @param {Object} attrs
             * @param {Object} options
             */
            set: function (attrs, options) {
                var self = this;
                //love that. argument can either be a map and an object or a key and a value
                if (_.isString(attrs)) {
                    var k = attrs;
                    attrs = {};
                    attrs[k] = options;
                    options = {};
                }
                //modify existing instrumment params
                if (attrs.instrumentParams && (!(attrs.instrumentParams instanceof InstrumentParams))) {
                    if (self.get('instrumentParams') instanceof InstrumentParams) {
                        self.get('instrumentParams').set(attrs.instrumentParams);
                        delete attrs.instrumentParams
                    } else {
                        attrs.instrumentParams = new InstrumentParams(attrs.instrumentParams);
                        //changing an embedded instrument params bubble the event...
                        attrs.instrumentParams.on('change', function (target, ctx) {
                            self.trigger('changeInstrumentParams', ctx.changes)
                        })
                    }
                }
                if (attrs.runInfo) {
                    attrs.run = new MSMSRun(attrs.runInfo)
                    delete attrs.runInfo
                }
                return Backbone.Model.prototype.set.call(self, attrs, options);
            },
            /**
             * ask for a XIC, enriched with MSMS for a given mass and callback on success
             * As the injection know the precursor tolerance (via the instrumentParams), mass is enough to get the XIC.
             * @param mass
             * @param options
             * @param callback a function called with the return xic. the call back can also be specified through the success options
             */
            chromatoXic: function (mass, options, callback) {
                var self = this;
                if (arguments.length < 3 && options != undefined) {
                    if (options.success != undefined) {
                        callback = options.success;
                    } else {
                        callback = options;
                        options = {};
                    }
                }

                var buildMsMsPointers = function (xicRT, xicIntens, msmsSpectra) {
                    return _.map(msmsSpectra, function (sp) {
                        var rt = sp.retentionTime;
                        var intens = mathUtils.interpolate(xicRT, xicIntens, rt)
                        return {
                            spectrum: sp,
                            retentionTime: rt,
                            intensity: intens
                        }
                    })
                }
                var url = self.urls.chromatoXic() + '/' + self.get('id') + '?m=' + mass + '&msms=true';
                if (options.charge) {
                    url += '&z=' + options.charge;
                }
                url += '&precTol=' + self.get('instrumentParams').get('precursorTol');
                $.getJSON(url, {}, function (data) {
                    var xic = new XIC($.extend({
                        mass: mass
                    }, options))
                    xic.set('id', self.get('id') + '_' + mass)

                    //backwards compatibility
                    if (data.expSpectra) {
                        var pointers = buildMsMsPointers(data.retentionTimes, data.intensities, data.expSpectra)
                        xic.set('msms', new ExpMSMSSpectrumCollection(_.pluck(pointers, 'spectrum')));
                        xic.set('msmsPointers', pointers);
                    } else {
                        var msms = new ExpMSMSSpectrumCollection(data.msms.expSpectra);
                        xic.set('msms', msms);

                        xic.set('msmsPointers', _.collect(_.zip(data.msms.spectraIds, data.msms.retentionTimes, data.msms.intensities), function (a, i) {
                            var sp = msms.get(a[0]);
                            return {
                                spectrum: sp,
                                retentionTime: a[1],
                                intensity: a[2]
                            }
                        }));
                    }

                    xic.set('retentionTimes', data.retentionTimes)
                    xic.set('intensities', data.intensities)

                    xic.set('injectionInfo', {
                        id: self.get('id'),
                        searchId: self.get('searchId'),
                        name: self.get('name')
                    });

                    callback(xic)
                });
            }
        })
        ;
    return Injection;
})
;
