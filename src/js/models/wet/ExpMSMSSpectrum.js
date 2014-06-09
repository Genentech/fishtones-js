/*
 * an experimental msms spectrum
 */

define(['jquery', 'underscore', 'Backbone', 'Config'], function($, _, Backbone, config) {
    var ExpMSMSSpectrum = Backbone.Model.extend({
        defaults : {
        },
        urlRoot : function() {
            return config.get('wet.url.rest') + '/msmsspectrum'
        },
        initialize : function() {
        },
        size : function() {
            var self = this;
            return (self.get('mozs') == undefined) ? 0 : self.get('mozs').length;
        },
        fetch : function(options) {
            var self = this;
            options = $.extend({}, options);
            var url = self.urlRoot() + '/' + self.id;
            if (options.params && options.params.fields === 'precursorOnly') {
                url += '?fields=precursorOnly';
            }
            $.getJSON(url, {}, function(m) {
                for (k in m) {
                    self.set(k, m[k])
                }
                if (options.success) {
                    options.success(self)
                };
            }).error(function(e) {
                var m = '';
                for (i in e) {
                    m += i + ': ' + e[i] + '  '
                }
                throw {
                    name : 'FetchingXHRException',
                    message : m
                }
            })
        },
        mozs : function() {
            return this.get("mozs");
        },
        /**
         * return a new Expe stectrum, with all fragment peaks shifted by a given value
         */
        shiftByMoz : function(delta) {
            var self = this;
            var sp = self.clone();
            sp.set('mozs', self.get('mozs').map(function(m) {
                return m + delta
            }))
            return sp;
        },

        /**
         * add all fragment from spectrum sp to the current one and create a new one
         * @param {Object} other
         */
        concatFragments : function(other) {
            var self = this;
            var sp = self.clone();

            var concatPeaks = _.zip(self.get('mozs').concat(other.get('mozs')), self.get('intensities').concat(other.get('intensities')), self.get('intensityRanks').concat(other.get('intensityRanks'))).sort(function(a, b) {
                return a[0] - b[0]
            });

            sp.set('mozs', _.pluck(concatPeaks, 0))
            sp.set('intensities', _.pluck(concatPeaks, 1))
            sp.set('intensityRanks', _.pluck(concatPeaks, 2))

            return sp;
        }
    });
    return ExpMSMSSpectrum;
});
