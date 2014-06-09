/**
 * service to access all experiments
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define(['jquery', 'underscore', 'Backbone', 'Config', 'fishtones/collections/wet/ExperimentCollection'], function($, _, Backbone, config, ExperimentCollection) {
    var ExperimentService = function() {
        var self = this;
        self.collection = new ExperimentCollection();
    };

    /**
     *
     * @param {Object} options
     * success: call back passed with the collection
     */
    ExperimentService.prototype.load = function(options) {
        var self = this;
        options = $.extend({}, options);
        $.getJSON(config.get('wet.url.rest') + '/experiment', {}, function(data) {
            self.collection.add(data);
            if (options.success) {
                options.success(self.collection);
            }
        });
        return self;
    }
    ExperimentService.prototype.get = function(id) {
        return this.collection.get(id);
    }
    return new ExperimentService();
});
