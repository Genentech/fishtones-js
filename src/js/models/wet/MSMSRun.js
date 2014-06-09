/*
 * an msmsrun can be one object, withe more or less information. this information can be populated at once with the msmsrun api or enhanced afterwards through the msmsspectrum getters:
 *  - just run info (id & name)
 *  - msmsSpectra data, but only at the precursor level (msms=true&noPeaks=true)
 *  - only the k most intense peaks (msms=true&maxPeaks=k)
 * -  all msms info (msms=true)
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define(['jquery', 'underscore', 'Backbone', 'Config', 'fishtones/collections/wet/ExpMSMSSpectrumCollection'], function($, _, Backbone, config, ExpMSMSSpectrumCollection) {
    var MSMSRun = Backbone.Model.extend({
        defaults : {
        },
        urlRoot : function() {
            return config.get('wet.url.rest') + '/msmsrun'
        },
        initialize : function() {
        },
        /**
         * apply the callback argument on the object, but only if or once the msms info has been loaded
         */
        withMsms : function(callback) {
            var self = this;
            if (self.get('msms')) {
                callback(self);
                return;
            }
            self.readMsmsInfo({
                success : callback
            })
        },
        /**
         *  load msms information, but no peak list
         * @param {Object} options
         */
        readMsmsInfo : function(options) {
            var self = this
            var url = self.urlRoot() + '/' + self.get('id') + '?msms=true&noPeaks=true';

            $.getJSON(url, {}, function(data) {
                self.set('msms', new ExpMSMSSpectrumCollection(data.msmsSpectra));
                if (options.success) {
                    options.success(self)
                }
            });

        },
        getMSMSSubCollection : function(options) {
            var self = this;
            if (options.ids) {
                return new ExpMSMSSpectrumCollection(_.collect(options.ids, function(id) {
                    self.get('msms').get(id);
                }));
            }
            if (options.scanNumbers) {
                var keys = {}
                _.each(options.scanNumbers, function(sn) {
                    keys["" + sn] = true;
                })
                return new ExpMSMSSpectrumCollection(self.get('msms').filter(function(sp) {
                    return keys["" + sp.get('scanNumber')];
                }));

            }
            console.error('must getMSMSSubCollection on ids or snaNumbers list of vals')

        },
        /**
         * get the MSMSSubCollections, then populate it with the msms peaklist and call a success callback if any
         */
        fetchMSMS : function(options) {
            var self = this;
            var col = self.getMSMSSubCollection(options);
            var colNoMSMS = col.filter(function(sp) {
                return sp.get('mozs') == null;
            });
            var n = colNoMSMS.length;
            if (n == 0 && options.success) {
                options.success(col)
                return;
            }
            var cpt = 0;
            _.each(colNoMSMS, function(sp) {
                sp.fetch({
                    success : function() {
                        cpt++;
                        if (cpt == n && options.success) {
                            options.success(col)
                            return;
                        }
                    }
                });
            })
        },
        /**
         * although the outcome is similar, this methid differs from fetchMSMS({scansNumbers:...}) in the sense that we don't need to load the full run to translate scan number into ids...
         * @param {Object} scanNumber
         * @param {Object} options
         */
        fetchMSMSFromScanNumbers : function(scans, options) {
            var self = this;
            var url = self.urlRoot() + '/' + self.get('id') + '/msmsfromscans/' + scans.join(',');
            
            $.getJSON(url, {}, function(data) {
                var col = new ExpMSMSSpectrumCollection(data);
                if (options.success) {
                    options.success(self, col)
                }
            });
        }
    });
    return MSMSRun;
});
