/**
 * service to access all injections
 * It provides a cache for already loaded injections
 /*
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define(['jquery', 'underscore', 'Backbone', 'Config', 'fishtones/collections/wet/InjectionCollection'], function($, _, Backbone, config, InjectionCollection) {
    var InjectionService = function() {
        var self = this;
        self.collection = new InjectionCollection();
    };

    /**
     * @param {Object} options
     * success: call back passed with the collection
     */
    InjectionService.prototype.load = function(options) {
        var self = this;
        options = $.extend({}, options);
        $.getJSON(config.get('wet.url.rest') + '/injection', {}, function(data) {
            self.collection.add(data);
            if (options.success) {
                options.success(self.collection);
            }
        });
        return self;
    }
    InjectionService.prototype.get = function(id) {
        return this.collection.get(id);
    }

    /**
     * return th elist, sorted by injection
     */
    InjectionService.prototype.list = function() {
        return _.sortBy(this.collection.models, function(inj) {
            return -inj.get('id');
        })
    }
    /**
     * return th elist, sorted by injection, filtered by a filter(inj) function
     */
    InjectionService.prototype.listFilteredBy = function(filter) {
        return _.chain(this.collection.models).filter(filter).sortBy(function(inj) {
            return -inj.get('id');
        }).value()
    }

    return new InjectionService();
});
