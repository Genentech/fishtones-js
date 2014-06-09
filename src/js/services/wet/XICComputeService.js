/**
 * extract AUC and this kind oft things
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define([ 'underscore', '../../utils/MathUtils'], function(_, mathUtils) {
    var XICComputeService = function() {
        var self = this;
    };

    /**
     * build a XICClip based on xic with retentionTimes in the window
     */
    XICComputeService.prototype.auc = function(xic, options) {
        var self = this;
        
        return mathUtils.integrate(xic.get('retentionTimes'), xic.get('intensities'))
    };
    return new XICComputeService();
});
