/*
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define(['underscore', 'jquery', 'Backbone'], function(_, $, bb) {
    var XHRHandler = bb.Model.extend({
        initialize : function(opts) {
            var self = this;
            self.xhrs = {}
        },
        takeOff : function(xhr) {
            this.xhrs[xhr] = new Date();
            this.trigger('change')
        },
        land : function(xhr) {
            delete this.xhrs[xhr];
            this.trigger('change')
        },
        count : function() {
            return _.size(this.xhrs)
            this.trigger('change')
        },
        attach : function() {
            var self = this;
            $(document).ajaxComplete(function(event, xhr, settings) {
                self.land(xhr);
            });
            $(document).ajaxError(function(event, xhr, settings) {
                self.land(xhr);
            });
            $(document).ajaxSend(function(event, xhr, settings) {
                self.takeOff(xhr);
            });
        }
    });

    return new XHRHandler();
});
