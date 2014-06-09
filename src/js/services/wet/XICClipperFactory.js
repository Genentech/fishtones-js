/*
 * builds an XIC Clip out of a XIC + retention time range
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define(['jquery', 'underscore', 'Backbone', 'Config', 'fishtones/models/wet/XICClip', 'fishtones/collections/wet/ExpMSMSSpectrumCollection'], function($, _, Backbone, config, XICClip, ExpMSMSSpectrumCollection) {
    var XICClipperFactory = function() {
        var self = this;
    };

    /**
     * build a XICClip based on xic with retentionTimes in the window
     * xic  can be either:
     * - one XIC
     * - oneXICCollection 
     * - Array of XIC
     */
    XICClipperFactory.prototype.clip = function(xic, rtInf, rtSup, options) {
        var self = this;
        
        if(xic instanceof Backbone.Collection){
            return self.clip(xic.models, rtInf, rtSup, options)
        }
        if(xic instanceof Array){
            return _.collect(xic, function(x){
                return self.clip(x, rtInf, rtSup, options)
            });
        }

        var clipped = xic.clone();
        var points = _.zip(xic.get('retentionTimes'), xic.get('intensities'))
        points = _.filter(points, function(p) {
            return p[0] >= rtInf && p[0] <= rtSup;
        })

        clipped.set('retentionTimes', _.pluck(points, 0))
        clipped.set('intensities', _.pluck(points, 1))
        clipped.set('rtRange', {
            inf : rtInf,
            sup : rtSup
        })
        clipped.set('msms', new ExpMSMSSpectrumCollection(clipped.get('msms').filter(function(msms) {
            var rt = msms.get('retentionTime');
            return rt >= rtInf && rt <= rtSup
        })))

        return new XICClip(clipped.attributes)
    };
    return new XICClipperFactory();
});
