/*
 * An experiment contains mainly a list of injections (acquired samples)
 * Properties:
 * - injection: array of Injection
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define(['jquery', 'underscore', 'Backbone', 'Config', 'fishtones/models/wet/Injection', 'fishtones/collections/wet/InjectionCollection'], function ($, _, Backbone, config, Injection, InjectionCollection) {
    var Experiment = Backbone.Model.extend({
        defaults: {
        },
        urlRoot: function () {
            return config.get('wet.url.rest') + '/experiment'
        },
        initialize: function () {
            var self = this;
        },
        set: function (attrs, options) {
            var self = this;

            //love that. argument can either be a map and an object or a key and a value
            if (_.isString(attrs)) {
                var k = attrs;
                attrs = {};
                attrs[k] = options;
                options = {};
            }
            //modify existing Injection params
            if (attrs.injections && (!(attrs.injections instanceof InjectionCollection))) {
                if (self.get('injections') instanceof InjectionCollection) {
                    self.get('injections').reset();
                } else {
                    self.set('injections', new InjectionCollection());
                }
                self.get('injections').add(_.collect(attrs.injections, function (pinj) {
                    return new Injection(pinj)
                }));
                delete attrs.injections
            }
            return Backbone.Model.prototype.set.call(self, attrs, options);
        },
        /**
         * add an injection to the list.
         * @param inj
         * @param options
         * @return {Experiment}
         */
        injections_add: function (inj, options) {
            var self = this;
            options = $.extend({}, options);
            self.get('injections').add(inj)
            if (options.save) {
                var url = self.urlRoot() + '/' + self.get('id') + '/injections/' + inj.get('id');
                $.ajax(url, {
                    type: 'PUT',
                    success: options.success
                });
            }
            return self;
        }
    });
    return Experiment;
});
