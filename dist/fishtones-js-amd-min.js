(function () {

/**
 * a singleton object that will handle global scope configuration (path to wet info rest service etc..)
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define('Config',['underscore'], function (_) {
    _.templateSettings = {
        interpolate: /\{\{(.+?)\}\}/g
    };

    Config = function () {
        var self = this;
        self.data = {}
    }
    Config.prototype.set = function (key, value) {
        this.data[key] = value;
        return this;
    }
    Config.prototype.get = function (key) {
        return this.data[key];
    }

    return new Config();
});

/*
 * an experimental msms spectrum
 */

define('fishtones/models/wet/ExpMSMSSpectrum',['jquery', 'underscore', 'Backbone', 'Config'], function($, _, Backbone, config) {
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

/*
 * just a collection of ExpMSMSSpectrum 
 * 
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */


define('fishtones/collections/wet/ExpMSMSSpectrumCollection',['Backbone', 'fishtones/models/wet/ExpMSMSSpectrum', ], function(Backbone, ExpMSMSSpectrum) {
    var ExpMSMSSpectrumCollection = Backbone.Collection.extend({
        model : ExpMSMSSpectrum,
        defaults : {
        },
        initialize : function(options) {
            var self = this;
        }
    });
    return ExpMSMSSpectrumCollection;
});

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

define('fishtones/models/wet/MSMSRun',['jquery', 'underscore', 'Backbone', 'Config', 'fishtones/collections/wet/ExpMSMSSpectrumCollection'], function($, _, Backbone, config, ExpMSMSSpectrumCollection) {
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

/**
 * basic math utilities
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define('fishtones/utils/MathUtils',['underscore'], function (_) {
    var MathUtils = function (options) {
    }
    /**
     * Simpson integration over x,y values
     * @param x
     * @param y
     * @return {number}
     */
    MathUtils.prototype.integrate = function (x, y) {
        var s = 0.0;
        _.times(x.length - 1, function (i) {
            s += 1.0 * (x[i + 1] - x[i]) * (y[i] + y[i + 1])
        })
        return s / 2.0
    }

    /**
     * linear interpolatiom
     * xs & ys are the known measures
     * xs must be sorted and striclty increasing
     *
     * for a given x, return the ys' interpolation between the two closest surroundiing xs'
     * asking for an x outside boundaries will return NaN
     *
     * @param {Object} xs
     * @param {Object} ys
     * @param {Object} x
     */
    MathUtils.prototype.interpolate = function (xs, ys, x) {
        var n = _.size(xs)
        if (n == 0 || x < xs[0] || x > xs[n - 1]) {
            return NaN;
        }
        var i1 = 0, i2 = n - 1;
        while (i2 - i1 > 1) {
            var im = Math.floor((i1 + i2) / 2)
            if (x < xs[im]) {
                i2 = im
            } else {
                i1 = im
            }
        }
        return  ys[i1] + (x - xs[i1]) / (xs[i2] - xs[i1]) * (ys[i2] - ys[i1])

    }

    return new MathUtils()
});

/*
 * Get the instrument parameters.
 * Mainly:
 * - precursorTol
 * - fragmentTol
 * Tolerance are expressed in ppm
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define('fishtones/models/wet/InstrumentParams',[
    'Backbone',
    'Config'
], function (Backbone, config) {
    var InstrumentParams = Backbone.Model.extend({
        defaults: {
            fragmentTol: undefined,
            precursorTol: undefined,
        },
        url: function () {
            return config.get('wet.url.rest') + '/instrumentparams/' + this.get('id')
        },
        initialize: function () {
            var self = this;
        },
        toString: function () {
            var self = this;
            return 'tol:' + self.get('precursorTol') + '/' + self.get('fragmentTol');
        },
        toJson: function () {
            var self = this;
            return {
                precursorTol: self.get('precursorTol'),
                fragmentTol: self.get('fragmentTol')
            }
        },

    });
    return InstrumentParams;
});

/*
 * Cross Ion Chromatogram.
 * Contains mainly two arrays of float:
 * - retentionTimes
 * - intensities
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define('fishtones/models/wet/XIC',['Backbone', 'Config'], function(Backbone, config) {
    var XIC = Backbone.Model.extend({
        defaults : {
        },
        initialize : function() {
        },
        size : function() {
            return this.get('retentionTimes').length
        },

        toJSON : function() {
            var self = this;
            var json = XIC.__super__.toJSON.call(self);

            if(json.richSequence){
                json.richSequence = json.richSequence.toString(); 
            }

            //jsonify memebers (msms, richSequence and co)
            var ks = _.keys(json)
            _.each(ks, function(k){
                if(! ((json[k] instanceof Backbone.Model) || (json[k] instanceof Backbone.Collection))){
                    return
                }
                json[k] = json[k].toJSON()
            })
            return json
        }
    });
    return XIC;
});

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

define('fishtones/models/wet/Injection',['jquery', 'underscore', 'Backbone', 'Config', 'fishtones/utils/MathUtils', './InstrumentParams', './XIC', 'fishtones/collections/wet/ExpMSMSSpectrumCollection', 'fishtones/models/wet/MSMSRun'], function ($, _, Backbone, config, mathUtils, InstrumentParams, XIC, ExpMSMSSpectrumCollection, MSMSRun) {
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

/*
 * just a collection of Injection
 * 
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define('fishtones/collections/wet/InjectionCollection',['Backbone', 'fishtones/models/wet/Injection', ], function(Backbone, Injection) {
    var InjectionCollection = Backbone.Collection.extend({
        model : Injection,
        defaults : {
        },
        initialize : function(options) {
            var self = this;
        }
    });
    return InjectionCollection;
});


/*
 * An experiment contains mainly a list of injections (acquired samples)
 * Properties:
 * - injection: array of Injection
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define('fishtones/models/wet/Experiment',['jquery', 'underscore', 'Backbone', 'Config', 'fishtones/models/wet/Injection', 'fishtones/collections/wet/InjectionCollection'], function ($, _, Backbone, config, Injection, InjectionCollection) {
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

/*
 * just a collection of XIC, with an attached collection legend container
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define('fishtones/collections/wet/XICCollection',['Backbone', 'fishtones/models/wet/XIC'], function(Backbone, XIC) {
  var XICCollectionLegend = Backbone.Model.extend({
    defaults : {

    },
    initialize : function() {
      this._legends = [];
    },
    reset : function() {
      this._legends.length = 0;
      return this;
    },
    /**
     *
     * @param {Object} e :{
     *   name: peptide name
     *   masses: [] array of masses, where masses[i] is the mass for charge i
     * }
     */
    add : function(e) {
      var _this = this;
      _this._legends.push({
        name : e.name || 'n/a',
        masses : e.masses || []
      });
      _this.trigger('change');
      return _this;
    },
    size : function() {
      return this._legends.length;
    },
    list : function() {
      return this._legends;
    }
  });

  var XICCollection = Backbone.Collection.extend({
    model : XIC,
    defaults : {
    },
    initialize : function(options) {
      var _this = this;
      _this.legends = new XICCollectionLegend();
    }
  });

  return XICCollection;
});

/**
 * the width height & x/r range all the chromato & spectra will share
 *
 * following d3, there is
 * * a domain: range of "real " values
 * * a range: viewport cooredinates
 * * origDomain (domain at large, before zoom)
 *
 * 'scalechange' evnt is triggered when boundaries are changed
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define('fishtones/views/utils/D3ScalingContext',['d3', 'underscore', 'Backbone'], function(d3, _, Backbone) {
  var D3ScalingContext = Backbone.Model.extend({
    initialize : function(options) {

      this._xOrigDomain = (options && options.xDomain && options.xDomain.slice()) || [0, 1];
      this._yOrigDomain = (options && options.yDomain && options.yDomain.slice()) || [0, 1];
      this._xDomain = this._xOrigDomain.slice();
      this._yDomain = this._yOrigDomain.slice();

      this._xRange = [0, (options && options.width) || 332];
      this._yRange = [(options && options.height) || 664, 0];

      this.changeXDomainCallBacks = {};
      return this
    },
    width : function(v) {
      if (v !== undefined) {
        var changed = this._xRange[1] != v;
        this._xRange[1] = v;
        if (changed) {
          this.trigger('scalechange', 'reset');
        }
        return this;
      }
      return this._xRange[1];
    },
    height : function(v) {
      if (v !== undefined) {
        var changed = this._yRange[0] != v;
        this._yRange[0] = v;
        if (changed) {
          this.trigger('scalechange', 'reset');
        }
        return this;
      }
      return this._yRange[0];
    },
    x : function() {
      return d3.scale.linear().domain(this._xDomain).range(this._xRange);
    },
    y : function() {
      return d3.scale.linear().domain(this._yDomain).range(this._yRange)
    },
    reset : function() {
      var self = this;
      var changed = self._xDomain[0] != self._xOrigDomain[0] || self._xDomain[1] != self._xOrigDomain[1] || self._yDomain[0] != self._yOrigDomain[0] || self._yDomain[1] != self._yOrigDomain[1];

      self._xDomain[0] = self._xOrigDomain[0];
      self._xDomain[1] = self._xOrigDomain[1];
      self._yDomain[0] = self._yOrigDomain[0];
      self._yDomain[1] = self._yOrigDomain[1];
      if (changed) {
        self.trigger('scalechange', 'reset');
      }
      //self.fireChangeXRange();
    },
    resetX : function() {
      var self = this;
      var changed = self._xDomain[0] != self._xOrigDomain[0] || self._xDomain[1] != self._xOrigDomain[1];

      self._xDomain[0] = self._xOrigDomain[0];
      self._xDomain[1] = self._xOrigDomain[1];
      if (changed) {
        self.trigger('scalechange', 'resetX');
      }
      return self;

      //self.fireChangeXRange();
    },
    resetY : function() {
      var self = this;

      self._yDomain[0] = self._yOrigDomain[0];
      self._yDomain[1] = self._yOrigDomain[1];
      //self.fireChangeXRange();
      return self;
    },
    xMin : function(v) {
      if (v !== undefined) {
        this._xOrigDomain[0] = v;
        return this;
      }
      return this._xOrigDomain[0]
    },
    xMax : function(v) {
      if (v !== undefined) {
        this._xOrigDomain[1] = v;
        return this;
      }
      return this._xOrigDomain[1]
    },
    yMin : function(v) {
      if (v !== undefined) {
        this._yOrigDomain[0] = v;
        return this;
      }
      return this._yOrigDomain[0]
    },
    yMax : function(v) {
      if (v !== undefined) {
        this._yOrigDomain[1] = v;
        return this;
      }
      return this._yOrigDomain[1]
    },

    xOrigDomain : function(vs) {
      if (vs !== undefined) {
        this._xOrigDomain = vs.slice();
        return this;
      }
      return this._xOrigDomain.slice()
    },
    yOrigDomain : function(vs) {
      if (vs !== undefined) {
        this._yOrigDomain = vs.slice();
        return this;
      }
      return this._yOrigDomain.slice()
    },
    xDomain : function(x0, x1, opts) {
      var self = this;

      var options = _.extend({
        silent : false
      }, opts)

      if (x0 === undefined)
        return self._xDomain.slice();

      if (_.isArray(x0)) {
        x1 = x0[1];
        x0 = x0[0];
      }
      var changed = x0 != self._xDomain[0] || x1 != self._xDomain[1];
      self._xDomain[0] = x0;
      self._xDomain[1] = x1;

      if (changed && !options.silent) {
        self.trigger('scalechange', 'xDomain');
      }

      return self
      //this.fireChangeXRange();
    },
    yDomain : function(y0, y1, opts) {
      var self = this;
      var options = _.extend({
        silent : false
      }, opts)

      if (y0 === undefined)
        return this._yDomain.slice();

      if (_.isArray(y0)) {
        y1 = y0[1];
        y0 = y0[0];
      }
      var changed = y0 != self._yDomain[0] || y1 != self._yDomain[1];

      self._yDomain[0] = y0;
      self._yDomain[1] = y1;
      if (changed && !options.silent) {
        self.trigger('scalechange', 'yDomain');
      }
      self.fireChangeXDomain();
      return self;
    },
    isXZoomed : function() {
      var self = this;
      return self._xDomain[0] > self._xOrigDomain[0] || self._xDomain[1] < self._xOrigDomain[1];
    },
    /*
     * set the mximum x value, the overall max and the current one.
     * if limitOnly, then we just modify the overall limit
     */
    setXMax : function(m, limitOnly) {
      this._xOrigDomain[1] = m
      if (limitOnly) {
        this._xDomain[1] = m
      }
      return this;
    },
    setYMax : function(m) {
      this._yDomain[1] = this._yOrigDomain[1] = m

    },
    addChangeXDomainCallBack : function(name, fct) {
      var self = this;
      self.changeXDomainCallBacks[name] = fct;
    },
    removeChangeXDomainCallBack : function(name) {
      var self = this;
      delete self.changeXDomainCallBacks[name];
    },
    fireChangeXDomain : function() {
      var self = this;
      _.each(self.changeXDomainCallBacks, function(fct, name) {
        fct(self);
      });
    }
  });

  return D3ScalingContext;

});

/*
 * area to handle move/zoom etc. buttons
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define('fishtones/views/utils/D3ScalingAreaButtons',['underscore', 'd3'], function(_, d3){
    /**
     * svg container
     * d3-Scaling-context (contains the viewport and domains boundaries
     * a call back to be called when zoomed
     */
    D3ScalingAreaButtons = function(container, context, callback, options) {
        options = $.extend({}, options);
        var self = this;
        self.context = context;
        self.container = container;
        self.callback = callback
        self.height = options.height || 30;

        self.container.attr('width', context.width);
        self.container.attr('height', self.height);

        self.p_setup = p_setup;

        self.p_setup()

    }
      return D3ScalingAreaButtons;

});
/*
 * svg container for the common scalingf area.
 *
 * d3-Scaling-context (contains the viewport and domains boundaries
 * a call back to be called when zoomed
 * * model: scalingContext,
 * * el: container,
 * * callback: call back when zoomed has been called (for  sttudff not triggere by scalechange events)
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define('fishtones/views/utils/D3ScalingArea',['underscore', 'd3', 'Backbone', './D3ScalingAreaButtons'], function (_, d3, Backbone, D3ScalingAreaButtons) {
    var D3ScalingArea = Backbone.View.extend({
        initialize: function (options) {//container, context, callback, options) {

            options = $.extend({}, options);
            var self = this;
            self.callback = options.callback;

            self.height = options.height || self.model.height() || 30;

            var el = _.isArray(self.el) ? self.el[0] : self.el;
            self.container = d3.select(el).append('g');
            self.container.attr('width', options.width || self.model.width());
            self.container.attr('height', self.height);

            self.p_setup()

        },
        updateScalingContext: function (ctx) {
            var self = this;
            self.model = ctx;

        },
        p_setup: function () {
            var self = this;

            var g = self.container.insert("g", ":first-child")
            //var rect = g.insert("rect", ":first-child").attr('x', 0).attr('y', 0).attr('width', '100%').attr('height', '100%').attr('fill-opacity', '0%').attr('class', 'zoom-area');

            self.p_setup_buttons();

            // self.zoom = d3.behavior.zoom().x(self.context.xScale).scaleExtent([1, 180]).on("zoom", function() {
            // self.callback();
            // self.context.fireChangeXRange();
            // });
            //   self.container.call(self.zoom);
        },
        p_setup_buttons: function () {
            var self = this;

            var scalingContext = self.model;
            self.buttons = {};
            var g = self.container.insert("g").attr('class', 'scaling-area-menu');

            var iButton = 0;
            var fctAddButton = function (name, text, fIsShowing, fAction) {
                var gbut = g.insert("g").attr('class', 'scaling-area-menu-one-button').attr('transform', 'translate(20,' + (10 + iButton * 27) + ')');
                var rect = gbut.insert("rect").attr('class', 'button').attr('x', 0).attr('y', 0).attr('width', 80).attr('rx', 5).attr('ry', 5).attr('height', 22);
                gbut.append('text').attr("x", 40).attr("y", 11).text(text);
                self.buttons[name] = {
                    el: gbut,
                    isShowing: fIsShowing,
                    action: fAction
                };
                var gOver = gbut.insert("rect").attr('class', 'over-button').attr('x', 0).attr('y', 0).attr('width', 80).attr('rx', 5).attr('ry', 5).attr('height', 22);
                gbut.on('click', fAction);

                gbut.style('display', fIsShowing() ? null : 'none');
                iButton++;
            }
            fctAddButton('zoomOut', 'zoom out', function () {
                return self.model.isXZoomed();
            }, function () {
                self.model.reset();
            })

            self.listenTo(scalingContext, 'scalechange', function () {
                _.each(self.buttons, function (butConf, name) {
                    butConf.el.style('display', butConf.isShowing() ? null : 'none');
                })
            });

        },
        hideAllButtons: function () {
            var self = this;
            _.each(self.buttons, function (butConf, name) {
                butConf.el.style('display', 'none');
            })
        }
    });
    return D3ScalingArea;

});

/**
 * An abstract class for D3Widget oriented views
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define('fishtones/views/commons/CommonWidgetView',['underscore', 'Backbone', 'd3', '../utils/D3ScalingContext', '../utils/D3ScalingArea'], function(_, Backbone, d3, D3ScalingContext, D3ScalingArea) {
  var KEYPRESSED_NONE = 0;
  var KEYPRESSED_SHIFT = 1;
  var KEYPRESSED_ALT = 2;
  var DOUBLE_CLICK = 4;

  CommonWidgetView = Backbone.View.extend({
    initialize : function(options) {
      var self = this;

      var elTmp = _.isArray(self.el) ? self.el[0] : self.el
      if ($(elTmp).prop("tagName").toLowerCase() === 'div') {
        self.el = d3.select(elTmp).append('svg').attr('height', '100%').attr('width', '100%');
      } else {
        self.el = d3.select(elTmp);
      }

      if (self.scalingContext) {
        self.xZoomable()
      }
      self.brushCallbacks = {};

      if ($(elTmp).prop('tagName').toLowerCase() === 'svg') {
        self._height = options.height || $(elTmp).parent().height() || 300;
        self._width = options.width || $(elTmp).parent().width() || 200;
      } else {
        self._height = options.height || $(elTmp).height() || 300;
        self._width = options.width || $(elTmp).width() || 200;
      }

    },
    height : function(v) {
      if (v !== undefined) {
        this._height = v;
        return this;
      }
      return this._height;
    },
    width : function(v) {
      if (v !== undefined) {
        this._width = v;
        return this;
      }
      return this._width;
    },
    /**
     * get the scalingContext from the options (contructor oriented) or define a new one
     * @param {Object} options
     */
    setupScalingContext : function(options) {
      var self = this;
      options = options || {};

      if (options.scalingContext != undefined) {
        self.scalingContext = options.scalingContext;
      } else {
        if (self.scalingContext === undefined) {
          self.scalingContext = new D3ScalingContext({
            height : self._height,
            width : self._width
          });
        }

        if (options.xDomain) {
          self.scalingContext.xOrigDomain(options.xDomain);
          self.scalingContext.xDomain(options.xDomain);
        }
        if (options.yDomain) {
          self.scalingContext.yOrigDomain(options.yDomain);
          self.scalingContext.yDomain(options.yDomain);
        }
        if (options.height) {
          self.scalingContext.height(options.height);
        }
        if (options.width) {
          self.scalingContext.width(options.width);
        }

      }
      self.listenTo(self.scalingContext, 'scalechange', function(evt) {
        self.render({
          cause : {
            name : evt,
            id : Math.random()
          }
        });
      })
    },
    /**
     * add a D3ScalingAre, i.e. a x-zoomable area
     */
    xZoomable : function() {
      var self = this;

      var adaptYDomain = function(xs) {
        if (!self.getMaxYInXDomain)
          return
        var ymax = self.getMaxYInXDomain(xs[0], xs[1]);
        self.scalingContext.yDomain(0, ymax, {
          silent : true
        });

      }

      self.setupInteractive();
      self.setBrushCallback(KEYPRESSED_NONE, function(xs) {
        adaptYDomain(xs)
        self.scalingContext.xDomain(xs)
      })
      self.setBrushCallback(DOUBLE_CLICK, function(xs) {
        self.scalingContext.reset()
      })
    },

    setShiftSelectCallback : function(f) {
      this.setBrushCallback(KEYPRESSED_SHIFT, f);
    },

    setupInteractive : function() {
      var self = this;
      if (self.brush !== undefined)
        return;

      self.el.selectAll('.zoom-area').remove()
      if (self.scalingArea !== undefined) {
        self.scalingArea.updateScalingContext(self.scalingContext);
      } else {
        self.scalingArea = new D3ScalingArea({
          el : self.vis || self.el,
          model : self.scalingContext,
          callback : function() {
          }
        });
      }

      var gBrush = (self.vis || self.el).insert('g', ':first-child').attr('class', 'x-selector');
      gBrush.append('rect').attr('height', '100%').attr('width', '100%').attr('class', 'background');
      var leftHider = gBrush.append('rect').attr('class', 'hider left').attr('height', '100%').attr('width', 0).style('display', 'none');
      var rightHider = gBrush.append('rect').attr('class', 'hider right').attr('height', '100%').attr('width', '100%').style('display', 'none');

      var tStamp = 0;
      var isDblClick = function() {
        var d = new Date();
        var t1 = d.getMilliseconds() + 1000 * (d.getSeconds() + 60 * d.getMinutes())
        var b = (t1 - tStamp) < 450
        tStamp = t1;
        return b;
      }
      var brush = d3.svg.brush().on("brushstart", function() {
        brush.x(self.scalingContext.x());
        leftHider.style('display', null)
        rightHider.style('display', null)

      }).on("brush", function() {
        var bounds = brush.extent()
        var x = self.scalingContext.x()
        leftHider.attr('width', x(bounds[0]))
        rightHider.attr('x', x(bounds[1]))

      }).on("brushend", function() {
        var kp = getKeyPressed();
        var bounds = brush.extent()
        if (isDblClick()) {
          self.brushCallbacks[DOUBLE_CLICK]()
        } else if ((bounds[1] - bounds[0]) >= 0.001 * self.scalingContext.xMax()) {
          if (self.brushCallbacks[kp] !== undefined) {
            self.brushCallbacks[kp](bounds)
          }
        }
        leftHider.style('display', 'none')
        rightHider.style('display', 'none')
      });

      brush.x(self.scalingContext.x());
      brush(gBrush);

    },
    setBrushCallback : function(keyMask, f) {
      this.brushCallbacks[keyMask] = f
    }
  });

  var getKeyPressed = function() {
    var i = 0;
    if (d3.event.sourceEvent.shiftKey)
      i |= KEYPRESSED_SHIFT;

    if (d3.event.sourceEvent.altKey)
      i |= KEYPRESSED_ALT;
    return i
  }
  return CommonWidgetView;
});


/**
 * utility method that will apply a regular expression onto a string, assuming that all al the string is captired by the reg exp (no holes)
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define('fishtones/utils/RegExpFullSpliter',['underscore'], function (_) {
    RegExpFullSpliter = function (options) {

    }
    /**
     * all match catpure by the regexp are returned in an array,
     * If some piece of the string is not covered, then an Exception is thrown
     * regexp is duplicate to avoid sync problem on lastIndexOf and this kind of things...
     * @param {Object} regexp is a string or regexp
     * @param {Object} str
     */
    RegExpFullSpliter.prototype.split = function (regexp, str) {
        var ret = []

        var re
        if (regexp instanceof RegExp) {
            re = new RegExp(regexp.source, 'g')
        } else {
            re = new RegExp(regexp, 'g')
        }
        re.global = true

        var posMatch = 0
        while (m = re.exec(str)) {
            if (m.index != posMatch) {
                throw {
                    name: 'RegexpFullSequenceCoverage',
                    message: 'cannot character at pos [' + posMatch + '-' + m.index + '] (' + str.substring(posMatch, m.index) + ') in "' + str + '" is not covered by regular expression ' + re
                }
            }
            posMatch = re.lastIndex;

            ret.push(m)
        }
        if (str.length != posMatch) {
            throw {
                name: 'RegexpFullSequenceCoverage',
                message: 'cannot character at pos [' + posMatch + '-' + m.index + '] (' + str.substring(posMatch, m.index) + ') in "' + str + '" is not covered by regular expression ' + re
            }
        }
        return ret
    }

    return RegExpFullSpliter
});

/*
 * AminoAcid object.
  * Properties:
  * - a code1 (one letter),
  * - a mass.
  *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define('fishtones/models/dry/AminoAcid',['Backbone'], function(Backbone) {

    var AminoAcid = Backbone.Model.extend({
        idAttribute : 'code1',
        defaults : {
            mass : -1
        },
        initialize : function() {
        },
        toString : function() {
            var self = this;
            return self.get('code1');
        }
    });

    return AminoAcid;
});

/*
 * amino acid definition, loaded by collections/dry/AminoAcidictionary
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define('fishtones/data/aminoAcids',[],function() {
    return [{
        code1 : "A",
        "mass" : 71.037114
    }, {
        "code1" : "R",
        "mass" : 156.101111
    }, {
        "code1" : "N",
        "mass" : 114.042927
    }, {
        "code1" : "D",
        "mass" : 115.026943
    }, {
        "code1" : "C",
        "mass" : 103.009185
    }, {
        "code1" : "E",
        "mass" : 129.042593
    }, {
        "code1" : "Q",
        "mass" : 128.058578
    }, {
        "code1" : "G",
        "mass" : 57.021464
    }, {
        "code1" : "H",
        "mass" : 137.058912
    }, {
        "code1" : "I",
        "mass" : 113.084064
    }, {
        "code1" : "L",
        "mass" : 113.084064
    }, {
        "code1" : "K",
        "mass" : 128.094963
    }, {
        "code1" : "M",
        "mass" : 131.040485
    }, {
        "code1" : "F",
        "mass" : 147.068414
    }, {
        "code1" : "P",
        "mass" : 97.052764
    }, {
        "code1" : "S",
        "mass" : 87.032028
    }, {
        "code1" : "T",
        "mass" : 101.047679
    }, {
        "code1" : "W",
        "mass" : 186.079313
    }, {
        "code1" : "Y",
        "mass" : 163.06332
    }, {
        "code1" : "V",
        "mass" : 99.068414
    }]
});

/*
 * A singleton amino acid dictionary, loaded from json fil data/aminoAcid.js
 * 
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define('fishtones/collections/dry/AminoAcidDictionary',['fishtones/models/dry/AminoAcid', 'fishtones/data/aminoAcids'], function(AminoAcid, bs_aminoacids) {
    var AminoAcidDictionary = Backbone.Collection.extend({

        model : AminoAcid,
        defaults : {
        },
        initialize : function(options) {
            var self = this;
            self.add(bs_aminoacids);
        }
    });
    return new AminoAcidDictionary();
});

/*
 * A ResidueModification POJO, wiht properties
 *  - name (unique across the dictionary
 *  - mass
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define('fishtones/models/dry/ResidueModification',['jquery', 'underscore', 'Backbone'], function($, _, Backbone) {

    var ResidueModification = Backbone.Model.extend({
        idAttribute:'name',
        defaults : {
            mass : -1
        },
        initialize : function() {
        },
        toString : function() {
            var self = this;
            return self.get('name') + '('+self.get('mass')+')';
        }
    });

    return ResidueModification;
});

/*
 * a json port of Unimod + some custom modifs.
 * loaded by collections/dry/ResidueModificationDictionary
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define('fishtones/data/residueModifications',[],function () {
    return [
        {
            "name": "PIC",
            "fullName": "PIC",
            "mass": 119.037114,
            formula: 'C7ONH5'
        },
        {
            "name": "PIC_HEAVY",
            "fullName": "PIC_HEAVY",
            "mass": 125.05724298,
            formula: 'C7ONH5'
        },
        {
            "name": "13C15N-A",
            "fullName": "13C15N-A",
            "mass": 4.0070994066,
        },
        {
            "name": "13C15N-C",
            "fullName": "13C15N-C",
            "mass": 4.0070994066,
        },
        {
            "name": "13C15N-D",
            "fullName": "13C15N-D",
            "mass": 5.0104542444,
        },
        {
            "name": "13C15N-E",
            "fullName": "13C15N-E",
            "mass": 6.0138090822,
        },
        {
            "name": "13C15N-F",
            "fullName": "13C15N-F",
            "mass": 10.0272284334,
        },
        {
            "name": "13C15N-",
            "fullName": "13C15N-",
            "mass": 3.0037445688,
        },
        {
            "name": "13C15N-H",
            "fullName": "13C15N-H",
            "mass": 9.0112337064
        },
        {
            "name": "13C15N-I",
            "fullName": "13C15N-I",
            "mass": 7.01716392
        },
        {
            "name": "13C15N-K",
            "fullName": "13C15N-K",
            "mass": 8.0141988132
        },
        {
            "name": "13C15N-L",
            "fullName": "13C15N-L",
            "mass": 7.01716392
        },
        {
            "name": "13C15N-M",
            "fullName": "13C15N-M",
            "mass": 6.0138090822
        },
        {
            "name": "13C15N-N",
            "fullName": "13C15N-N",
            "mass": 6.0074891376
        },
        {
            "name": "13C15N-P",
            "fullName": "13C15N-P",
            "mass": 6.0138090822
        },
        {
            "name": "13C15N-Q",
            "fullName": "13C15N-Q",
            "mass": 7.0108439754
        },
        {
            "name": "13C15N-R",
            "fullName": "13C15N-R",
            "mass": 10.0082685996
        },
        {
            "name": "13C15N-S",
            "fullName": "13C15N-S",
            "mass": 4.0070994066
        },
        {
            "name": "13C15N-T",
            "fullName": "13C15N-T",
            "mass": 5.0104542444
        },
        {
            "name": "13C15N-V",
            "fullName": "13C15N-V",
            "mass": 6.0138090822
        },
        {
            "name": "13C15N-W",
            "fullName": "13C15N-W",
            "mass": 13.0309730022
        },
        {
            "name": "13C15N-Y",
            "fullName": "13C15N-Y",
            "mass": 10.0272284334
        },
        {
            "name": "Acetyl",
            "fullName": "Acetylation",
            "mass": 42.010565
        },
        {
            "name": "Amidated",
            "fullName": "Amidation",
            "mass": -0.984016
        },
        {
            "name": "Biotin",
            "fullName": "Biotinylation",
            "mass": 226.077598
        },
        {
            "name": "Carbamidomethyl",
            "fullName": "Iodoacetamide derivative",
            "mass": 57.021464
        },
        {
            "name": "Carbamyl",
            "fullName": "Carbamylation",
            "mass": 43.005814
        },
        {
            "name": "Carboxymethyl",
            "fullName": "Iodoacetic acid derivative",
            "mass": 58.005479
        },
        {
            "name": "Deamidated",
            "fullName": "Deamidation",
            "mass": 0.984016
        },
        {
            "name": "Met->Hse",
            "fullName": "Homoserine",
            "mass": -29.992806
        },
        {
            "name": "Met->Hsl",
            "fullName": "Homoserine lactone",
            "mass": -48.003371
        },
        {
            "name": "NIPCAM",
            "fullName": "N-isopropylcarboxamidomethyl",
            "mass": 99.068414
        },
        {
            "name": "Phospho",
            "fullName": "Phosphorylation",
            "mass": 79.966331
        },
        {
            "name": "Dehydrated",
            "fullName": "Dehydration",
            "mass": -18.010565
        },
        {
            "name": "Propionamide",
            "fullName": "Acrylamide adduct",
            "mass": 71.037114
        },
        {
            "name": "Pyro-carbamidomethyl",
            "fullName": "S-carbamoylmethylcysteine cyclization (N-terminus)",
            "mass": 39.994915
        },
        {
            "name": "Glu->pyro-Glu",
            "fullName": "Pyro-glu from E",
            "mass": -18.010565
        },
        {
            "name": "Gln->pyro-Glu",
            "fullName": "Pyro-glu from Q",
            "mass": -17.026549
        },
        {
            "name": "Cation:Na",
            "fullName": "Sodium adduct",
            "mass": 21.981943
        },
        {
            "name": "Pyridylethyl",
            "fullName": "S-pyridylethylation",
            "mass": 105.057849
        },
        {
            "name": "Methyl",
            "fullName": "Methylation",
            "mass": 14.01565
        },
        {
            "name": "Oxidation",
            "fullName": "Oxidation or Hydroxylation",
            "mass": 15.994915
        },
        {
            "name": "Dimethyl",
            "fullName": "di-Methylation",
            "mass": 28.0313
        },
        {
            "name": "Trimethyl",
            "fullName": "tri-Methylation",
            "mass": 42.04695
        },
        {
            "name": "Methylthio",
            "fullName": "Beta-methylthiolation",
            "mass": 45.987721
        },
        {
            "name": "Sulfo",
            "fullName": "O-Sulfonation",
            "mass": 79.956815
        },
        {
            "name": "Hex",
            "fullName": "Hexose",
            "mass": 162.052823
        },
        {
            "name": "HexNAc",
            "fullName": "N-Acetylhexosamine",
            "mass": 203.079373
        },
        {
            "name": "Myristoyl",
            "fullName": "Myristoylation",
            "mass": 210.198366
        },
        {
            "name": "Guanidinyl",
            "fullName": "Guanidination",
            "mass": 42.021798
        },
        {
            "name": "Propionyl",
            "fullName": "Propionate labeling reagent light form (N-term & K)",
            "mass": 56.026215
        },
        {
            "name": "Pro->pyro-Glu",
            "fullName": "proline oxidation to pyroglutamic acid",
            "mass": 13.979265
        },
        {
            "name": "NHS-LC-Biotin",
            "fullName": "NHS-LC-Biotin",
            "mass": 339.161662
        },
        {
            "name": "ICAT-C",
            "fullName": "Applied Biosystems cleavable ICAT(TM) light",
            "mass": 227.126991
        },
        {
            "name": "ICAT-C:13C(9)",
            "fullName": "Applied Biosystems cleavable ICAT(TM) heavy",
            "mass": 236.157185
        },
        {
            "name": "Nethylmaleimide",
            "fullName": "N-ethylmaleimide on cysteines",
            "mass": 125.047679
        },
        {
            "name": "GlyGly",
            "fullName": "ubiquitinylation residue",
            "mass": 114.042927
        },
        {
            "name": "Formyl",
            "fullName": "Formylation",
            "mass": 27.994915
        },
        {
            "name": "Hex(1)HexNAc(1)NeuAc(2) (ST)",
            "fullName": "Hex1HexNAc1NeuAc2 (ST)",
            "mass": 947.323029
        },
        {
            "name": "Dimethyl:2H(6)13C(2)",
            "fullName": "dimethylated arginine",
            "mass": 36.07567
        },
        {
            "name": "Delta:H(4)C(2)O(-1)S(1)",
            "fullName": "S-Ethylcystine from Serine",
            "mass": 44.008456
        },
        {
            "name": "Label:13C(6)",
            "fullName": "13C(6) Silac label",
            "mass": 6.020129
        },
        {
            "name": "Label:18O(2)",
            "fullName": "O18 label at both C-terminal oxygens",
            "mass": 4.008491
        },
        {
            "name": "iTRAQ4plex",
            "fullName": "Representative mass and accurate mass for 116 & 117",
            "mass": 144.102063
        },
        {
            "name": "Label:18O(1)",
            "fullName": "O18 Labeling",
            "mass": 2.004246
        },
        {
            "name": "Label:13C(6)15N(2)",
            "fullName": "13C(6) 15N(2) Silac label",
            "mass": 8.014199
        },
        {
            "name": "Label:13C(6)15N(4)",
            "fullName": "13C(6) 15N(4) Silac label",
            "mass": 10.008269
        },
        {
            "name": "Label:13C(9)15N(1)",
            "fullName": "13C(9) 15N(1) Silac label",
            "mass": 10.027228
        },
        {
            "name": "Label:13C(5)15N(1)",
            "fullName": "13C(5) 15N(1) Silac label",
            "mass": 6.013809
        },
        {
            "name": "Nitrosyl",
            "fullName": "S-nitrosylation",
            "mass": 28.990164
        },
        {
            "name": "AEBS",
            "fullName": "Aminoethylbenzenesulfonylation",
            "mass": 183.035399
        },
        {
            "name": "Ethanolyl",
            "fullName": "Ethanolation of Cys",
            "mass": 44.026215
        },
        {
            "name": "Ethyl",
            "fullName": "Ethylation",
            "mass": 28.0313
        },
        {
            "name": "Carboxy",
            "fullName": "Carboxylation",
            "mass": 43.989829
        },
        {
            "name": "Nethylmaleimide+water",
            "fullName": "Nethylmaleimidehydrolysis",
            "mass": 143.058243
        },
        {
            "name": "ICPL:13C(6)",
            "fullName": "Bruker Daltonics SERVA-ICPL(TM) quantification chemistry, heavy form",
            "mass": 111.041593
        },
        {
            "name": "ICPL",
            "fullName": "Bruker Daltonics SERVA-ICPL(TM) quantification chemistry, light form",
            "mass": 105.021464
        },
        {
            "name": "Dehydro",
            "fullName": "Half of a disulfide bridge",
            "mass": -1.007825
        },
        {
            "name": "Hypusine",
            "fullName": "hypusine",
            "mass": 87.068414
        },
        {
            "name": "Ammonia-loss",
            "fullName": "Loss of ammonia",
            "mass": -17.026549
        },
        {
            "name": "Glucosylgalactosyl",
            "fullName": "glucosylgalactosyl hydroxylysine",
            "mass": 340.100562
        },
        {
            "name": "Dioxidation",
            "fullName": "dihydroxy",
            "mass": 31.989829
        },
        {
            "name": "HexN",
            "fullName": "Hexosamine",
            "mass": 161.068808
        },
        {
            "name": "Label:2H(4)",
            "fullName": "4,4,5,5-D4 Lysine",
            "mass": 4.025107
        },
        {
            "name": "Dimethyl:2H(4)13C(2)",
            "fullName": "DiMethyl-C13HD2",
            "mass": 34.063117
        },
        {
            "name": "Maleimide-PEO2-Biotin",
            "fullName": "Maleimide-PEO2-Biotin",
            "mass": 525.225719
        },
        {
            "name": "Ala->Ser",
            "fullName": "Ala->Ser substitution",
            "mass": 15.994915
        },
        {
            "name": "Thr->Ile",
            "fullName": "Thr->Ile substitution",
            "mass": 12.036386
        },
        {
            "name": "ICPL:2H(4)",
            "fullName": "Bruker Daltonics SERVA-ICPL(TM) quantification chemistry, medium form",
            "mass": 109.046571
        },
        {
            "name": "iTRAQ8plex",
            "fullName": "Representative mass and accurate mass for 113, 114, 116 & 117",
            "mass": 304.20536
        },
        {
            "name": "Label:13C(6)15N(1)",
            "fullName": "13C(6) 15N(1) Silac label",
            "mass": 7.017164
        },
        {
            "name": "TMT6plex",
            "fullName": "",
            "mass": 229.162932
        },
        {
            "name": "TMT2plex",
            "fullName": "TMT2plex by Thermo",
            "mass": 225.155833
        },
        {
            "name": "TMT",
            "fullName": "",
            "mass": 224.152478
        },
        {
            "name": "ExacTagThiol",
            "fullName": "ExacTag Thiol label mass for 2-4-7-10 plex",
            "mass": 972.365219
        },
        {
            "name": "ExacTagAmine",
            "fullName": "ExacTag Amine label mass for 2-4-7-10 plex",
            "mass": 1030.35294
        },
        {
            "name": "ArgGlyGly",
            "fullName": "Ubiquitination RGG",
            "mass": 270.144039
        },
        {
            "name": "Sulfo-NHS-SS-Biotin",
            "fullName": "EZ-Link Sulfo-NHS-SS-Biotin (Pierce)",
            "mass": 389.090154
        },
        {
            "name": "BPA",
            "fullName": "Benzoyal Phenylalanine",
            "mass": 268.097368
        },
        {
            "name": "BPA_AILV",
            "fullName": "Benzoyal Phenylalanine AILV",
            "mass": 268.097368
        },
        {
            "name": "BPA_STDN",
            "fullName": "Benzoyal Phenylalanine STDN",
            "mass": 268.097368
        },
        {
            "name": "BPA_PWYF",
            "fullName": "Benzoyal Phenylalanine PWYF",
            "mass": 268.097368
        },
        {
            "name": "BPA_RECQ",
            "fullName": "Benzoyal Phenylalanine RECQ",
            "mass": 268.097368
        },
        {
            "name": "BPA_GHKM",
            "fullName": "Benzoyal Phenylalanine GHKM",
            "mass": 268.097368
        },
        {
            "name": "SMCC linker",
            "fullName": "Succinimidyl-4-(N-maleimidomethyl)cyclohexane-1-carboxylate",
            "mass": 219.089543
        },
        {
            "name": "CHD",
            "fullName": "1,2-Cyclohexanedione arginine",
            "mass": 112.05243
        },
        {
            "name": "BD",
            "fullName": "1,2-Butanedione arginine",
            "mass": 86.036779
        },
        {
            "name": "HA-Ubiquitin Vinyl Sulfone",
            "fullName": "HA-Ubiquitin Vinyl Sulfone",
            "mass": 120.011924
        },
        {
            "name": "HA-Gly-Ubiquitin Vinyl Sulfone",
            "fullName": "HA-Glycyl-Ubiquitin Vinyl Sulfone",
            "mass": 177.033388
        },
        {
            "name": "Carbamidomethyl-Deuterated",
            "fullName": "Deuterated Iodoacetamide Derivative",
            "mass": 59.034017
        },
        {
            "name": "RGGUbiq",
            "fullName": "Ubiquitination RGG - ArgGlyGly",
            "mass": 270.144039
        },
        {
            "name": "iodoacetanilide",
            "fullName": "iodoacetanilide",
            "mass": 139.072893
        },
        {
            "name": "propylmercapto",
            "fullName": "propylmercapto / propanethiol",
            "mass": 58.024106
        },
        {
            "name": "GlyGly 13C(6) 15N(2) Lys",
            "fullName": "Double modification of Ubiquitin and Lys+8.02",
            "mass": 122.057126
        },
        {
            "name": "REPLi-DNP",
            "fullName": "DNP Fret modification for REPLi project",
            "mass": 252.049469
        },
        {
            "name": "REPLi-MCA-H",
            "fullName": "REPLi-MCA C12H8O4",
            "mass": 216.042259
        },
        {
            "name": "QQQTGG",
            "fullName": "SUMO Lys-QQQTGG",
            "mass": 599.266339
        },
        {
            "name": "ICPL:13C(6)2H(4)",
            "fullName": "Bruker Daltonics SERVA-ICPL(TM) quantification chemistry, heavy form, +10  yuk3 1-31-2011",
            "mass": 115.0667
        },
        {
            "name": "mTRAQ d0",
            "fullName": "mTRAQ ragent by AB SCIEX, delta 0 form",
            "mass": 140.094963
        },
        {
            "name": "mTRAQ d4",
            "fullName": "mTRAQ ragent by AB SCIEX, delta +4 form",
            "mass": 144.102063
        },
        {
            "name": "mTRAQ d8",
            "fullName": "mTRAQ ragent by AB SCIEX, delta +8 form",
            "mass": 148.109162
        },
        {
            "name": "Hex(1)HexNAc(1) (ST)",
            "fullName": "Hex1HexNAc1 (ST)",
            "mass": 365.132196
        },
        {
            "name": "Hex(1)HexNAc(1)NeuAc(1) (ST)",
            "fullName": "Hex1HexNAc1NeuAc1 (ST)",
            "mass": 656.227613
        },
        {
            "name": "TMT-LysGlyGly",
            "fullName": "TMT with Ubiquitin (GlyGly) modification on same residue",
            "mass": 338.195405
        },
        {
            "name": "TMT6-LysGlyGly",
            "fullName": "TMT 6plex with Ubiquitin Modification",
            "mass": 343.20586
        },
        {
            "name": "Crotonylation",
            "fullName": "Crotonylation",
            "mass": 68.026215
        },
        {
            "name": "LRLRGG-K",
            "fullName": "LeuArgLeuArgGlyGly-Lys",
            "mass": 652.413278
        },
        {
            "name": "RLRGG-K",
            "fullName": "ArgLeuArgGlyGly-Lys",
            "mass": 539.329214
        },
        {
            "name": "LRGG-K",
            "fullName": "LRGG modification on Lys",
            "mass": 383.228103
        },
        {
            "name": "AQUA_V",
            "fullName": "aqua-V",
            "mass": 6.013809,
        },
        {
            "name": "AQUA_P",
            "fullName": "isotopically modified residues Pro",
            "mass": 6.013809
        },
        {
            "name": "AQUA_PV",
            "fullName": "isotopically modified residues Pro and Val",
            "mass": 6.013809
        },
        {
            "name": "AQUA_L",
            "fullName": "isotopically modified residue Leu",
            "mass": 7.017164
        },
        {
            "name": "AQUA_I",
            "fullName": "isotopically modified residue Isoleucine",
            "mass": 7.017164
        },
        {
            "name": "AQUA_T",
            "fullName": "isotopically modified residue Thr",
            "mass": 5.01045
        },
        {
            "name": "AQUA_G",
            "fullName": "isotopically modified residue Gly",
            "mass": 3.003745
        },
        {
            "name": "AQUA_F",
            "fullName": "isotopically modified residue F",
            "mass": 10.028
        },
        {
            "name": "AQUA_A",
            "fullName": "isotopically modified residue Ala",
            "mass": 4.007099
        },
        {
            "name": "AQUA_Yphos",
            "fullName": "isotopically modified residue phosphorylated Tyr",
            "mass": 89.993559
        },
        {
            "name": "AQUA_Y",
            "fullName": "isotopically modified residue Tyr",
            "mass": 10.027228
        },
        {
            "name": "Acetyl_heavy_Lys",
            "fullName": "Acetyl_heavy_Lys",
            "mass": 50.024764
        },
        {
            "name": "QEQTGG",
            "fullName": "SUMO Lys-QEQTGG",
            "mass": 600.250354
        },
        {
            "name": "MonoMethylPropionyl",
            "fullName": "MonoMethylPropionylLysine",
            "mass": 70.041865
        },
        {
            "name": "Propionyl:2H(5)",
            "fullName": "Propionate labeling reagent pentadeuterated form (+5amu), N-term & K",
            "mass": 61.057598
        },
        {
            "name": "GlyGlyCarbamyl",
            "fullName": "Carbamylated Diglycine",
            "mass": 157.048741
        },
        {
            "name": "AQUA_D",
            "fullName": "isotopically modified residue Asp",
            "mass": 5.010454
        },
        {
            "name": "A>R",
            "fullName": "Ala>Arg",
            "mass": 85.063997
        },
        {
            "name": "A>N",
            "fullName": "Ala>Asn",
            "mass": 43.005813
        },
        {
            "name": "A>D",
            "fullName": "Ala>Asp",
            "mass": 43.989829
        },
        {
            "name": "A>C",
            "fullName": "Ala>Cys",
            "mass": 31.972071
        },
        {
            "name": "A>E",
            "fullName": "Ala>Glu",
            "mass": 58.00547900000001
        },
        {
            "name": "A>Q",
            "fullName": "Ala>Gln",
            "mass": 57.02146400000001
        },
        {
            "name": "A>G",
            "fullName": "Ala>Gly",
            "mass": -14.01565
        },
        {
            "name": "A>H",
            "fullName": "Ala>His",
            "mass": 66.02179799999999
        },
        {
            "name": "A>I",
            "fullName": "Ala>Ile",
            "mass": 42.046949999999995
        },
        {
            "name": "A>L",
            "fullName": "Ala>Leu",
            "mass": 42.046949999999995
        },
        {
            "name": "A>K",
            "fullName": "Ala>Lys",
            "mass": 57.057849000000004
        },
        {
            "name": "A>M",
            "fullName": "Ala>Met",
            "mass": 60.00337099999999
        },
        {
            "name": "A>F",
            "fullName": "Ala>Phe",
            "mass": 76.03129999999999
        },
        {
            "name": "A>P",
            "fullName": "Ala>Pro",
            "mass": 26.015649999999994
        },
        {
            "name": "A>S",
            "fullName": "Ala>Ser",
            "mass": 15.994913999999994
        },
        {
            "name": "A>T",
            "fullName": "Ala>Thr",
            "mass": 30.010565
        },
        {
            "name": "A>W",
            "fullName": "Ala>Trp",
            "mass": 115.04219900000001
        },
        {
            "name": "A>Y",
            "fullName": "Ala>Tyr",
            "mass": 92.026206
        },
        {
            "name": "A>V",
            "fullName": "Ala>Val",
            "mass": 28.0313
        },
        {
            "name": "R>A",
            "fullName": "Arg>Ala",
            "mass": -85.063997
        },
        {
            "name": "R>N",
            "fullName": "Arg>Asn",
            "mass": -42.058184
        },
        {
            "name": "R>D",
            "fullName": "Arg>Asp",
            "mass": -41.074168
        },
        {
            "name": "R>C",
            "fullName": "Arg>Cys",
            "mass": -53.091926
        },
        {
            "name": "R>E",
            "fullName": "Arg>Glu",
            "mass": -27.058517999999992
        },
        {
            "name": "R>Q",
            "fullName": "Arg>Gln",
            "mass": -28.04253299999999
        },
        {
            "name": "R>G",
            "fullName": "Arg>Gly",
            "mass": -99.079647
        },
        {
            "name": "R>H",
            "fullName": "Arg>His",
            "mass": -19.04219900000001
        },
        {
            "name": "R>I",
            "fullName": "Arg>Ile",
            "mass": -43.017047000000005
        },
        {
            "name": "R>L",
            "fullName": "Arg>Leu",
            "mass": -43.017047000000005
        },
        {
            "name": "R>K",
            "fullName": "Arg>Lys",
            "mass": -28.006147999999996
        },
        {
            "name": "R>M",
            "fullName": "Arg>Met",
            "mass": -25.060626000000013
        },
        {
            "name": "R>F",
            "fullName": "Arg>Phe",
            "mass": -9.032697000000013
        },
        {
            "name": "R>P",
            "fullName": "Arg>Pro",
            "mass": -59.04834700000001
        },
        {
            "name": "R>S",
            "fullName": "Arg>Ser",
            "mass": -69.069083
        },
        {
            "name": "R>T",
            "fullName": "Arg>Thr",
            "mass": -55.053432
        },
        {
            "name": "R>W",
            "fullName": "Arg>Trp",
            "mass": 29.97820200000001
        },
        {
            "name": "R>Y",
            "fullName": "Arg>Tyr",
            "mass": 6.962209000000001
        },
        {
            "name": "R>V",
            "fullName": "Arg>Val",
            "mass": -57.032697
        },
        {
            "name": "N>A",
            "fullName": "Asn>Ala",
            "mass": -43.005813
        },
        {
            "name": "N>R",
            "fullName": "Asn>Arg",
            "mass": 42.058184
        },
        {
            "name": "N>D",
            "fullName": "Asn>Asp",
            "mass": 0.9840159999999969
        },
        {
            "name": "N>C",
            "fullName": "Asn>Cys",
            "mass": -11.033742000000004
        },
        {
            "name": "N>E",
            "fullName": "Asn>Glu",
            "mass": 14.999666000000005
        },
        {
            "name": "N>Q",
            "fullName": "Asn>Gln",
            "mass": 14.015651000000005
        },
        {
            "name": "N>G",
            "fullName": "Asn>Gly",
            "mass": -57.021463000000004
        },
        {
            "name": "N>H",
            "fullName": "Asn>His",
            "mass": 23.015984999999986
        },
        {
            "name": "N>I",
            "fullName": "Asn>Ile",
            "mass": -0.958863000000008
        },
        {
            "name": "N>L",
            "fullName": "Asn>Leu",
            "mass": -0.958863000000008
        },
        {
            "name": "N>K",
            "fullName": "Asn>Lys",
            "mass": 14.052036000000001
        },
        {
            "name": "N>M",
            "fullName": "Asn>Met",
            "mass": 16.997557999999984
        },
        {
            "name": "N>F",
            "fullName": "Asn>Phe",
            "mass": 33.025486999999984
        },
        {
            "name": "N>P",
            "fullName": "Asn>Pro",
            "mass": -16.99016300000001
        },
        {
            "name": "N>S",
            "fullName": "Asn>Ser",
            "mass": -27.01089900000001
        },
        {
            "name": "N>T",
            "fullName": "Asn>Thr",
            "mass": -12.995248000000004
        },
        {
            "name": "N>W",
            "fullName": "Asn>Trp",
            "mass": 72.03638600000001
        },
        {
            "name": "N>Y",
            "fullName": "Asn>Tyr",
            "mass": 49.020393
        },
        {
            "name": "N>V",
            "fullName": "Asn>Val",
            "mass": -14.974513000000002
        },
        {
            "name": "D>A",
            "fullName": "Asp>Ala",
            "mass": -43.989829
        },
        {
            "name": "D>R",
            "fullName": "Asp>Arg",
            "mass": 41.074168
        },
        {
            "name": "D>N",
            "fullName": "Asp>Asn",
            "mass": -0.9840159999999969
        },
        {
            "name": "D>C",
            "fullName": "Asp>Cys",
            "mass": -12.017758
        },
        {
            "name": "D>E",
            "fullName": "Asp>Glu",
            "mass": 14.015650000000008
        },
        {
            "name": "D>Q",
            "fullName": "Asp>Gln",
            "mass": 13.031635000000009
        },
        {
            "name": "D>G",
            "fullName": "Asp>Gly",
            "mass": -58.005479
        },
        {
            "name": "D>H",
            "fullName": "Asp>His",
            "mass": 22.03196899999999
        },
        {
            "name": "D>I",
            "fullName": "Asp>Ile",
            "mass": -1.942879000000005
        },
        {
            "name": "D>L",
            "fullName": "Asp>Leu",
            "mass": -1.942879000000005
        },
        {
            "name": "D>K",
            "fullName": "Asp>Lys",
            "mass": 13.068020000000004
        },
        {
            "name": "D>M",
            "fullName": "Asp>Met",
            "mass": 16.013541999999987
        },
        {
            "name": "D>F",
            "fullName": "Asp>Phe",
            "mass": 32.04147099999999
        },
        {
            "name": "D>P",
            "fullName": "Asp>Pro",
            "mass": -17.974179000000007
        },
        {
            "name": "D>S",
            "fullName": "Asp>Ser",
            "mass": -27.994915000000006
        },
        {
            "name": "D>T",
            "fullName": "Asp>Thr",
            "mass": -13.979264
        },
        {
            "name": "D>W",
            "fullName": "Asp>Trp",
            "mass": 71.05237000000001
        },
        {
            "name": "D>Y",
            "fullName": "Asp>Tyr",
            "mass": 48.036377
        },
        {
            "name": "D>V",
            "fullName": "Asp>Val",
            "mass": -15.958528999999999
        },
        {
            "name": "C>A",
            "fullName": "Cys>Ala",
            "mass": -31.972071
        },
        {
            "name": "C>R",
            "fullName": "Cys>Arg",
            "mass": 53.091926
        },
        {
            "name": "C>N",
            "fullName": "Cys>Asn",
            "mass": 11.033742000000004
        },
        {
            "name": "C>D",
            "fullName": "Cys>Asp",
            "mass": 12.017758
        },
        {
            "name": "C>E",
            "fullName": "Cys>Glu",
            "mass": 26.03340800000001
        },
        {
            "name": "C>Q",
            "fullName": "Cys>Gln",
            "mass": 25.04939300000001
        },
        {
            "name": "C>G",
            "fullName": "Cys>Gly",
            "mass": -45.987721
        },
        {
            "name": "C>H",
            "fullName": "Cys>His",
            "mass": 34.04972699999999
        },
        {
            "name": "C>I",
            "fullName": "Cys>Ile",
            "mass": 10.074878999999996
        },
        {
            "name": "C>L",
            "fullName": "Cys>Leu",
            "mass": 10.074878999999996
        },
        {
            "name": "C>K",
            "fullName": "Cys>Lys",
            "mass": 25.085778000000005
        },
        {
            "name": "C>M",
            "fullName": "Cys>Met",
            "mass": 28.031299999999987
        },
        {
            "name": "C>F",
            "fullName": "Cys>Phe",
            "mass": 44.05922899999999
        },
        {
            "name": "C>P",
            "fullName": "Cys>Pro",
            "mass": -5.956421000000006
        },
        {
            "name": "C>S",
            "fullName": "Cys>Ser",
            "mass": -15.977157000000005
        },
        {
            "name": "C>T",
            "fullName": "Cys>Thr",
            "mass": -1.961506
        },
        {
            "name": "C>W",
            "fullName": "Cys>Trp",
            "mass": 83.07012800000001
        },
        {
            "name": "C>Y",
            "fullName": "Cys>Tyr",
            "mass": 60.054135
        },
        {
            "name": "C>V",
            "fullName": "Cys>Val",
            "mass": -3.940770999999998
        },
        {
            "name": "E>A",
            "fullName": "Glu>Ala",
            "mass": -58.00547900000001
        },
        {
            "name": "E>R",
            "fullName": "Glu>Arg",
            "mass": 27.058517999999992
        },
        {
            "name": "E>N",
            "fullName": "Glu>Asn",
            "mass": -14.999666000000005
        },
        {
            "name": "E>D",
            "fullName": "Glu>Asp",
            "mass": -14.015650000000008
        },
        {
            "name": "E>C",
            "fullName": "Glu>Cys",
            "mass": -26.03340800000001
        },
        {
            "name": "E>Q",
            "fullName": "Glu>Gln",
            "mass": -0.9840149999999994
        },
        {
            "name": "E>G",
            "fullName": "Glu>Gly",
            "mass": -72.021129
        },
        {
            "name": "E>H",
            "fullName": "Glu>His",
            "mass": 8.016318999999982
        },
        {
            "name": "E>I",
            "fullName": "Glu>Ile",
            "mass": -15.958529000000013
        },
        {
            "name": "E>L",
            "fullName": "Glu>Leu",
            "mass": -15.958529000000013
        },
        {
            "name": "E>K",
            "fullName": "Glu>Lys",
            "mass": -0.9476300000000037
        },
        {
            "name": "E>M",
            "fullName": "Glu>Met",
            "mass": 1.997891999999979
        },
        {
            "name": "E>F",
            "fullName": "Glu>Phe",
            "mass": 18.02582099999998
        },
        {
            "name": "E>P",
            "fullName": "Glu>Pro",
            "mass": -31.989829000000015
        },
        {
            "name": "E>S",
            "fullName": "Glu>Ser",
            "mass": -42.010565000000014
        },
        {
            "name": "E>T",
            "fullName": "Glu>Thr",
            "mass": -27.99491400000001
        },
        {
            "name": "E>W",
            "fullName": "Glu>Trp",
            "mass": 57.03672
        },
        {
            "name": "E>Y",
            "fullName": "Glu>Tyr",
            "mass": 34.020726999999994
        },
        {
            "name": "E>V",
            "fullName": "Glu>Val",
            "mass": -29.974179000000007
        },
        {
            "name": "Q>A",
            "fullName": "Gln>Ala",
            "mass": -57.02146400000001
        },
        {
            "name": "Q>R",
            "fullName": "Gln>Arg",
            "mass": 28.04253299999999
        },
        {
            "name": "Q>N",
            "fullName": "Gln>Asn",
            "mass": -14.015651000000005
        },
        {
            "name": "Q>D",
            "fullName": "Gln>Asp",
            "mass": -13.031635000000009
        },
        {
            "name": "Q>C",
            "fullName": "Gln>Cys",
            "mass": -25.04939300000001
        },
        {
            "name": "Q>E",
            "fullName": "Gln>Glu",
            "mass": 0.9840149999999994
        },
        {
            "name": "Q>G",
            "fullName": "Gln>Gly",
            "mass": -71.037114
        },
        {
            "name": "Q>H",
            "fullName": "Gln>His",
            "mass": 9.000333999999981
        },
        {
            "name": "Q>I",
            "fullName": "Gln>Ile",
            "mass": -14.974514000000013
        },
        {
            "name": "Q>L",
            "fullName": "Gln>Leu",
            "mass": -14.974514000000013
        },
        {
            "name": "Q>K",
            "fullName": "Gln>Lys",
            "mass": 0.03638499999999567
        },
        {
            "name": "Q>M",
            "fullName": "Gln>Met",
            "mass": 2.9819069999999783
        },
        {
            "name": "Q>F",
            "fullName": "Gln>Phe",
            "mass": 19.00983599999998
        },
        {
            "name": "Q>P",
            "fullName": "Gln>Pro",
            "mass": -31.005814000000015
        },
        {
            "name": "Q>S",
            "fullName": "Gln>Ser",
            "mass": -41.026550000000015
        },
        {
            "name": "Q>T",
            "fullName": "Gln>Thr",
            "mass": -27.01089900000001
        },
        {
            "name": "Q>W",
            "fullName": "Gln>Trp",
            "mass": 58.020735
        },
        {
            "name": "Q>Y",
            "fullName": "Gln>Tyr",
            "mass": 35.00474199999999
        },
        {
            "name": "Q>V",
            "fullName": "Gln>Val",
            "mass": -28.990164000000007
        },
        {
            "name": "G>A",
            "fullName": "Gly>Ala",
            "mass": 14.01565
        },
        {
            "name": "G>R",
            "fullName": "Gly>Arg",
            "mass": 99.079647
        },
        {
            "name": "G>N",
            "fullName": "Gly>Asn",
            "mass": 57.021463000000004
        },
        {
            "name": "G>D",
            "fullName": "Gly>Asp",
            "mass": 58.005479
        },
        {
            "name": "G>C",
            "fullName": "Gly>Cys",
            "mass": 45.987721
        },
        {
            "name": "G>E",
            "fullName": "Gly>Glu",
            "mass": 72.021129
        },
        {
            "name": "G>Q",
            "fullName": "Gly>Gln",
            "mass": 71.037114
        },
        {
            "name": "G>H",
            "fullName": "Gly>His",
            "mass": 80.03744799999998
        },
        {
            "name": "G>I",
            "fullName": "Gly>Ile",
            "mass": 56.062599999999996
        },
        {
            "name": "G>L",
            "fullName": "Gly>Leu",
            "mass": 56.062599999999996
        },
        {
            "name": "G>K",
            "fullName": "Gly>Lys",
            "mass": 71.073499
        },
        {
            "name": "G>M",
            "fullName": "Gly>Met",
            "mass": 74.01902099999998
        },
        {
            "name": "G>F",
            "fullName": "Gly>Phe",
            "mass": 90.04694999999998
        },
        {
            "name": "G>P",
            "fullName": "Gly>Pro",
            "mass": 40.031299999999995
        },
        {
            "name": "G>S",
            "fullName": "Gly>Ser",
            "mass": 30.010563999999995
        },
        {
            "name": "G>T",
            "fullName": "Gly>Thr",
            "mass": 44.026215
        },
        {
            "name": "G>W",
            "fullName": "Gly>Trp",
            "mass": 129.057849
        },
        {
            "name": "G>Y",
            "fullName": "Gly>Tyr",
            "mass": 106.041856
        },
        {
            "name": "G>V",
            "fullName": "Gly>Val",
            "mass": 42.04695
        },
        {
            "name": "H>A",
            "fullName": "His>Ala",
            "mass": -66.02179799999999
        },
        {
            "name": "H>R",
            "fullName": "His>Arg",
            "mass": 19.04219900000001
        },
        {
            "name": "H>N",
            "fullName": "His>Asn",
            "mass": -23.015984999999986
        },
        {
            "name": "H>D",
            "fullName": "His>Asp",
            "mass": -22.03196899999999
        },
        {
            "name": "H>C",
            "fullName": "His>Cys",
            "mass": -34.04972699999999
        },
        {
            "name": "H>E",
            "fullName": "His>Glu",
            "mass": -8.016318999999982
        },
        {
            "name": "H>Q",
            "fullName": "His>Gln",
            "mass": -9.000333999999981
        },
        {
            "name": "H>G",
            "fullName": "His>Gly",
            "mass": -80.03744799999998
        },
        {
            "name": "H>I",
            "fullName": "His>Ile",
            "mass": -23.974847999999994
        },
        {
            "name": "H>L",
            "fullName": "His>Leu",
            "mass": -23.974847999999994
        },
        {
            "name": "H>K",
            "fullName": "His>Lys",
            "mass": -8.963948999999985
        },
        {
            "name": "H>M",
            "fullName": "His>Met",
            "mass": -6.018427000000003
        },
        {
            "name": "H>F",
            "fullName": "His>Phe",
            "mass": 10.009501999999998
        },
        {
            "name": "H>P",
            "fullName": "His>Pro",
            "mass": -40.006147999999996
        },
        {
            "name": "H>S",
            "fullName": "His>Ser",
            "mass": -50.026883999999995
        },
        {
            "name": "H>T",
            "fullName": "His>Thr",
            "mass": -36.01123299999999
        },
        {
            "name": "H>W",
            "fullName": "His>Trp",
            "mass": 49.02040100000002
        },
        {
            "name": "H>Y",
            "fullName": "His>Tyr",
            "mass": 26.004408000000012
        },
        {
            "name": "H>V",
            "fullName": "His>Val",
            "mass": -37.99049799999999
        },
        {
            "name": "I>A",
            "fullName": "Ile>Ala",
            "mass": -42.046949999999995
        },
        {
            "name": "I>R",
            "fullName": "Ile>Arg",
            "mass": 43.017047000000005
        },
        {
            "name": "I>N",
            "fullName": "Ile>Asn",
            "mass": 0.958863000000008
        },
        {
            "name": "I>D",
            "fullName": "Ile>Asp",
            "mass": 1.942879000000005
        },
        {
            "name": "I>C",
            "fullName": "Ile>Cys",
            "mass": -10.074878999999996
        },
        {
            "name": "I>E",
            "fullName": "Ile>Glu",
            "mass": 15.958529000000013
        },
        {
            "name": "I>Q",
            "fullName": "Ile>Gln",
            "mass": 14.974514000000013
        },
        {
            "name": "I>G",
            "fullName": "Ile>Gly",
            "mass": -56.062599999999996
        },
        {
            "name": "I>H",
            "fullName": "Ile>His",
            "mass": 23.974847999999994
        },
        {
            "name": "I>L",
            "fullName": "Ile>Leu",
            "mass": 0
        },
        {
            "name": "I>K",
            "fullName": "Ile>Lys",
            "mass": 15.010899000000009
        },
        {
            "name": "I>M",
            "fullName": "Ile>Met",
            "mass": 17.95642099999999
        },
        {
            "name": "I>F",
            "fullName": "Ile>Phe",
            "mass": 33.98434999999999
        },
        {
            "name": "I>P",
            "fullName": "Ile>Pro",
            "mass": -16.0313
        },
        {
            "name": "I>S",
            "fullName": "Ile>Ser",
            "mass": -26.052036
        },
        {
            "name": "I>T",
            "fullName": "Ile>Thr",
            "mass": -12.036384999999996
        },
        {
            "name": "I>W",
            "fullName": "Ile>Trp",
            "mass": 72.99524900000002
        },
        {
            "name": "I>Y",
            "fullName": "Ile>Tyr",
            "mass": 49.97925600000001
        },
        {
            "name": "I>V",
            "fullName": "Ile>Val",
            "mass": -14.015649999999994
        },
        {
            "name": "L>A",
            "fullName": "Leu>Ala",
            "mass": -42.046949999999995
        },
        {
            "name": "L>R",
            "fullName": "Leu>Arg",
            "mass": 43.017047000000005
        },
        {
            "name": "L>N",
            "fullName": "Leu>Asn",
            "mass": 0.958863000000008
        },
        {
            "name": "L>D",
            "fullName": "Leu>Asp",
            "mass": 1.942879000000005
        },
        {
            "name": "L>C",
            "fullName": "Leu>Cys",
            "mass": -10.074878999999996
        },
        {
            "name": "L>E",
            "fullName": "Leu>Glu",
            "mass": 15.958529000000013
        },
        {
            "name": "L>Q",
            "fullName": "Leu>Gln",
            "mass": 14.974514000000013
        },
        {
            "name": "L>G",
            "fullName": "Leu>Gly",
            "mass": -56.062599999999996
        },
        {
            "name": "L>H",
            "fullName": "Leu>His",
            "mass": 23.974847999999994
        },
        {
            "name": "L>I",
            "fullName": "Leu>Ile",
            "mass": 0
        },
        {
            "name": "L>K",
            "fullName": "Leu>Lys",
            "mass": 15.010899000000009
        },
        {
            "name": "L>M",
            "fullName": "Leu>Met",
            "mass": 17.95642099999999
        },
        {
            "name": "L>F",
            "fullName": "Leu>Phe",
            "mass": 33.98434999999999
        },
        {
            "name": "L>P",
            "fullName": "Leu>Pro",
            "mass": -16.0313
        },
        {
            "name": "L>S",
            "fullName": "Leu>Ser",
            "mass": -26.052036
        },
        {
            "name": "L>T",
            "fullName": "Leu>Thr",
            "mass": -12.036384999999996
        },
        {
            "name": "L>W",
            "fullName": "Leu>Trp",
            "mass": 72.99524900000002
        },
        {
            "name": "L>Y",
            "fullName": "Leu>Tyr",
            "mass": 49.97925600000001
        },
        {
            "name": "L>V",
            "fullName": "Leu>Val",
            "mass": -14.015649999999994
        },
        {
            "name": "K>A",
            "fullName": "Lys>Ala",
            "mass": -57.057849000000004
        },
        {
            "name": "K>R",
            "fullName": "Lys>Arg",
            "mass": 28.006147999999996
        },
        {
            "name": "K>N",
            "fullName": "Lys>Asn",
            "mass": -14.052036000000001
        },
        {
            "name": "K>D",
            "fullName": "Lys>Asp",
            "mass": -13.068020000000004
        },
        {
            "name": "K>C",
            "fullName": "Lys>Cys",
            "mass": -25.085778000000005
        },
        {
            "name": "K>E",
            "fullName": "Lys>Glu",
            "mass": 0.9476300000000037
        },
        {
            "name": "K>Q",
            "fullName": "Lys>Gln",
            "mass": -0.03638499999999567
        },
        {
            "name": "K>G",
            "fullName": "Lys>Gly",
            "mass": -71.073499
        },
        {
            "name": "K>H",
            "fullName": "Lys>His",
            "mass": 8.963948999999985
        },
        {
            "name": "K>I",
            "fullName": "Lys>Ile",
            "mass": -15.010899000000009
        },
        {
            "name": "K>L",
            "fullName": "Lys>Leu",
            "mass": -15.010899000000009
        },
        {
            "name": "K>M",
            "fullName": "Lys>Met",
            "mass": 2.9455219999999827
        },
        {
            "name": "K>F",
            "fullName": "Lys>Phe",
            "mass": 18.973450999999983
        },
        {
            "name": "K>P",
            "fullName": "Lys>Pro",
            "mass": -31.04219900000001
        },
        {
            "name": "K>S",
            "fullName": "Lys>Ser",
            "mass": -41.06293500000001
        },
        {
            "name": "K>T",
            "fullName": "Lys>Thr",
            "mass": -27.047284000000005
        },
        {
            "name": "K>W",
            "fullName": "Lys>Trp",
            "mass": 57.984350000000006
        },
        {
            "name": "K>Y",
            "fullName": "Lys>Tyr",
            "mass": 34.968357
        },
        {
            "name": "K>V",
            "fullName": "Lys>Val",
            "mass": -29.026549000000003
        },
        {
            "name": "M>A",
            "fullName": "Met>Ala",
            "mass": -60.00337099999999
        },
        {
            "name": "M>R",
            "fullName": "Met>Arg",
            "mass": 25.060626000000013
        },
        {
            "name": "M>N",
            "fullName": "Met>Asn",
            "mass": -16.997557999999984
        },
        {
            "name": "M>D",
            "fullName": "Met>Asp",
            "mass": -16.013541999999987
        },
        {
            "name": "M>C",
            "fullName": "Met>Cys",
            "mass": -28.031299999999987
        },
        {
            "name": "M>E",
            "fullName": "Met>Glu",
            "mass": -1.997891999999979
        },
        {
            "name": "M>Q",
            "fullName": "Met>Gln",
            "mass": -2.9819069999999783
        },
        {
            "name": "M>G",
            "fullName": "Met>Gly",
            "mass": -74.01902099999998
        },
        {
            "name": "M>H",
            "fullName": "Met>His",
            "mass": 6.018427000000003
        },
        {
            "name": "M>I",
            "fullName": "Met>Ile",
            "mass": -17.95642099999999
        },
        {
            "name": "M>L",
            "fullName": "Met>Leu",
            "mass": -17.95642099999999
        },
        {
            "name": "M>K",
            "fullName": "Met>Lys",
            "mass": -2.9455219999999827
        },
        {
            "name": "M>F",
            "fullName": "Met>Phe",
            "mass": 16.027929
        },
        {
            "name": "M>P",
            "fullName": "Met>Pro",
            "mass": -33.98772099999999
        },
        {
            "name": "M>S",
            "fullName": "Met>Ser",
            "mass": -44.00845699999999
        },
        {
            "name": "M>T",
            "fullName": "Met>Thr",
            "mass": -29.992805999999987
        },
        {
            "name": "M>W",
            "fullName": "Met>Trp",
            "mass": 55.038828000000024
        },
        {
            "name": "M>Y",
            "fullName": "Met>Tyr",
            "mass": 32.022835000000015
        },
        {
            "name": "M>V",
            "fullName": "Met>Val",
            "mass": -31.972070999999985
        },
        {
            "name": "F>A",
            "fullName": "Phe>Ala",
            "mass": -76.03129999999999
        },
        {
            "name": "F>R",
            "fullName": "Phe>Arg",
            "mass": 9.032697000000013
        },
        {
            "name": "F>N",
            "fullName": "Phe>Asn",
            "mass": -33.025486999999984
        },
        {
            "name": "F>D",
            "fullName": "Phe>Asp",
            "mass": -32.04147099999999
        },
        {
            "name": "F>C",
            "fullName": "Phe>Cys",
            "mass": -44.05922899999999
        },
        {
            "name": "F>E",
            "fullName": "Phe>Glu",
            "mass": -18.02582099999998
        },
        {
            "name": "F>Q",
            "fullName": "Phe>Gln",
            "mass": -19.00983599999998
        },
        {
            "name": "F>G",
            "fullName": "Phe>Gly",
            "mass": -90.04694999999998
        },
        {
            "name": "F>H",
            "fullName": "Phe>His",
            "mass": -10.009501999999998
        },
        {
            "name": "F>I",
            "fullName": "Phe>Ile",
            "mass": -33.98434999999999
        },
        {
            "name": "F>L",
            "fullName": "Phe>Leu",
            "mass": -33.98434999999999
        },
        {
            "name": "F>K",
            "fullName": "Phe>Lys",
            "mass": -18.973450999999983
        },
        {
            "name": "F>M",
            "fullName": "Phe>Met",
            "mass": -16.027929
        },
        {
            "name": "F>P",
            "fullName": "Phe>Pro",
            "mass": -50.015649999999994
        },
        {
            "name": "F>S",
            "fullName": "Phe>Ser",
            "mass": -60.03638599999999
        },
        {
            "name": "F>T",
            "fullName": "Phe>Thr",
            "mass": -46.02073499999999
        },
        {
            "name": "F>W",
            "fullName": "Phe>Trp",
            "mass": 39.01089900000002
        },
        {
            "name": "F>Y",
            "fullName": "Phe>Tyr",
            "mass": 15.994906000000015
        },
        {
            "name": "F>V",
            "fullName": "Phe>Val",
            "mass": -47.999999999999986
        },
        {
            "name": "P>A",
            "fullName": "Pro>Ala",
            "mass": -26.015649999999994
        },
        {
            "name": "P>R",
            "fullName": "Pro>Arg",
            "mass": 59.04834700000001
        },
        {
            "name": "P>N",
            "fullName": "Pro>Asn",
            "mass": 16.99016300000001
        },
        {
            "name": "P>D",
            "fullName": "Pro>Asp",
            "mass": 17.974179000000007
        },
        {
            "name": "P>C",
            "fullName": "Pro>Cys",
            "mass": 5.956421000000006
        },
        {
            "name": "P>E",
            "fullName": "Pro>Glu",
            "mass": 31.989829000000015
        },
        {
            "name": "P>Q",
            "fullName": "Pro>Gln",
            "mass": 31.005814000000015
        },
        {
            "name": "P>G",
            "fullName": "Pro>Gly",
            "mass": -40.031299999999995
        },
        {
            "name": "P>H",
            "fullName": "Pro>His",
            "mass": 40.006147999999996
        },
        {
            "name": "P>I",
            "fullName": "Pro>Ile",
            "mass": 16.0313
        },
        {
            "name": "P>L",
            "fullName": "Pro>Leu",
            "mass": 16.0313
        },
        {
            "name": "P>K",
            "fullName": "Pro>Lys",
            "mass": 31.04219900000001
        },
        {
            "name": "P>M",
            "fullName": "Pro>Met",
            "mass": 33.98772099999999
        },
        {
            "name": "P>F",
            "fullName": "Pro>Phe",
            "mass": 50.015649999999994
        },
        {
            "name": "P>S",
            "fullName": "Pro>Ser",
            "mass": -10.020736
        },
        {
            "name": "P>T",
            "fullName": "Pro>Thr",
            "mass": 3.994915000000006
        },
        {
            "name": "P>W",
            "fullName": "Pro>Trp",
            "mass": 89.02654900000002
        },
        {
            "name": "P>Y",
            "fullName": "Pro>Tyr",
            "mass": 66.01055600000001
        },
        {
            "name": "P>V",
            "fullName": "Pro>Val",
            "mass": 2.015650000000008
        },
        {
            "name": "S>A",
            "fullName": "Ser>Ala",
            "mass": -15.994913999999994
        },
        {
            "name": "S>R",
            "fullName": "Ser>Arg",
            "mass": 69.069083
        },
        {
            "name": "S>N",
            "fullName": "Ser>Asn",
            "mass": 27.01089900000001
        },
        {
            "name": "S>D",
            "fullName": "Ser>Asp",
            "mass": 27.994915000000006
        },
        {
            "name": "S>C",
            "fullName": "Ser>Cys",
            "mass": 15.977157000000005
        },
        {
            "name": "S>E",
            "fullName": "Ser>Glu",
            "mass": 42.010565000000014
        },
        {
            "name": "S>Q",
            "fullName": "Ser>Gln",
            "mass": 41.026550000000015
        },
        {
            "name": "S>G",
            "fullName": "Ser>Gly",
            "mass": -30.010563999999995
        },
        {
            "name": "S>H",
            "fullName": "Ser>His",
            "mass": 50.026883999999995
        },
        {
            "name": "S>I",
            "fullName": "Ser>Ile",
            "mass": 26.052036
        },
        {
            "name": "S>L",
            "fullName": "Ser>Leu",
            "mass": 26.052036
        },
        {
            "name": "S>K",
            "fullName": "Ser>Lys",
            "mass": 41.06293500000001
        },
        {
            "name": "S>M",
            "fullName": "Ser>Met",
            "mass": 44.00845699999999
        },
        {
            "name": "S>F",
            "fullName": "Ser>Phe",
            "mass": 60.03638599999999
        },
        {
            "name": "S>P",
            "fullName": "Ser>Pro",
            "mass": 10.020736
        },
        {
            "name": "S>T",
            "fullName": "Ser>Thr",
            "mass": 14.015651000000005
        },
        {
            "name": "S>W",
            "fullName": "Ser>Trp",
            "mass": 99.04728500000002
        },
        {
            "name": "S>Y",
            "fullName": "Ser>Tyr",
            "mass": 76.03129200000001
        },
        {
            "name": "S>V",
            "fullName": "Ser>Val",
            "mass": 12.036386000000007
        },
        {
            "name": "T>A",
            "fullName": "Thr>Ala",
            "mass": -30.010565
        },
        {
            "name": "T>R",
            "fullName": "Thr>Arg",
            "mass": 55.053432
        },
        {
            "name": "T>N",
            "fullName": "Thr>Asn",
            "mass": 12.995248000000004
        },
        {
            "name": "T>D",
            "fullName": "Thr>Asp",
            "mass": 13.979264
        },
        {
            "name": "T>C",
            "fullName": "Thr>Cys",
            "mass": 1.961506
        },
        {
            "name": "T>E",
            "fullName": "Thr>Glu",
            "mass": 27.99491400000001
        },
        {
            "name": "T>Q",
            "fullName": "Thr>Gln",
            "mass": 27.01089900000001
        },
        {
            "name": "T>G",
            "fullName": "Thr>Gly",
            "mass": -44.026215
        },
        {
            "name": "T>H",
            "fullName": "Thr>His",
            "mass": 36.01123299999999
        },
        {
            "name": "T>I",
            "fullName": "Thr>Ile",
            "mass": 12.036384999999996
        },
        {
            "name": "T>L",
            "fullName": "Thr>Leu",
            "mass": 12.036384999999996
        },
        {
            "name": "T>K",
            "fullName": "Thr>Lys",
            "mass": 27.047284000000005
        },
        {
            "name": "T>M",
            "fullName": "Thr>Met",
            "mass": 29.992805999999987
        },
        {
            "name": "T>F",
            "fullName": "Thr>Phe",
            "mass": 46.02073499999999
        },
        {
            "name": "T>P",
            "fullName": "Thr>Pro",
            "mass": -3.994915000000006
        },
        {
            "name": "T>S",
            "fullName": "Thr>Ser",
            "mass": -14.015651000000005
        },
        {
            "name": "T>W",
            "fullName": "Thr>Trp",
            "mass": 85.03163400000001
        },
        {
            "name": "T>Y",
            "fullName": "Thr>Tyr",
            "mass": 62.015641
        },
        {
            "name": "T>V",
            "fullName": "Thr>Val",
            "mass": -1.979264999999998
        },
        {
            "name": "W>A",
            "fullName": "Trp>Ala",
            "mass": -115.04219900000001
        },
        {
            "name": "W>R",
            "fullName": "Trp>Arg",
            "mass": -29.97820200000001
        },
        {
            "name": "W>N",
            "fullName": "Trp>Asn",
            "mass": -72.03638600000001
        },
        {
            "name": "W>D",
            "fullName": "Trp>Asp",
            "mass": -71.05237000000001
        },
        {
            "name": "W>C",
            "fullName": "Trp>Cys",
            "mass": -83.07012800000001
        },
        {
            "name": "W>E",
            "fullName": "Trp>Glu",
            "mass": -57.03672
        },
        {
            "name": "W>Q",
            "fullName": "Trp>Gln",
            "mass": -58.020735
        },
        {
            "name": "W>G",
            "fullName": "Trp>Gly",
            "mass": -129.057849
        },
        {
            "name": "W>H",
            "fullName": "Trp>His",
            "mass": -49.02040100000002
        },
        {
            "name": "W>I",
            "fullName": "Trp>Ile",
            "mass": -72.99524900000002
        },
        {
            "name": "W>L",
            "fullName": "Trp>Leu",
            "mass": -72.99524900000002
        },
        {
            "name": "W>K",
            "fullName": "Trp>Lys",
            "mass": -57.984350000000006
        },
        {
            "name": "W>M",
            "fullName": "Trp>Met",
            "mass": -55.038828000000024
        },
        {
            "name": "W>F",
            "fullName": "Trp>Phe",
            "mass": -39.01089900000002
        },
        {
            "name": "W>P",
            "fullName": "Trp>Pro",
            "mass": -89.02654900000002
        },
        {
            "name": "W>S",
            "fullName": "Trp>Ser",
            "mass": -99.04728500000002
        },
        {
            "name": "W>T",
            "fullName": "Trp>Thr",
            "mass": -85.03163400000001
        },
        {
            "name": "W>Y",
            "fullName": "Trp>Tyr",
            "mass": -23.01599300000001
        },
        {
            "name": "W>V",
            "fullName": "Trp>Val",
            "mass": -87.01089900000001
        },
        {
            "name": "Y>A",
            "fullName": "Tyr>Ala",
            "mass": -92.026206
        },
        {
            "name": "Y>R",
            "fullName": "Tyr>Arg",
            "mass": -6.962209000000001
        },
        {
            "name": "Y>N",
            "fullName": "Tyr>Asn",
            "mass": -49.020393
        },
        {
            "name": "Y>D",
            "fullName": "Tyr>Asp",
            "mass": -48.036377
        },
        {
            "name": "Y>C",
            "fullName": "Tyr>Cys",
            "mass": -60.054135
        },
        {
            "name": "Y>E",
            "fullName": "Tyr>Glu",
            "mass": -34.020726999999994
        },
        {
            "name": "Y>Q",
            "fullName": "Tyr>Gln",
            "mass": -35.00474199999999
        },
        {
            "name": "Y>G",
            "fullName": "Tyr>Gly",
            "mass": -106.041856
        },
        {
            "name": "Y>H",
            "fullName": "Tyr>His",
            "mass": -26.004408000000012
        },
        {
            "name": "Y>I",
            "fullName": "Tyr>Ile",
            "mass": -49.97925600000001
        },
        {
            "name": "Y>L",
            "fullName": "Tyr>Leu",
            "mass": -49.97925600000001
        },
        {
            "name": "Y>K",
            "fullName": "Tyr>Lys",
            "mass": -34.968357
        },
        {
            "name": "Y>M",
            "fullName": "Tyr>Met",
            "mass": -32.022835000000015
        },
        {
            "name": "Y>F",
            "fullName": "Tyr>Phe",
            "mass": -15.994906000000015
        },
        {
            "name": "Y>P",
            "fullName": "Tyr>Pro",
            "mass": -66.01055600000001
        },
        {
            "name": "Y>S",
            "fullName": "Tyr>Ser",
            "mass": -76.03129200000001
        },
        {
            "name": "Y>T",
            "fullName": "Tyr>Thr",
            "mass": -62.015641
        },
        {
            "name": "Y>W",
            "fullName": "Tyr>Trp",
            "mass": 23.01599300000001
        },
        {
            "name": "Y>V",
            "fullName": "Tyr>Val",
            "mass": -63.994906
        },
        {
            "name": "V>A",
            "fullName": "Val>Ala",
            "mass": -28.0313
        },
        {
            "name": "V>R",
            "fullName": "Val>Arg",
            "mass": 57.032697
        },
        {
            "name": "V>N",
            "fullName": "Val>Asn",
            "mass": 14.974513000000002
        },
        {
            "name": "V>D",
            "fullName": "Val>Asp",
            "mass": 15.958528999999999
        },
        {
            "name": "V>C",
            "fullName": "Val>Cys",
            "mass": 3.940770999999998
        },
        {
            "name": "V>E",
            "fullName": "Val>Glu",
            "mass": 29.974179000000007
        },
        {
            "name": "V>Q",
            "fullName": "Val>Gln",
            "mass": 28.990164000000007
        },
        {
            "name": "V>G",
            "fullName": "Val>Gly",
            "mass": -42.04695
        },
        {
            "name": "V>H",
            "fullName": "Val>His",
            "mass": 37.99049799999999
        },
        {
            "name": "V>I",
            "fullName": "Val>Ile",
            "mass": 14.015649999999994
        },
        {
            "name": "V>L",
            "fullName": "Val>Leu",
            "mass": 14.015649999999994
        },
        {
            "name": "V>K",
            "fullName": "Val>Lys",
            "mass": 29.026549000000003
        },
        {
            "name": "V>M",
            "fullName": "Val>Met",
            "mass": 31.972070999999985
        },
        {
            "name": "V>F",
            "fullName": "Val>Phe",
            "mass": 47.999999999999986
        },
        {
            "name": "V>P",
            "fullName": "Val>Pro",
            "mass": -2.015650000000008
        },
        {
            "name": "V>S",
            "fullName": "Val>Ser",
            "mass": -12.036386000000007
        },
        {
            "name": "V>T",
            "fullName": "Val>Thr",
            "mass": 1.979264999999998
        },
        {
            "name": "V>W",
            "fullName": "Val>Trp",
            "mass": 87.01089900000001
        },
        {
            "name": "V>Y",
            "fullName": "Val>Tyr",
            "mass": 63.994906
        }
    ]
});

/*
 * A singleton dictionary for residue modifications, loaded from data/resiueModifications.js, a transform from Unimod,
 * but any modification can be added as long as the name is unique.
 * 
 * Copyright (c) 2013-14, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define('fishtones/collections/dry/ResidueModificationDictionary',[ 'Backbone', 'fishtones/models/dry/ResidueModification', 'fishtones/data/residueModifications'], function(Backbone, ResidueModification, bs_resmod) {
    var ResidueModificationDictionary = Backbone.Collection.extend({

        model : ResidueModification,
        defaults : {
        },
        initialize : function(options) {
            var self = this;
            self.add(bs_resmod);
        }
    });
    return new ResidueModificationDictionary();
});

/*
 * RichSequence is the expression of a peptide, with modifications. It is certainly one of the most used class among fishTones-js.
 * It hold the peptide sequence, with any number of possible modification on a amino acid.
 * It also holds C/N-terms modification(s) (multiple can also apply on the termini.
 * This implementation is not done with speed in mind, but versatility of use.
 *
 * A RichSequence object will contains a 'sequence' properties which is an array of {aa:x, modifications:[]}
 *
 * When getting modification per positions on a peptide of length l:
 * 0 -> modif one the first amino acid
 * l-1 -> on the last amino acid
 * -1 -> NTerm
 * l -> CTerm
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define('fishtones/models/dry/RichSequence',['jquery', 'underscore', 'Backbone', 'fishtones/utils/RegExpFullSpliter', 'fishtones/collections/dry/AminoAcidDictionary', 'fishtones/collections/dry/ResidueModificationDictionary', 'fishtones/models/dry/ResidueModification'], function ($, _, Backbone, RegExpFullSpliter, dicoAA, dicoResMod, ResidueModification) {

    var RichSequence = Backbone.Model.extend({
        defaults: {
            sequence: []
        },
        initialize: function () {
        },

        clone: function () {
            return new RichSequence().fromString(this.toString())
        },
        /**
         * get the modification array for a given amino acid position
         * @param pos
         * @param create : create such an arrya on the object if it was not existing [default false]
         * @return {*}
         * @private
         */
        getModificationArray: function (pos, create) {
            var self = this;
            if (pos == -1) {
                if (self.get('nTermModifications') === undefined && create) {
                    self.set('nTermModifications', [])
                }
                return self.get('nTermModifications');
            }
            if (pos == self.size()) {
                if (self.get('cTermModifications') === undefined && create) {
                    self.set('cTermModifications', [])
                }
                return self.get('cTermModifications');
            }
            if (!self.get('sequence')[pos].modifications && create) {
                self.get('sequence')[pos].modifications = [];
            }
            return self.get('sequence')[pos].modifications;

        },
        /**
         * set the moficiation array
         * @param pos
         * @param modifarray
         * @return this
         * @private
         */
        setModificationArray: function (pos, modifarray) {
            var self = this;
            if (pos == -1) {
                self.set('nTermModifications', modifarray);
                return self;
            }

            if (pos == self.size()) {
                self.set('cTermModifications', modifarray)
                return self;
            }

            self.get('sequence')[pos].modifications = modifarray;
            return self;

        },
        /**
         * add one modification or an array of modif at a given position to the exisiting list.
         * @param pos: position beetween -1 and len
         * @param mod: one modificaiton or an array of it
         */
        setModification: function (pos, mod) {
            var self = this;
            self.setModificationArray(pos, undefined);
            self.addModification(pos, mod);
            self.trigger('change')
        },
        /**
         * add one modification or an array of modif at a given position to the exisiting list.
         * @param pos: position beetween -1 and len
         * @param mod: one modificaiton or an array of it
         */
        addModification: function (pos, mod) {
            var self = this;

            if (mod === undefined) {
                return self;
            }
            var modArr = self.getModificationArray(pos, true)
            if (_.isArray(mod)) {
                _.each(mod, function (rm) {
                    modArr.push(rm);
                });
            } else {
                modArr.push(mod);
            }
            return self;
        },

        /**
         * @param pos: between -1 and len
         * @return the list of modification at this position (-1 and size() position for termini)
         */
        countModificationsAt: function (pos) {
            var a = this.getModificationArray(pos);
            return a ? a.length : 0;
        },
        /**
         * @param pos: between -1 and len
         * @return the list of modification at this position
         */
        modifAt: function (pos) {
            return this.getModificationArray(pos)
        },

        /**
         * @paeram pos: between 0 and len-1
         * @return the amino aicd at this position
         */
        aaAt: function (pos) {
            return this.get('sequence')[pos].aa
        },
        /**
         * read the object back from the toString method. See toString for more details 'ACD{Oxidation}EFG{123.45,Phosphorylation}HIK-{Acetyl}'
         * RichSequence-tests.js wil show plenty of examples
         * @param str
         * @return {RichSequence}
         */
        fromString: function (str) {
            var self = this;
            self.set('sequence', []);

            str = str.trim()
            var matchNterm = /^\{([^\}]*)\}/.exec(str)
            if (matchNterm) {
                str = str.substring(matchNterm[0].length);
                self.setModification(-1, self.string2modifs(matchNterm[1]));
            } else {
                self.setModification(-1, undefined);
            }
            var matchCterm = /([\}\-])\{([^\}]*)\}$/.exec(str);
            var ctermModifs = undefined;
            if (matchCterm) {
                str = str.substr(0, str.length - matchCterm[0].length);
                if (matchCterm[1] == '}')
                    str += '}';
                ctermModifs = self.string2modifs(matchCterm[2]);
            }

            var matches = new RegExpFullSpliter().split(/([A-Z])(\{([^\}]*)\})?/, str)

            _.each(matches, function (m) {
                var raa = {
                    aa: dicoAA.get(m[1])
                };
                if (!raa.aa) {
                    throw {
                        name: 'UnknwownAminoAcid',
                        message: 'unknwon amino acid ' + m[1]
                    }
                }
                if (m[3]) {
                    raa.modifications = self.string2modifs(m[3]);
                }
                self.get('sequence').push(raa);
            })
            self.setModification(self.size(), ctermModifs);
            //self.change();
            return self;
        },
        /**
         * parse a modification string string
         * @param strMods
         * @return {Array}
         * @private
         */
        string2modifs: function (strMods) {
            var l = [];
            _.each(strMods.split(','), function (mn) {
                var mod = dicoResMod.get(mn);
                if (!mod) {
                    var mmass = parseFloat(mn);
                    if (!_.isFinite(mmass)) {
                        throw {
                            name: 'UnknwownResidueModification',
                            message: 'unknown modification [' + mod + '] in ' + mn
                        }
                    }
                    mod = new ResidueModification({
                        name: "" + mmass,
                        mass: mmass
                    })
                }
                l.push(mod)
            });
            return l;
        },

        /**
         * check equality betwee 2 rich sequence.
         * That can be not that straight forwards, because the modification order on a given amino acid is not relevant.
         * @param ors
         * @return {*}
         */
        equalsTo: function (ors) {
            var self = this;
            if ((ors == null) || (self.size() != ors.size())) {
                return false;
            }
            return _.all(self.get('sequence'), function (raa, i) {
                oraa = ors.get('sequence')[i];
                //                    console.log(raa.aa.code1, oraa.aa.code)
                //                    console.log(_.pluck(raa.modifications, 'name').sort().join(
                //                                    ''), _.pluck(oraa.modifications, 'name')
                //                                    .sort().join(''));
                return (raa.aa.get('code1') == oraa.aa.get('code1')) && (_.collect(raa.modifications, function (m) {
                    return m.get('name')
                }).sort().join('') == _.collect(oraa.modifications, function (m) {
                    return m.get('name')
                }).sort().join(''));
            });
        },

        /**
         * @return just the amino acid list as a string
         */
        toAAString: function () {
            return _.collect(this.get('sequence'), function (raa) {
                return raa.aa.get('code1');
            }).join('');
        },

        /**
         * full string, compatible with the fromString/constructor syntax
         * see RichSequence-tests.js for examples
         * @return a string
         */
        toString: function () {
            var self = this;

            var modif2string = function (modifs) {
                if (!modifs || modifs.length == 0) {
                    return '';
                }
                return '{' + _.collect(modifs, function (m) {
                    return m.get('name')
                }).sort().join(',') + '}'
            }
            var s = modif2string(self.get('nTermModifications'));
            var size = self.size();
            for (i = 0; i < size; i++) {
                s += self.get('sequence')[i].aa.get('code1');
                s += modif2string(self.get('sequence')[i].modifications);
            }

            if (self.countModificationsAt(size) > 0) {
                if (self.countModificationsAt(size - 1) == 0) {
                    s += '-'
                }
                ;
                s += modif2string(self.get('cTermModifications'));
            }
            ;

            return s;
        },
        /**
         *
         * @return a sequence length
         */
        size: function () {
            return this.get('sequence').length;
        }
    });

    return RichSequence;
});

/*
 * A theoretical spectrum pojo, made out from a RichSequence and a set of fragmentation series
 * Properties:
 * - richSequence
 * - peaks
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define('fishtones/models/dry/TheoSpectrum',['underscore', 'Backbone'], function(_, Backbone) {
    var TheoSpectrum = Backbone.Model.extend({
        defaults : {
            richSequence : null,
        },
        initialize : function() {
        },
        /**
         * @return the list of m/z. we need that to have a kind of 'abstraction' over MassList
         */
        mozs:function(){
            return _.pluck(this.get('peaks'), 'moz');
        },
        size:function(){
            return this.get('peaks').length;
        }
        
    });
    return TheoSpectrum;
});

/*
 * Builds theoretical masses based on a RichSeuence. It can be intact mass (with charges) or fragmentation spectra.
 * Visit MassBuilder-test.js for plenty of examples.
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define('fishtones/services/dry/MassBuilder',['jquery', 'underscore', 'Backbone', 'fishtones/models/dry/RichSequence', 'fishtones/models/dry/TheoSpectrum', 'fishtones/collections/dry/AminoAcidDictionary', 'fishtones/collections/dry/ResidueModificationDictionary'], function($, _, Backbone, RichSequence, TheoSpectrum, dicoAA, dicoResMod) {
  var MASS_OH = 15.994914622 + 1.007825032// cterm
  var MASS_H = 1.007825032// nterm
  var MASS_HPLUS = 1.007276466812

  /**
   * private contstructor
   */
  MassBuilder = Backbone.Model.extend({
    initDef : initDef,
    launchInit : false,

    _indexModif : null,
    _indexAminoAcid : null,

    indexModif : function(name) {
      return (name === undefined) ? this._indexModif : this._indexModif[name]
    },
    indexAminoAcid : function(name) {
      return (name === undefined) ? this._indexAminoAcid : this._indexAminoAcid[name]
    },

    p_init_amino_acids_from_json : p_init_amino_acids_from_json,
    p_init_residue_modifications_from_json : p_init_residue_modifications_from_json,

    computeMassRichSequence : computeMassRichSequence,
    computeTheoSpectrum : computeTheoSpectrum,
    computeMassRichAA : computeMassRichAA,
    computeMassModifArray : computeMassModifArray

  });

  MassBuilder.prototype.init = function(options) {
    this.initDef(options)

  }
  /**
   * read Modification, amino acid & co definitions automatically called once
   * from the option src in new
   * @private
   */
  function initDef(options) {
    var self = this;
    if (options && options.src !== undefined) {
      self.launchInit = true
      $.getJSON(options.src + '/residueModification/list', function(data) {
        self.p_init_residue_modifications_from_json(data)
      });
      $.getJSON(options.src + '/aminoAcid/list', function(data) {

        self.p_init_amino_acids_from_json(data);
      });
    } else if (options && options.data !== undefined) {
      self.launchInit = true
      self.p_init_amino_acids_from_json(options.data.aminoAcids);
      self.p_init_residue_modifications_from_json(options.data.residueModifications);
    }
  }

  var p_init_amino_acids_from_json = function(data) {
    var self = this;
    var idx = {};
    _.each(data, function(d) {
      idx[d.code1] = d
    });

    self._indexAminoAcid = idx;
  };

  var p_init_residue_modifications_from_json = function(data) {
    var self = this;
    var idx = {};
    _.each(data, function(d) {
      idx[d.name] = d
    });

    self._indexModif = idx;
  };

  /**
   * compute RichAA mass (amino acid + modifications)
   * @private
   */
  function computeMassRichAA(raa) {
    return raa.aa.get('mass') + computeMassModifArray(raa.modifications);
  }

  /**
   * compute the mass of of list of modifications (undefiend is possible). It's just the sum of the modif masses
   * @private
   */
  function computeMassModifArray(modifications) {

    if (modifications === undefined || modifications.length == 0) {
      return 0;
    }
    var tot = 0;
    _.each(modifications, function(m) {
      tot += m.get('mass');
    });
    return tot;
  }

  /**
   * get rich sequence mass if a charge argument is given , get the charged
   * peptide
   * @param richSeq: the peptide
   * @param charge: charge state. if undefined, MH will be returned
   * @return a double for the mass
   */
  function computeMassRichSequence(richSeq, charge) {

    var rawMass = 0;

    _.each(richSeq.get('sequence'), function(raa) {
      rawMass += computeMassRichAA(raa)
    });

    rawMass += MASS_OH + MASS_H;
    rawMass += computeMassModifArray(richSeq.get('nTermModifications')) + computeMassModifArray(richSeq.get('cTermModifications'));
    if (!charge) {
      return rawMass
    }
    return rawMass / charge + MASS_HPLUS;
  }

  /**
   * compute the theoretical mass spectrum. b, b++, y, y++
   * @return a theoretical spectrum
   */
  function computeTheoSpectrum(richSeq) {
    var rawMasses = [computeMassModifArray(richSeq.get('nTermModifications'))].concat(_.collect(richSeq.get('sequence'), computeMassRichAA));
    var n = rawMasses.length;
    for ( i = 1; i < n; i++) {
      rawMasses[i] += rawMasses[i - 1]
    }
    var mtot = rawMasses[n - 1];

    var theoSp = new TheoSpectrum({
      fragSeries : ['b', 'b++', 'y', 'y++'],
      lenSeq : richSeq.size(),
      peaks : [],
      richSequence : richSeq
    });
    var peaks = theoSp.get('peaks');
    for ( i = (rawMasses[0] >= 100) ? 0 : 1; i < rawMasses.length; i++) {

      var rm = rawMasses[i];
      //            console.log(rm, i)
      peaks.push({
        label : 'b' + i,
        series : 'b',
        moz : rm + MASS_HPLUS,
        pos : i - 1
      });
      peaks.push({
        label : 'b++' + i,
        series : 'b++',
        moz : rm / 2 + MASS_HPLUS,
        pos : i - 1
      });
    }

    var mcterminus = computeMassModifArray(richSeq.get('cTermModifications'))
    for ( i = 0; i < rawMasses.length; i++) {
      var ym = mtot - rawMasses[i] + MASS_OH + MASS_H + mcterminus;
      if ((i == rawMasses.length - 1 ) && ym < 100) {
        break;
      }

      peaks.push({
        label : 'y' + (n - i - 1),
        series : 'y',
        moz : ym + MASS_HPLUS,
        pos : i
      });
      peaks.push({
        label : 'y++' + (n - i - 1),
        series : 'y++',
        moz : ym / 2 + MASS_HPLUS,
        pos : i
      });
    }
    peaks.sort(function(a, b) {
      return a.moz - b.moz
    });
    return theoSp
  }

  return new MassBuilder();
});

/*
 * function to compute delta masses.
  * Only ppm is implemented, but that should be the handler for other units (Da etc..)
  *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define('fishtones/utils/DeltaMass',['underscore'], function(_) {
    var DeltaMass = function() {
        var self = this;

        /**
         * symmetrically correct ppm computation (x-y) should equal to (y-x)
         *
         * @type {{delta: delta, range: range, isCloseTo: isCloseTo}}
         */
        self.ppm = {
            /**
             * distance between two masses
              * @param x
             * @param y
             * @return {number}
             */
            delta : function(x, y) {
                return 2 * (y - x) / (y + x) * 1000000;
            },
            /**
             * return mass boundaries for x +- tol
             * @param x
             * @param tol
             * @return {[mMin, mMax]}
             */
            range : function(x, tol) {
                tol = Math.abs(tol) / 1000000.0;
                var f = (2 + tol) / (2 - tol);
                
                return (x>=0)?[x / f, x * f]:[x * f, x / f]
            },
            /**
             * we have two version:
             *  - with three params, return true/false if (target & tol are closer than candidate)
             *  - with two parameters, return a function that will take w paremter of type candidate; this should be much faster
             * @param {Object} target
             * @param {Object} tol
             * @param {Object} candidate
             */
            isCloseTo : function(target, tol, candidate) {
                if (candidate !== undefined) {
                    return Math.abs(2 * (candidate - target) / (candidate + target) * 1000000) <= tol
                }
                var r = self.ppm.range(target, tol);
                return function(c) {
                    return c >= r[0] && c <= r[1]
                }
            }
        }

    }

    return new DeltaMass();

})
;
/*
 * Abstract what was only PSMAlignment into alignment of two beans with function .mozs() (getting back the list of masses)
 * The point is to align exp/theo, but also exp/exp
 *
 * This will be populated with pklA and pklB, each of them having a .mozs() function.
 *
 * NB: the way the alignment is performed not... efficient. we compute again and again the closest peak with the dichotomy methods, instead of moving  with a single, one shot linear/dicho method...
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */


define('fishtones/models/match/PeakListPairAlignment',['jquery', 'underscore', 'Backbone', 'fishtones/utils/DeltaMass'], function ($, _, Backbone, DeltaMass) {
    var closestPeak = function (x, xpeaks) {

        if (x <= xpeaks[0]) {
            return 0
        }
        var isup = xpeaks.length - 1;
        if (x >= xpeaks[isup]) {
            return isup
        }
        var iinf = 0;

        while ((iinf + 1) < isup) {
            var imid = Math.round((iinf + isup) / 2);
            if (x < xpeaks[imid]) {
                isup = imid
            } else {
                iinf = imid;
            }
        }
        return ((x - xpeaks[iinf]) < (xpeaks[isup] - x)) ? iinf : isup;
    }

    return Backbone.Model.extend({
        initialize: function (options) {
            var self = this;
        },
        /**
         * get the matching peak indices from A to B
         * @return {*}
         * @private
         */
        matchIndices: function () {
            var self = this;
            var mozsA = self.get('pklA').mozs();
            var mozsB = self.get('pklB').mozs();

            var nA = mozsA.length;
            var nB = mozsB.length;
            if (nA * nB == 0)
                return [];

            var iA = 0;
            var iB = 0;
            var curDelta = DeltaMass.ppm.delta(mozsB[0], mozsA[0]);
            var lastMatch = {
                iA: 0,
                iB: 0,
                errorPPM: curDelta
            };
            var ret = [lastMatch];
            while (iA < nA && iB < nB) {
                var incA;
                if (mozsA[iA] < mozsB[iB]) {
                    incA = true;
                    iA += 1;
                    if (iA == nA)
                        break;
                } else {
                    incA = false;
                    iB += 1;
                    if (iB == nB)
                        break;
                }

                var newDelta = DeltaMass.ppm.delta(mozsB[iB], mozsA[iA]);
                if (Math.abs(newDelta) < Math.abs(curDelta)) {
                    if (lastMatch === undefined) {
                        lastMatch = {}
                        ret.push(lastMatch);

                    }
                    lastMatch.iA = iA;
                    lastMatch.iB = iB;
                    lastMatch.errorPPM = newDelta;

                } else {
                    curDelta = 9999999999999999.0;
                    lastMatch = undefined;
                }
                curDelta = newDelta;
            }
            return ret;

        },
        matches: function () {
            return this.matchIndices();
        },
        /**
         * @ return the list of matches closer than a given tolerance
         */
        closerThanPPM: function (tol) {
            var self = this;
            var m = _.filter(self.get('matches'), function (m) {
                return (Math.abs(m.errorPPM) < tol)
            });
            return m
        }
    });
});

/**
 * extends PeakListPairAlignment to map the closest peak of an experimental and theoretical spectra. Both must be sorted by mozs.
 * Properties are
 * - richSequence
 * - expSpectrum
 *
 * alignment is recomputed on property change.
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define('fishtones/models/match/PSMAlignment',['jquery', 'underscore', 'Backbone', 'fishtones/services/dry/MassBuilder', './PeakListPairAlignment'], function($, _, Backbone, massBuilder, PeakListPairAlignment) {

    /**
     * build the alignment with options {richSequence:..., expSpectrum:...}
     */
    var PSMAlignment = PeakListPairAlignment.extend({
        initialize : function(options) {
            var self = this;
            PSMAlignment.__super__.initialize.call(this, {});

            self.set('richSequence', options.richSequence);
            self.set('expSpectrum', options.expSpectrum);

            self.build()

            self.get('expSpectrum').on("change", function() {
                self.build()
            })
            self.get('richSequence').on("change", function() {
                self.build()
            })
            self.on("change:richSequence", function() {
                self.build()
            })
        },

        /**
         * compute the underlying alignment
         * @private
         */
        build : function() {
            var self = this;

            self.set('theoSpectrum', massBuilder.computeTheoSpectrum(self.get('richSequence')));

            self.set('pklA', self.get('theoSpectrum'))
            self.set('pklB', self.get('expSpectrum'))

            var matchIndices = self.matchIndices();
            var spTheo = self.get('theoSpectrum').get('peaks');
            var xpeaks = self.get('expSpectrum').get('mozs');
            var xIntensities = self.get('expSpectrum').get('intensityRanks');

            var matches = _.map(matchIndices, function(mi) {
                return {

                    theo : spTheo[mi.iA],
                    exp : {
                        index : mi.iB,
                        moz : xpeaks[mi.iB],
                        intensityRank : xIntensities[mi.iB],
                    },
                    errorPPM : mi.errorPPM
                }
            })
            self.set('matches', matches);

        },
   
        /**
         * difference between the experimental precurso mass and the sequence mass (MH)
         */
        deltaPrecMozs : function() {
            var self = this;
            var z = self.get('expSpectrum').get('precCharge');
            var theo = massBuilder.computeMassRichSequence(self.get('richSequence'), z)
            return (self.get('expSpectrum').get('precMoz') - theo) * z
        },
        /**
         *
         * @return {{}} a jso ready string
         */
        serialize : function() {
            var self = this;
            var ret = {};
            ret.expSpectrum = self.get('expSpectrum').toJSON()

            var rseq = self.get('richSequence').toString();
            ret.richSequence = rseq

            ret.id = self.computeId();
            ret.aaSequence = self.get('richSequence').toAAString();

            return ret;
        },
        computeId : function() {
            var self = this;
            return self.get('expSpectrum').get('id') + '|' + self.get('richSequence').toString()

        },
        /**
         * return the number of unmatched experimental peak, with a mass greater than the precursor,
         * intensity < inFirst and with tol error
         * @param {Object} tol
         * @param {Object} inFirst
         * @return an integer count
         */
        unmatchedFactor : function(tol, inFirst) {
            var self = this;
            var matches = self.closerThanPPM(tol);

            var pks = _.filter(_.zip(self.get('expSpectrum').get('mozs'), self.get('expSpectrum').get('intensityRanks')), function(p) {
                return p[1] < inFirst
            });

            var mPrec = self.get('expSpectrum').get('precMoz')
            return _.filter(pks, function(p) {
                return p[0] > mPrec;
            }).length - _.filter(matches, function(m) {
                return (m.exp.intensityRank < inFirst) && (m.exp.moz > mPrec);
            }).length

        }
    });
   
    return PSMAlignment;
});

/**
 * an ImplicitModifier is to be linked to labelling or to a global attribution of modification.
 * It easier to say a peptide is Silac either than adding Silac mass shift oin every K & R.
 * This can be even lighter with 13C15N label, where every amino acid is modified with a mass shift (represented as a residue modification).
 * Multiple labels can be applied on the same sequence (there is a defined list of precedence)
 *
 * ImplicitModifier has to know the odds of each labeling method. For example, K can still be propionylated if it has a Methyl, but not a Dimethyl.
 *
 * The main method are
 * label(labName, richSeq): add all the label modification to a given peptide
 * unlabel(labNam, richSequence): remove the modification tighten to this label (if there were enough to label the sequence).
 * getLabel(richSeq): get the label fitting the given richSequence
 *
 * There is a vast set of test available in the ImplicitModifier-tests.js
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define('fishtones/services/dry/ImplicitModifier',['jquery', 'underscore', 'Backbone', 'fishtones/models/dry/RichSequence', 'fishtones/collections/dry/ResidueModificationDictionary'], function ($, _, Backbone, RichSequence, dicoResMod) {

    /**
     * labelers are the essence of the implicit labelling
     * they are functions, defined for each prop, prop_d10, silac or whatever, that take a richSequenece and a position and return a modification (or undefined) that should occur there.
     * We need all that because for example for propionylation, we must know if there is alreadn a mono- or a di-methylation on the site...
     *
     * propionylLabeler is just an private function to label K + nterm with propionyl d0 or d5
     */

    var aquaModifs = {};
    _.each('VDLITGFAY'.split(''), function(aa){
    	aquaModifs[aa] =  dicoResMod.get('AQUA_'+aa)
    });
    _.each(aquaModifs, function(mod, aa) {
        dicoResMod.add({
            name : 'de_' + mod.get('name'),
            fullName : 'de_' + mod.get('fullName'),
            mass : -mod.get('mass')
        });
    })
    var propionylLabeler = function(pmod) {
        return function(richSeq, pos) {
            if (pos == -1) {
                if (richSeq.countModificationsAt(-1) > 0) {
                    var mods = richSeq.modifAt(-1);
                    if (mods.length == 1 && mods[0] == pmod) {
                        return pmod;
                    } else {
                        return undefined
                    }
                }
                return pmod;
                //(richSeq.countModificationsAt(-1) > 0) ? undefined : pmod
            }
            if (pos == richSeq.size()) {
                return undefined
            }

            if (richSeq.aaAt(pos).get('code1') === 'K') {
                if (_.any(richSeq.modifAt(pos), function(rm) {
                    return !/(Methyl|Propionyl.*)/.test(rm.get('name'));
                })) {
                } else {
                    return pmod;
                };
            };
            return undefined;
        }
    };

    var labelers = {
        none : function() {
            return undefined;
        },
        prop_d0 : propionylLabeler(dicoResMod.get('Propionyl')),
        prop_d5 : propionylLabeler(dicoResMod.get('Propionyl:2H(5)')),
        '13C15N' : function(richSeq, pos) {
            if (pos == -1 || pos == richSeq.size()) {
                return undefined
            }

            var aa = richSeq.aaAt(pos).get('code1');
            return dicoResMod.get('13C15N-' + aa);
        },
        'aqua' : function(richSeq, pos) {
            if (pos == -1 || pos == richSeq.size()) {
                return undefined;
            }
            return aquaModifs[richSeq.aaAt(pos).get('code1')];
        },
        'de_aqua' : function(richSeq, pos) {
            if (pos == -1 || pos == richSeq.size()) {
                return undefined;
            }

            var am = _.filter(richSeq.modifAt(pos), function(rm){
                return rm.get('name').indexOf('AQUA_') === 0;
                
            })[0];
            if(am === undefined ){
                return undefined;
            }
            return dicoResMod.get('de_'+am.get('name'));
        },
        silac : function(richSeq, pos) {
            if (pos == -1 || pos == richSeq.size()) {
                return undefined
            }

            var aa = richSeq.aaAt(pos).get('code1');

            if (aa === 'K') {
                return dicoResMod.get('Label:13C(6)15N(2)');
            }
            if (aa === 'R') {
                return dicoResMod.get('Label:13C(6)15N(4)');
            }
            return undefined;
            undefined
        },
        'super_silac' : function(richSeq, pos) {
            if (pos == -1 || pos == richSeq.size()) {
                return undefined;
            }

            var aa = richSeq.aaAt(pos).get('code1');

            if (aa === 'K') {
                return dicoResMod.get('Label:13C(6)15N(2)')
            }

            return undefined;
        }
    };
    labelers.prop_d5_nterm = function(richSeq, pos) {
        if (pos == -1) {
            return dicoResMod.get('Propionyl:2H(5)');
        }
        return labelers.prop_d0(richSeq, pos);
    };
    labelers.pic = function(richSeq, pos) {
        if (pos != -1) {
            return undefined
        }
        return dicoResMod.get('PIC');
        //return (richSeq.countModificationsAt(-1) > 0) ? undefined : dicoResMod.get('PIC');
    };
    labelers.pic_heavy = function(richSeq, pos) {
        if (pos != -1) {
            return undefined
        }
        return dicoResMod.get('PIC_HEAVY');
        //return (richSeq.countModificationsAt(-1) > 0) ? undefined : dicoResMod.get('PIC');
    };
    var labelersOrder = {
        '13C15N' : 3,
        'aqua' : 4,
        'de_aqua' : 4,
        prop_d0 : 10,
        prop_d5 : 9,
        prop_d5_nterm : 15,
        pic : 5,
        pic_heavy : 5,
        silac : 100,
        super_silac : 90,
        none : 1000
    }

    ImplicitModifier = function() {
        var self = this;
        self.labelers = labelers;
        self.labelersOrder = labelersOrder;

        return self
    };

    /**
     * Add all modification associated to the label on the richSequence object
     * @param {Object} labelNames a comma separated list of labels, or an array of string (we can have 'silac,prop_d0', or 'prop_d5')
     * @param {Object} richSequence
     */
    ImplicitModifier.prototype.label = function(labelNames, richSequence) {
        var self = this;
        var s = richSequence.size();
        if (! _.isArray(labelNames)) {
            labelNames = labelNames.split(',')
        }
        _.each(_.sortBy(labelNames, function(lname) {
            return self.labelersOrder[lname] || 100000;
        }), function(lname) {
            for (var i = -1; i <= s; i++) {
                var m = self.labelers[lname](richSequence, i);
                if (m !== undefined) {
                    richSequence.addModification(i, m);
                }
            }
        })
    }
    /**
     * just returns a sorted (alphanumeric) list of the available labels
     */
    ImplicitModifier.prototype.availableLabels = function() {
        return _.keys(this.labelers).sort();
    }
    /**
     * Remove all modification associated to the label on the richSequence object.
     * At this stage, we assume the richSequence has the modif associated with the label
     * @param {Object} labelNames a comma separated list of labels (we can have 'silac,prop_d0', or 'prop_d10')
     * @param {Object} rishSequence
     */
    ImplicitModifier.prototype.unlabel = function(labelNames, richSequence) {
        var self = this;

        var s = richSequence.size();
        if (! _.isArray(labelNames)) {
            labelNames = labelNames.split(',')
        }
        _.each(_.sortBy(labelNames, function(lname) {
            return -(self.labelersOrder[lname] || 100000);
        }), function(lname) {
            for ( i = -1; i <= s; i++) {
                var modifs = richSequence.getModificationArray(i);
                if (!modifs) {
                    continue;
                }
                modifs = _.difference(modifs, self.labelers[lname](richSequence, i));
                richSequence.setModificationArray(i, modifs)

            }
        });
    }
    /**
     * returns an array with the modified poisitions, once labeing modif have been removed
     * (-1 => nterm)
     */
    ImplicitModifier.prototype.nonimplicitModifiedPos = function(richSequence) {
        var self = this;
        var rs = richSequence.clone();
        self.getLabelsAndClean(rs);
        return _.filter(_.range(-1, rs.size()), function(i) {
            return rs.countModificationsAt(i) > 0;
        })
    }
    /**
     * return true/false if the RichSequence is filled with the modification corresponding to the given label.
     * i.e. we can remove all the modif and consider the RichSequence as implicitely modified
     * @param {Object} labelName one label name
     * @param {Object} rishSequence
     */
    ImplicitModifier.prototype.isLabeled = function(labelName, richSequence) {
        var self = this;

        var atLeastOne = false
        return _.all(_.range(-1, richSequence.size() + 1), function(i) {
            var expectedModif = self.labelers[labelName](richSequence, i);
            if (expectedModif === undefined) {
                return true
            }

            if (richSequence.countModificationsAt(i) == 0) {
                return false;
            }

            atLeastOne = true;

            return _.any(richSequence.getModificationArray(i), function(m) {
                return m == expectedModif;
            });

        }) && atLeastOne;

    }
    /**
     * clean up the implicit modifications  and return a list of (sorted alpha) label names that were used for cleanup
     * @param {Object} richSequence
     */
    ImplicitModifier.prototype.getLabelsAndClean = function(richSequence) {
        var self = this;

        var labels = [];
        _.each(_.sortBy(_.keys(self.labelersOrder), function(lname) {
            return -(self.labelersOrder[lname] || 100000);
        }), function(lname) {
            if (!self.isLabeled(lname, richSequence)) {
                return
            }
            self.unlabel(lname, richSequence);
            labels.push(lname)
        });
        return labels.sort()
    }
    return new ImplicitModifier();
});

/**
 * a rectangular, no legend color PSMAlignment widget
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define('fishtones/views/match/MatchMapSlimView',['underscore', 'Backbone', '../commons/CommonWidgetView', 'fishtones/services/dry/ImplicitModifier'], function(_, Backbone, CommonWidgetView, implicitModifier) {

    MatchMapSlimView = CommonWidgetView.extend({
        defaults : {
            height : 12,
            tol : 500
        },
        initialize : function(options) {
            MatchMapSlimView.__super__.initialize.call(this, arguments)
            var self = this;
            self.height = options.height || 12;
            self.tol = options.tol || 500;

        },
        render : function() {
            var self = this;

            var theoSpectrum = self.model.get('theoSpectrum');
            var nbSeries = theoSpectrum.get('fragSeries').length

            // get frag series -> ordinate
            var series2j = {};
            var i = 0;
            _.each(theoSpectrum.get('fragSeries'), function(fs) {
                if (series2j[fs[0]] !== undefined) {
                    return
                }
                series2j[fs[0]] = i++;
            });

            var hRow = self.height / _.keys(series2j).length;
            var wCol = hRow;

            var lenSeq = theoSpectrum.get('lenSeq');
            var wText = 30;
            var width = lenSeq * wCol + wText;
            var height = self.height;

            var fs2j = function(fs) {
                return (series2j[fs[0]]) * hRow;
            }
            // data matches
            var dmatches = self.model.closerThanPPM(self.tol);

            var rectBg = self.el.append('rect').attr('class', 'background').attr('width', width).attr('height', height)
            var gRoot = self.el.append('g').attr('class', 'frag-color-match');
            prect = gRoot.selectAll('rect').data(dmatches).enter()
            prect.append('rect').attr('class', function(dm) {
                var irk = dm.exp.intensityRank;
                return "rk-" + ((irk < 40) ? Math.floor(irk / 10) : 'x')
            }).attr('x', function(dm) {
                if (dm.theo.series < 'g')
                    return (dm.theo.pos + 0.5) * wCol
                if (dm.theo.pos == 0)
                    return 0
                return (dm.theo.pos - 0.5) * wCol
            }).attr('y', function(dm) {
                return fs2j(dm.theo.series)
            }).attr('width', function(dm) {
                if ((dm.theo.pos == 0) && (dm.theo.series > 'g'))
                    return wCol / 2;
                if ((dm.theo.pos == lenSeq - 1) && (dm.theo.series < 'g'))
                    return wCol / 2;
                return wCol;
            }).attr('height', hRow).attr('title', function(dm) {
                return dm.theo.label
            });

            var modPos = implicitModifier.nonimplicitModifiedPos(self.model.get('richSequence'));
            gRoot.selectAll('rect.modified-site').data(modPos).enter().append('rect').classed('modified-site', true).attr('x', function(i) {
                return i * wCol;
            }).attr('y', 0).attr('height', self.height).attr('width', wCol);

            var g = self.el.append('g').attr('transform', 'translate(' + (width - wText) + ',0)');
            g.append('rect').classed('match-box-text-bg', true).attr('width', wText).attr('height', self.height);
            
            g.append('g').attr('transform', 'translate('+(wText - 5)+',2),scale('+height+','+height+')').
            append('text').classed('unmatched-factor', true).text("/" + self.model.unmatchedFactor(self.tol, 10))

            self.dim = {
                height : self.height,
                width : width
            }
            return self.dim
        }
    });

    return MatchMapSlimView;
});

/**
 * The PQ widget (PQ = "toilet paper" in french) is disk projected data, which can be pulled of when mousing over
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define('fishtones/views/utils/PQView',['underscore', 'd3'], function(_, d3) {

  PQView = function(target, options) {
    options = $.extend({}, options);
    this.radius = options.radius || 50;
    this.time = options.time || 125;
    this.rotating = 0;
    this.onclick = options.onclick;

    if ( typeof target == 'object') {
      this.vis = target.append('g')

    } else {
      this.vis = d3.select(target).append('g')
    }
  }

  PQView.prototype.build = function(sectorClasses, rectBuildFunction) {
    var self = this;
    self.len = sectorClasses.length;
    self.sectorClasses = sectorClasses;

    self.svgRect = self.vis.append('g').attr('transform', 'translate('+ self.radius+',0)');
    self.rect = self.svgRect.append('g').attr('class', 'rect-container');
    self.dimRect = rectBuildFunction(self.rect);
    self.svgRect.attr('width', self.dimRect.width)

    self.rect.attr('transform', 'scale(0,1)');
    self.svgRect.attr('x', self.radius);
    self.vis.attr('height', 2 * self.radius).attr('width', self.radius + self.dimRect.width);

  }

  PQView.prototype.draw = function(options) {
    var self = this;
    var circle = self.vis.append('g').attr('transform', 'translate(' + self.radius + ',' + self.radius + ')').append('g');

    var arc = d3.svg.arc().outerRadius(self.radius).innerRadius(0).startAngle(function(v, i) {
      return 2 * 3.14 * i / self.len;
    }).endAngle(function(v, i) {
      return 2 * 3.14 * (i + 1) / self.len;
    });
    var pcirc = circle.selectAll('g.circle').data(self.sectorClasses).enter().append('g').attr('class', 'circle');
    pcirc.append('path').attr('d', arc).attr('class', function(d, i) {
      return d + ' sector sector-' + i
    }).attr('fill', function(d) {
      return d3.rgb(255 / 10 * d, 255 / 10 * d, 255 / 10 * d)
    });
    var mskCircle = circle.append('circle').attr('r', self.radius).attr('fill-opacity', '0').attr('fill', 'yellow').style('cursor', 'hand');

    mskCircle.on('mouseover', function() {
      self.rollOut(circle);
    });
    mskCircle.on('mouseout', function() {
      self.rollBack(circle);
    });
    if (self.onclick) {
      mskCircle.on('click', self.onclick);
    }
  }

  PQView.prototype.move = function(x, y) {
    var self = this;
    this.vis.attr('transform', 'translate(' + (x - self.radius) + ',' + (y - self.radius) + ')').style('left', x + 'px').style('left', y + 'px').style('position', 'relative');
    return this
  }

  PQView.prototype.rollOut = function(circle, options) {
    var self = this;
    if (self.rotating > 0) {
      return;
    }
    self.rotating = 1;
    var cpt = 0;
    var dt = self.time / self.len;
    var wRect = self.dimRect.width;
    for ( i = 0; i < self.len; i++) {
      setTimeout(function() {
        if (self.rotating <= 0) {
          return;
        }
        circle.attr('transform', 'rotate(' + ((cpt + 1) / self.len * 360) + ')');
        cpt++;
        self.rect.attr('transform', 'scale(' + ((i + 1) / self.len) + ',1)');
        //);'translate(' + ((cpt - self.len) * wRect / self.len) + ',0)');

        circle.selectAll('.sector-' + (self.len - cpt)).attr('display', 'none');
        if (cpt == self.len) {
          self.rotating = 0;
        }
      }, i * dt);
    }
  }
  PQView.prototype.rollBack = function(circle, options) {

    var self = this;
    if (self.rotating < 0) {
      return;
    }
    self.rotating = -1;
    var cpt = self.len - 1;
    var dt = self.time / self.len;
    var wRect = self.dimRect.width;
    for ( i = 0; i < self.len; i++) {
      setTimeout(function() {
        if (self.rotating >= 0) {
          return
        }
        circle.attr('transform', 'rotate(' + (cpt / self.len * 360) + ')');
        //        var tr = 'translate(' + ((cpt - self.len) * wRect / self.len) + ',0)';
        var tr = 'scale(' + (1 - i / self.len) + ',1)';
        self.rect.attr('transform', tr);

        var sel = '.sector-' + (self.len - cpt - 1);
        circle.selectAll(sel).attr('display', null)
        cpt--;
        if (cpt < 0) {
          self.rotating = 0;
        }
      }, i * dt);
    }

  }

  return PQView;
});

/*
 * witdget to display PSM, based on the spectrum perspective
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define('fishtones/views/match/MatchSpectrumView',['underscore', 'd3', '../commons/CommonWidgetView', 'fishtones/views/utils/D3ScalingContext', 'fishtones/views/utils/D3ScalingArea'], function (_, d3, CommonWidgetView, D3ScalingContext, D3ScalingArea) {

    MatchSpectrumView = CommonWidgetView.extend({
        defaults: {
        },
        initialize: function (options) {
            MatchSpectrumView.__super__.initialize.call(this, options)
            var self = this;

            options = $.extend({}, options);
            self.options = options;

            self.tol = options.tol || 500;

            self.heightXAxis = 21;
            self.peaksBaselineHeight = 10;

            if (options.flying) {
                self.el = d3.select('body');
                self.isFlying = true;
            } else {
                self.isFlying = false;
            }
            self.p_setup();

            if (self.options.xZoomable) {
                self.xZoomable();
            }

        },
        p_setup: function () {
            var self = this;
            // var evt = d3.mouse(self.container);
            self.vis = self.el.append('svg')
            self.vis.attr('width', self.width()).attr('height', self.height()).attr('class', 'd3-widget-match-spectrum');
            if (self.isFlying) {
                var x = d3.event.pageX + 10;
                var y = d3.event.pageY - self.height() * 2 / 3;
                self.vis.style('left', x + 'px').style('top', y + 'px');
                self.p_flying_dont_fly_away();

            }
            // self.vis.append('rect').attr('width', '100%').attr('height', '100%').attr('fill', '#ddd').attr('class', 'background');

            self.p_setup_title();

            if (self.isFlying) {
                self.buttonContainer = self.vis.append('g').attr('class', 'button-container right-align').attr('transform', 'translate(' + self.width() + ',0)')
                self.p_setup_menu_buttons();
            }

            // add spectrum
            var expSp = self.model.get('expSpectrum');
            var hSpectrum = self.height() - 20 - self.heightXAxis;

            self.p_build_data();
            self.setupScalingContext({
                xDomain: [expSp.get('mozs')[0] * 0.95, expSp.get('mozs')[expSp.size() - 1] * 1.05],
                yDomain: [0, _.max(_.pluck(self.data.peaks, 'y')) * 1.2],
                height: hSpectrum - self.peaksBaselineHeight,
                width: self.width()
            })

            var svgsp = self.vis.append('g').attr('transform', 'translate(0,20)');
            self.svgsp = svgsp;

            self.scalingArea = new D3ScalingArea({
                el: svgsp,
                model: self.scalingContext,
                callback: function () {
                    self.render()
                },
                height: hSpectrum,
                width: self.width()
            });

            self.d3HolderXAxis = svgsp.append('g').attr('class', 'xaxis').attr('transform', 'translate(0,' + hSpectrum + ')');
            self.d3holderPrecursor = svgsp.selectAll('g.precursor').data(self.data.precursor).enter().append('g')
            self.d3holderPrecursor.append('path').attr('class', 'precursor').attr('d', 'M0,-20L10,0L-10,0L0,-20').attr('x', function (p) {
                return p.x;
            });
            self.d3holderPeaks = svgsp.selectAll('line.peak').data(self.data.peaks).enter().append('line').attr('class', function (pk) {
                var clazz = 'peak';
                if (pk.label !== undefined) {
                    clazz += ' matched frag-series-' + pk.label.label.series.replace('++', '')
                } else {
                    clazz += ' unmatched'
                }
                return clazz
            });
            self.d3holderPeaksTruncated = svgsp.selectAll('line.peak-truncated').data(self.data.peaksTruncated).enter().append('line');

            self.p_setup_labels();

        },
        /**
         * div with flying spectrum is poistion somwhere (by the ventsource, for example)
         * nervertheless, it should not go outside the main window
         */
        p_flying_dont_fly_away: function () {
            var self = this;

            var x = parseInt(self.vis.style('left'));
            var y = parseInt(self.vis.style('top'));
            var minDist = 20;

            x = Math.max(x, minDist);
            x = Math.min(x, window.innerWidth - self.width() - minDist);

            y = Math.max(y, minDist);
            y = Math.min(y, $(document).height() - self.height() - minDist)

            self.vis.style('left', x)
            self.vis.style('top', y)

        },
        p_setup_labels: function () {
            var self = this;

            self.svgsp.selectAll('g.label').remove();
            self.d3holderLabels = self.svgsp.selectAll('g.label').data(self.data.labels).enter().append('g');
            self.d3holderLabelsPath = self.d3holderLabels.append('path')
            self.d3holderLabelsTextG = self.d3holderLabels.append('g')
            self.d3holderLabelsText = self.d3holderLabelsTextG.append('text')
            return self
        },
        p_setup_title: function () {
            var self = this;
            // title
            var expSp = self.model.get('expSpectrum')
            var title = 'scan: ' + expSp.get('scanNumber') + ' (' + (Math.round(expSp.get('retentionTime')) / 60).toFixed(1) + 'min) ' + expSp.get('precCharge') + '+ ' + expSp.get('precMoz').toFixed(4) + 'Da';
            self.vis.append('text').attr('x', 5).attr('y', 5).attr('class', 'title').text(title);
            self.vis.append('rect').attr('height', '20').attr('width', '100%').attr('class', 'title').text(title);

        },
        p_new_button: function () {
            var self = this;
            var n = self.buttonContainer.selectAll('g.button-container')[0].length
            return self.buttonContainer.append('g').attr('class', 'button-container').attr('transform', 'translate(-' + (n + 1) * 42 + ',2)');
        },
        p_setup_menu_buttons: function () {
            var self = this;

            var addButton = function (gbut, text, options) {
                var elWrapper = gbut.append('g');
                //.attr('transform', 'scale(' + (options.size / 40) + ',' + (options.size / 40) + ')');
                gbut.classed('button', true);
                elWrapper.append('rect').attr('width', 40).attr('height', 16).attr('rx', 4).attr('ry', 4).classed('button', true);
                gbut.append('text').attr('x', 20).attr('y', 11).text(text);
                if (options && options.cursor) {
                    gbut.style('cursor', options.cursor);
                }
                return gbut;
            }
            // close
            var gbut = self.p_new_button();
            addButton(gbut, 'close').on('click', function () {
                self.close()
            });

            // resize
            gbut = self.p_new_button();

            addButton(gbut, 'larger').on('click', function () {
                if (self.height() < 300) {
                    self.resize({
                        height: 400,
                        width: Math.min($(document).width() * 0.9, 1000)
                    })
                } else {
                    self.resize({
                        height: 200,
                        width: 500
                    });
                }

            });

            // drag
            gbut = self.p_new_button();
            addButton(gbut, 'move', {
                cursor: 'move'
            });
            // setup draggin
            var dragCoord = {
                x: 1000,
                y: 1000
            };
            var drag = d3.behavior.drag().on("dragstart", function (d) {
                dragCoord = {
                    mx: d3.event.sourceEvent.pageX,
                    my: d3.event.sourceEvent.pageY,
                    vx: parseInt(self.vis.style('left').replace('px', '')),
                    vy: parseInt(self.vis.style('top').replace('px', '')),
                };
            }).on("drag", function (d) {
                mx = d3.event.sourceEvent.pageX;
                my = d3.event.sourceEvent.pageY;

                self.vis.style("left", (dragCoord.vx + mx - dragCoord.mx) + 'px').style("top", (dragCoord.vy + my - dragCoord.my) + 'px');
            });
            gbut.call(drag);

            //edit
            if (self.options.editUrl) {
                gbut = self.p_new_button();

                addButton(gbut, 'edit');
                gbut.on('click', function () {
                    window.open(self.options.editUrl, 'epi-show__ID_INTERACTIVE__XIC')
                });

                // //.append('text').attr('y', 14).text('?')
                // var b = d3Glyphicons.append(a, 'binoculars', {
                // size : 24,
                // button : true
                // });

            }

        },
        /*
         * build data ready for plotting: - peaks - label - precursor
         * TODO: attache label to peak, filter data on _.pluck(peaks, 'label').filter(function(l){return l!== undefined})
         * so everything is attached together at once
         * TODO attache the truncated info in the same way.
         * TODO at view time, we can start every thing on a g shift to the correct position
         */
        p_build_data: function () {
            var self = this;
            var expSp = self.model.get('expSpectrum');

            var ret = {};
            var dmatches = self.model.closerThanPPM(self.tol)

            var labeledPeaks = [];
            ret.labels = _.collect(dmatches, function (dm) {
                var ret = {
                    x: dm.exp.moz,
                    y: expSp.get('intensities')[dm.exp.index],
                    label: dm.theo
                };
                labeledPeaks[dm.exp.index] = ret;
                return ret;
            });

            ret.peaks = _.collect(_.zip(expSp.get('mozs'), expSp.get('intensities'), expSp.get('intensityRanks')), function (p, i) {
                var pk = {
                    x: p[0],
                    y: p[1],
                    intRank: p[2]
                }
                if (labeledPeaks[i] !== undefined) {
                    pk.label = labeledPeaks[i];
                }
                return pk;
            });
            ret.peaksTruncated = []
            var sortedIntensities = _.chain(ret.peaks).pluck('y').sort(function (a, b) {
                return b - a
            }).value();
            if (sortedIntensities[0] > 1.5 * sortedIntensities[1]) {
                var maxIntens = sortedIntensities[1] * 1.1;
                _.chain(ret.peaks).filter(function (p) {
                    return p.y > maxIntens
                }).each(function (p) {
                    p.y = maxIntens;
                    ret.peaksTruncated.push(p);
                });
            }

            ret.precursor = [
                {
                    x: expSp.get('precMoz')
                }
            ]

            self.data = ret;
            return ret;
        },
        close: function () {
            this.vis.remove();
        },

        resize: function (options) {
            var self = this;

            var h = options.height || 200;
            self.height(h).width(options.width || 500);

            self.vis.attr('height', h)
            self.vis.attr('width', self.width())

            self.scalingContext.height(self.height() - self.heightXAxis - self.peaksBaselineHeight - 20);
            // 20 for the menu line,
            // 10 for water line -
            // ugly, nei?
            self.scalingContext.width(self.width())

            self.vis.selectAll('.right-align').attr('transform', 'translate(' + self.width() + ',0)');
            if (self.isFlying) {
                self.p_flying_dont_fly_away()
            }

            self.render()
        },
        refresh: function () {
            var self = this;
            self.p_build_data();
            self.p_setup_labels();
            self.render();
        },
        render: function () {
            var self = this;

            var x = self.scalingContext.x();
            var y = self.scalingContext.y();

            self.d3holderPrecursor.attr('transform', function (p) {
                var t = 'translate(' + x(p.x) + ',' + (y(0) + 9) + ')';
                return t;
            })
            var xAxis = d3.svg.axis().scale(x).ticks(7).tickSize(5);
            self.d3HolderXAxis.call(xAxis);

            self.d3holderPeaks.attr('x1', function (p) {
                return x(p.x);
            }).attr('x2', function (p) {
                return x(p.x);
            }).attr('y1', function (p) {
                return y(0) + self.peaksBaselineHeight;
            }).attr('y2', function (p) {
                return y(p.y);
            });

            self.vis.selectAll('rect.peak-baseline').remove();
            self.vis.append('rect').attr('class', 'peak-baseline relative-size').attr('y', self.height() - self.peaksBaselineHeight - self.heightXAxis).attr('height', self.peaksBaselineHeight).attr('width', self.width() - 2).attr('x', 1).attr('relativeWidth', -2);

            self.d3HolderXAxis.attr('transform', 'translate(0,' + (self.height() - 20 - self.heightXAxis) + ')');

            self.d3holderPeaksTruncated.attr('class', 'peak-truncated').attr('x1', function (p) {
                return x(p.x);
            }).attr('x2', function (p) {
                return x(p.x);
            }).attr('y1', function (p) {
                return y(p.y);
            }).attr('y2', function (p) {
                0;// return self.scalingContext.yScale()(p.y)-20;
            });

            var labY = function (p) {
                return Math.max(y(p.y) - 28, 8)
            }
            self.d3holderLabels.attr('class', 'label').attr('transform', function (p) {
                return 'translate(' + x(p.x) + ',0)';
            });
            self.d3holderLabelsPath.attr('class', 'label-pointer').attr('d', function (p) {
                var j = y(p.y);
                return 'M5,' + labY(p) + 'l-5,8L0,' + j;
            });

            self.d3holderLabelsTextG.attr('transform', function (p) {
                return "translate(10, " + (labY(p) - 2) + "),rotate(-48)"
            })
            self.d3holderLabelsText.attr('class', 'label').text(function (p) {
                return p.label.label;
            });
            if (self.renderCallback) {
                self.renderCallback();
            }
        }
    });
    return MatchSpectrumView;
});

/*
 * the disk with unrolled peptide coverage for PSM
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define('fishtones/views/match/MatchMapPQView',['underscore', 'Backbone', '../commons/CommonWidgetView', './MatchMapSlimView', 'fishtones/views/utils/PQView', './MatchSpectrumView'], function(_, Backbone, CommonWidgetView, MatchMapSlimView, PQView, MatchSpectrumView) {

    MatchMapPQView = CommonWidgetView.extend({
        initialize : function(options) {
            var self = this;
            MatchMapPQView.__super__.initialize.call(this, arguments)

            self.radius = options.radius|| 24;
            self.tol = options.tol|| 498;


            var spma = self.model;
            var widget = new PQView(self.el, {
                radius : self.radius,
                onclick : function() {
                    var widgetSpectrum = new MatchSpectrumView({
                        model : spma,
                        flying : true,
                        editUrl:'/fishtones/id/#interactive/'+self.model.get('expSpectrum').get('id')+'/'+self.tol+'/'+self.model.get('richSequence').toString(),
                        height:200,
                        width:480
                    });
                    // //widgetSpectrum.show();
                    widgetSpectrum.render()
                }
            });
            var sectorClasses = new Array(self.model.get('richSequence').size())
            for ( isc = 0; isc < sectorClasses.length; isc++) {
                sectorClasses[isc] = 'sector-rk-none';
            }
            _.chain(spma.closerThanPPM(self.tol)).filter(function(m) {
                return Math.abs(m.errorPPM) <= 499
            }).groupBy(function(m) {
                return m.theo.pos
            }).each(function(gp) {
                var pos = gp[0].theo.pos
                var rk = _.chain(gp).map(function(m) {
                    return m.exp.intensityRank
                }).min().value();
                sectorClasses[pos] = 'sector-rk-' + ((rk < 40) ? Math.floor(rk / 10) : 'x')
            });

            widget.build(sectorClasses, function(cnt) {
                var r = new MatchMapSlimView({
                    model : spma,
                    el : cnt,
                    tol : self.tol,
                    height : self.radius
                });
                return r.render();
            });
            self.widgetPQ = widget;
        },
        clccc : function() {
            console.log('CLAKK')
        },

        render : function() {
            var self = this;
            self.widgetPQ.draw();
        },

        move : function(i, j) {
            this.widgetPQ.move(i, j);
        }
    });

    return MatchMapPQView;
});


/**
 * display one XIC (+ plus msms matches eventually)
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define('fishtones/views/wet/XICView',['underscore', 'Backbone', 'd3', '../commons/CommonWidgetView', 'fishtones/models/match/PSMAlignment', 'fishtones/views/utils/D3ScalingContext', 'fishtones/views/utils/D3ScalingArea', '../match/MatchMapPQView'], function (_, Backbone, d3, GFYViewView, PSMAlignment, D3ScalingContext, D3ScalingArea, MatchMapPQView) {

    XICView = CommonWidgetView.extend({
        initialize: function (options) {
            var self = this;
            XICView.__super__.initialize.call(this, arguments);
            self.richSequence = options.richSequence;
            if (options.scalingContext === undefined) {
                options.xDomain = [0, _.max(self.model.get('retentionTimes')) * 1.05];
                options.yDomain = [0, _.max(self.model.get('intensities')) * 1.1];
            }
            self.setupScalingContext(options);

            self.p_set_ms1points();
            if (self.richSequence) {
                self.p_set_msmsdata();
            }
            return self;
        },
        //return the class - well, I cannot figure what this os done like that...
        p_clazzCommon: function () {
            return 'chromato msms-alignment-icon charge_' + this.model.get('charge') + ' target_' + this.model.get('target');
        },
        //package the ms1 graph point (and get dtat ready for drawing)
        p_set_ms1points: function () {
            var self = this;
            var chromato = self.model;
            chromato._dataPoints = _.zip(chromato.get('retentionTimes'), chromato.get('intensities'))

            //console.log(ms1points)
            var selector = 'g.' + self.p_clazzCommon().replace(/\s+/g, '.');
            var cont = self.el.selectAll(selector);
            // cont.remove();
            cont = self.el.append('g');
            cont.attr('class', self.p_clazzCommon() + ' plot');

            var clazz = self.p_clazzCommon() + ' plot';
            //console.log('adding ms1point', ms1points)
            self.p1 = cont.selectAll("path." + clazz).data([chromato._dataPoints]).enter().insert("path");

        },
        p_set_msmsdata: function () {
            var self = this;
            var chromato = self.model;

            self.msmsData = []

            _.each(chromato.get('msms').models, function (sp, i) {
                var spma = new PSMAlignment({
                    richSequence: self.richSequence,
                    expSpectrum: sp
                });

                var widget = new MatchMapPQView({
                    model: spma,
                    el: self.el,
                    radius: 12,
                    tol: self.tol
                });
                widget.widgetPQ.vis.attr('class', self.p_clazzCommon())

                self.msmsData.push({
                    widget: widget,
                    retentionTime: chromato.get('msmsPointers')[i].retentionTime,
                    intensity: chromato.get('msmsPointers')[i].intensity
                });
            })
            //drawing put them on the screen
            //actual drawing will move them to the correct position
            _.each(self.msmsData, function (msms) {
                msms.widget.render()
            });

        }
    });

    XICView.prototype.render = function (options) {
        var self = this;

        var chrm = self.model;

        var clazz = self.p_clazzCommon() + ' msms-annot';

        var x = self.scalingContext.x();//d3.scale.linear().domain(self.scalingContext.xScale.domain()).range(self.scalingContext.xScale.range())
        var y = self.scalingContext.y();//d3.scale.linear().domain(self.scalingContext.yScale.domain()).range(self.scalingContext.yScale.range())

        var pLine = d3.svg.line().x(function (d) {
            return x(d[0]);
        }).y(function (d) {
            return y(d[1])
        });

        var gp1 = self.p1.attr('class', clazz).attr('fill', 'none');
        gp1.attr("d", pLine(self.model._dataPoints));
        _.each(self.msmsData, function (msms) {
            msms.widget.move(x(msms.retentionTime), Math.min(y(msms.intensity), self.scalingContext.height() - 15))
        });
        // var ms2points = _.zip(chrm.msms.retentionTimes, chrm.msms.intensities, chrm.msms.spectraIds);
    }

    return XICView;
});

/**
 * multiple XIC views in one box. XIC is unique by its mass field
 * the scaling context is either passed (if multiple element are sharing the sameone) or built. ranges will be adapted each time a XIC is added
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define('fishtones/views/wet/MultiXICView',['underscore', 'Backbone', 'd3', '../commons/CommonWidgetView', './XICView'], function (_, Backbone, d3, CommonWidgetView, XICView) {

    MultiXICView = CommonWidgetView.extend({

        initialize: function (options) {
            var self = this;
            MultiXICView.__super__.initialize.call(this, arguments);
            self.options = options;
            self.setupScalingContext(options);

            self.xicViews = {};
            self.model.bind('add', function (xic) {
                self.add(xic, options)
            })
            self.build(options);

            self.listenTo(self.model, 'add', self.render);
            self.listenTo(self.model, 'reset', self.render);

        },
        build: function (options) {
            var self = this;
            if (options && options.yaxis) {
                self.elYAxis = self.el.append('g').attr('class', 'xic yaxis')
            }

            self.title = options.title;
            self.elTitle = self.el.append('text').attr('x', self.scalingContext.width() - 20).attr('y', 30).attr('class', 'xic title');
        },
        // events : {
        // 'change model' : 'add'
        // },
        add: function (xic, options) {
            var self = this;
            var m = xic.get('mass');

            var xmax = Math.max(self.scalingContext.xMax(), _.max(xic.get('retentionTimes')));
            if (!(options && options.noAutoX)) {
                self.scalingContext.setXMax(xmax, true);
            } else {
                self.scalingContext.setXMax(xmax);
            }
            var ymax = Math.max(self.scalingContext.yMax(), _.max(xic.get('intensities')) * 1.1);
            self.scalingContext.setYMax(ymax);

            var xv = new XICView({
                el: self.el.append('g'),
                model: xic,
                scalingContext: self.scalingContext,
                richSequence: xic.get('richSequence'),
                noAutoX: (options && options.noAutoX)
            });
            //            console.log(self.cid, 'XIC ', xic.get('id'), xic.cid, xv.cid)

            self.xicViews[m] = xv;

            //self.xZoomable();

        },

        updateYAxis: function () {
            var self = this;
            var yAxis = d3.svg.axis().scale(self.scalingContext.y()).ticks(4).tickSize(5);
            self.elYAxis.selectAll('g').remove();
            yAxis.orient('right');
            yAxis.tickFormat(d3.format("e"));
            self.elYAxis.call(yAxis);

        },
        render: function (options) {
            var self = this;
            self.elTitle.text(self.title);
            if (self.options.yaxis) {
                self.updateYAxis();
            }
            _.each(_.values(self.xicViews), function (xv) {
                xv.render();
            });
        }
    });

    return MultiXICView;
});

/**
 * display a D3ScalingContext, on the xaxis view
 *
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define('fishtones/views/utils/D3XAxisView',['underscore', 'Backbone', 'd3', '../commons/CommonWidgetView'],
    function (_, Backbone, d3, CommonWidgetView) {
        D3XAxisView = CommonWidgetView.extend({
            initialize: function (options) {
                var self = this;
                XICView.__super__.initialize.call(this, arguments);
                self.setupScalingContext(options);
                self.transform = options.transform;
            },

            render: function () {
                var self = this;
                var xScale;
                if (self.transform) {
                    var xDom = self.scalingContext.x().domain()
                    xScale = d3.scale.linear().domain([self.transform(xDom[0]), self.transform(xDom[1])]).range([0, self.scalingContext.width()])
                } else {
                    xScale = self.scalingContext.x();
                }
                xAxis = d3.svg.axis().scale(xScale).ticks(7).tickSubdivide(4).tickSize(6, 5, 0);
                self.el.call(xAxis);
                var elsTicks = self.el.selectAll('g g g')[0]
                _.each(elsTicks, function (elt) {
                    var pos = parseFloat(d3.select(elt).attr('transform').replace('translate(', '').replace(',0)', ''));
                    d3.select(elt).style('display', (pos < 35) ? 'none' : null)
                });
            }
        })
        return D3XAxisView
    });

/*
 * A clipped version of a XIC
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define('fishtones/models/wet/XICClip',['Backbone', 'Config', './XIC'], function(Backbone, config, XIC) {
    var XICClip = XIC.extend({
        defaults : {
        },
        initialize : function() {
        }
    });
    return XICClip;
});

/*
 * builds an XIC Clip out of a XIC + retention time range
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define('fishtones/services/wet/XICClipperFactory',['jquery', 'underscore', 'Backbone', 'Config', 'fishtones/models/wet/XICClip', 'fishtones/collections/wet/ExpMSMSSpectrumCollection'], function($, _, Backbone, config, XICClip, ExpMSMSSpectrumCollection) {
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

/**
 * multiple XIC views in one box. XIC is unique by its mass field
 * the scaling context is either passed (if multiple element are sharing the sameone) or built. ranges will be adapted each time a XIC is added
 *  a XICMultiPaneView is a set of MultiXICView.
 * We can see that as a multlines widget, each line consist of a a series of XIC.
 * scaling context is coherent throughout the different XIC
 *
 * the model of the view if a map of XICCollection
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define('fishtones/views/wet/XICMultiPaneView',['jquery', 'underscore', 'Backbone', 'd3', '../commons/CommonWidgetView', '../utils/D3XAxisView',
        './MultiXICView', 'fishtones/collections/wet/XICCollection', 'fishtones/services/wet/XICClipperFactory'],
    function ($, _, Backbone, d3, CommonWidgetView, D3XAxisView, MultiXICView, XICCollection, xicClipperFactory) {

        XICMultiPaneView = CommonWidgetView.extend({
            //map of MultiXICView
            xicPanes: {},

            /**
             *
             * @param {Object} options for constructor
             * * groupBy : a function taking a provided XIC and computing the key on which we shall groupe the XIC paerp pane
             * * getGroupName [optional]: how to name a group based on the provided XIC. We should assume that all the groupedBy XIC will provide the same name...
             *
             */

            initialize: function (options) {
                var self = this;
                options = _.extend({}, options);
                MultiXICView.__super__.initialize.call(this, options);

                self.groupBy = options.groupBy;
                self.getGroupName = options.getGroupName || self.groupBy;
                self.retentionTimeSelectCallback = options.retentionTimeSelectCallback;

                self.legendIsDisplayed = options.legend || false;
                self.noAutoX = options.noAutoX;

                self.heightXAxis = 30;
                self.xicPanes = {};
                self.groupedModels = {};

                self.listenTo(self.model, 'add', self.setup);
                self.listenTo(self.model, 'reset', self.clear);

                //console.log(self);
            },

            p_init_rt_domain_selector: function (cb) {
                var self = this;
                //set the RT range selector and pipe it to a callback

                if (cb) {
                    self.setShiftSelectCallback(function (rtDomain) {
                        var rtInf = rtDomain[0]
                        var rtSup = rtDomain[1]

                        var xicclipCol = []
                        _.each(self.model.models, function (xic) {
                            var clip = xicClipperFactory.clip(xic, rtInf, rtSup);
                            clip.unset('msmsPointers')
                            xicclipCol.push(clip)
                        });
                        cb(xicclipCol, {
                            rtDomain: {
                                inf: rtInf,
                                sup: rtSup
                            }
                        });
                    });
                }
            },

            setPaneTitle: function (name, title) {
                this.xicPanes[name].title = title
            },

            clear: function () {
                var _this = this;

                _this.xicPanes = {};
                _this.groupedModels = {};
                _this.xicPanes = {};
                _this.prevPanesGroupKeys = undefined;

                _this.setup()
            },

            setup: function () {
                var _this = this;
                _this.setupPanes();
                _this.dispatchModels();

                _this.render()
            },

            /**
             * panes are build are render time, based on the groupBy property
             * befre messing everything around, we check if new panes were actually added.
             */
            setupPanes: function () {
                var self = this;
                if (self.model.size() == 0) {
                    return;
                }

                //get one XIC representatives of a panes
                var rep4panes = _.chain(self.model.models).groupBy(self.groupBy).values().map(function (l) {
                    return l[0];
                }).sortBy(self.groupBy).value();

                //extract the key per group, and return if no change.
                var panesGroupKeys = _.map(rep4panes, self.groupBy);
                if (_.isEqual(panesGroupKeys, self.prevPanesGroupKeys)) {
                    return;
                }
                self.prevPanesGroupKeys = panesGroupKeys;

                //extract group names
                self.paneNames = rep4panes.map(self.getGroupName);
                var nbPanes = rep4panes.length;

                var heightPane = Math.floor((self.height() - self.heightXAxis) / nbPanes);

                if (self.xaxisView === undefined) {
                    self.setupScalingContext({
                        height: heightPane
                    });
                    var gxaxis = self.el.append('g').attr('class', 'time-scale xaxis').attr('transform', 'translate(0,' + (self.height() - self.heightXAxis) + ')');
                    gxaxis.append('rect').attr('width', self.scalingContext.width()).attr('height', self.heightXAxis).attr('class', 'background');
                    self.xaxisView = new D3XAxisView({
                        el: gxaxis.append('g'),
                        scalingContext: self.scalingContext,
                        transform: function (x) {
                            return x / 60
                        }
                    });
                    self.setupZoom();

                }

                //create panes if there are necessary
                rep4panes.forEach(function (repXic, i) {
                    var k = self.groupBy(repXic);
                    if (self.xicPanes[k] == undefined) {
                        var g = self.el.append('g');
                        self.groupedModels[k] = new XICCollection();

                        self.xicPanes[k] = new MultiXICView({
                            el: g,
                            scalingContext: self.scalingContext,
                            model: self.groupedModels[k],
                            name: self.getGroupName(repXic),
                            yaxis: true,
                            noAutoX: self.noAutoX,
                            title: self.getGroupName(repXic)

                        });
                    }
                    self.xicPanes[k].el.attr('transform', 'translate(0,' + (i * heightPane ) + ')');
                    //self.xicPanes[k].scalingContext = self.scalingContext;
                    //console.log(k, self.xicPanes[k].scalingContext)
                })
                self.scalingContext.height(heightPane);
                //console.log(self.cid, 'adding pane', name, self.xicPanes[name].cid)

            },

            setupZoom: function () {
                var self = this;
                self.xZoomable()

                self.getMaxYInXDomain = function (xmin, xmax) {
                    var ymax = _.chain(self.model.models).pluck('_dataPoints').map(function (dps) {
                        return _.chain(dps).filter(function (dp) {
                            return dp[0] >= xmin && dp[0] <= xmax;
                        }).pluck(1).max().value();
                    }).max().value();
                    return ymax * 1.1 //1.1 assert for the scalingY context majored from the real max
                }
                if (self.rtDomainSelector === undefined) {
                    self.p_init_rt_domain_selector(self.retentionTimeSelectCallback)
                } else {
                    self.rtDomainSelector.scalingContext = self.scalingContext;
                }

            },

            setupLegend: function () {
                var _this = this;
                _this.gLegend = _this.el.append('g').attr('class', 'chromato legend');
                _this.gLegend.append('rect').attr('class', 'background').attr('rx', 5).attr('ry', 5);
                return _this;
            },

            /**
             * the model is a collections, but those models should be dispatched towrads the individual  self.groupedModels[k]
             * And the point is not to update a collection that has not changed....
             *
             */
            dispatchModels: function () {
                var self = this;
                _.chain(self.model.models).groupBy(self.groupBy).each(function (lModels, k) {
                    lModels.forEach(function (x) {
                        self.groupedModels[k].add(x)
                    });
                    //self.groupedModels[k].reset(lModels);
                })
            },

            /**
             * add the legends into the box
             */
            renderLegend: function () {
                var _this = this;

                if (_this.gLegend === undefined) {
                    _this.setupLegend();
                }

                var hLine = 20;
                var wMoz = 130;
                var wText = 200;

                _this.gLegend.selectAll('g.legend-line').remove();
                var maxMoz = _.chain(_this.model.legends.list()).pluck('masses').map(function (l) {
                    return l.filter(function (m) {
                        return m;
                    }).length;
                }).max().value();
                maxMoz = Math.max(maxMoz, 0);

                _.each(_this.model.legends.list(), function (leg, iLeg) {
                    var gLine = _this.gLegend.append('g').attr('class', 'legend-line').attr('transform', 'translate(5,' + (hLine * (iLeg + 0.5)) + ')')

                    var imoz = 0;
                    _.each(leg.masses, function (moz, z) {
                        if (!moz) {
                            return;
                        }
                        var gMoz = gLine.append('g').attr('transform', 'translate(' + (imoz * wMoz) + ',0)').attr('class', ' legend-enlighter').attr('legendsublighted', '.chromato').attr('legendenlighted', '.chromato.charge_' + z + '.target_' + iLeg);
                        gMoz.append('path').attr('d', 'M0,0L50,0').attr('class', 'chromato target_' + iLeg + ' charge_' + z);
                        gMoz.append('text').text('' + z + '+ (' + moz.toFixed(4) + ')').attr('x', 55);

                        imoz++;
                    });
                    gLine.append('text').attr('x', maxMoz * wMoz).text(leg.name);
                });

                _this.gLegend.selectAll('g.legend-enlighter').on('mouseover', function () {
                    var enSel = $(this).attr('legendenlighted');
                    var subSel = $(this).attr('legendsublighted');

                    d3.selectAll(subSel).style('stroke-opacity', '15%');
                    d3.selectAll(enSel).style('stroke-opacity', null);
                    d3.selectAll(subSel).style('fill-opacity', '15%');
                    d3.selectAll(enSel).style('fill-opacity', null);
                }).on('mouseout', function () {
                    var subSel = $(this).attr('legendsublighted');
                    d3.selectAll(subSel).style('stroke-opacity', null);
                    d3.selectAll(subSel).style('fill-opacity', null);
                });

                var w = maxMoz * wMoz + wText;
                _this.gLegend.attr('transform', 'translate(' + (_this.width() - w - 20) + ',' + 40 + ')')
                _this.gLegend.selectAll('rect.background').attr('width', w).attr('height', _this.model.legends.size() * hLine);
                return _this;
            },

            render: function (options) {
                var self = this;
                if (self.xaxisView) {
                    self.xaxisView.render()
                }
                ;

                _.each(_.values(self.xicPanes), function (xv) {
                    //console.log('multipane rendering MUTLTI XIC', xv)
                    xv.render();
                });

                if (self.legendIsDisplayed) {
                    self.renderLegend();
                }

            }
        });

        return XICMultiPaneView;
    });

/*
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define('fishtones/views/wet/SpectrumView',['underscore', 'd3', '../commons/CommonWidgetView', 'fishtones/views/utils/D3ScalingContext', 'fishtones/views/utils/D3ScalingArea'], function (_, d3, CommonWidgetView, D3ScalingContext, D3ScalingArea) {
    /*
     * projected peaks contains 3 values:
     *
     * 0: moz
     * 1:intensity
     * 2: intensity ranks
     */
    var projectPeaks = function (expSp) {
        return _.chain(expSp.get('mozs')).zip(expSp.get('intensities'), expSp.get('intensityRanks')).value()

    }
    var peakRankClass = function (pk) {
        var irk = pk[2];
        return 'rk-' + ((irk < 40) ? Math.floor(irk / 10) : 'x');
    }
    var SpectrumView = CommonWidgetView.extend({
        defaults: {
        },
        initialize: function (options) {
            options = $.extend({}, options);
            SpectrumView.__super__.initialize.call(this, options)
            var self = this;
            self.colorPeaks = options.colorPeaks;

            self.hScale=20;
            self.build();
            self.model.on('change', function () {
                self.build().render();
            })
        },

        build: function () {
            return this.buildData().buildContext().buildD3();
        },
        buildData: function () {
            var self = this;
            self.peaks = projectPeaks(self.model);

            return self;
        },
        buildContext: function () {
            var self = this;

            var xMax = self.model.get('mozs')[self.model.size() - 1] * 1.1;
            var xMin = self.model.get('mozs')[0] * 0.5;
            var yMax = Math.max(_.max(self.model.get('intensities'))) * 1.05;

            self.setupScalingContext({
                xDomain: [xMin, xMax],
                yDomain: [0, yMax],
                height: self.height()-self.hScale,
                width: self.width()
            })

            return self;
        },
        buildD3: function () {
            var self = this;

            self.vis = self.el.append('g');
            self.vis.attr('width', self.width()).attr('height', self.height()).attr('class', 'spectrum');

            var ys = self.scalingContext.y();

            self.peaksHolder = self.vis.selectAll('line.peak').data(self.peaks).enter().append('line').attr('class', function (pk) {
                var cl = 'peak  peak-x';
                if (self.colorPeaks) {
                    cl += ' ' + peakRankClass(pk);
                }
                return cl;
            }).attr('y1', function (pk) {
                return ys(0);
            }).attr('y2', function (pk) {
                return ys(pk[1]);
            });


            var gtitles = self.vis.append('g').attr('class', 'titles')
            gtitles.append('text').text('#' + self.model.get('scanNumber')).attr('x', self.width() - 5).attr('y', 30).attr('class', 'scan top')

            self.axisContainer = self.vis.append('g').attr('class', 'axis').attr('transform', 'translate(0,'+ys(0)+')');

            return self;
        },
        render: function () {
            var self = this;
            var x = self.scalingContext.x();

            self.vis.selectAll('line.peak-x').attr('x1', function (pk) {
                return x(pk[0])
            }).attr('x2', function (pk) {
                return x(pk[0])
            });
            var xAxis = d3.svg.axis().scale(x).tickSize(4, 3, 3).ticks(3)//"".tickFormat(d3.format("d"));
            self.axisContainer.call(xAxis);
        }
    });

    return SpectrumView;

})
;
/*
 * Cleavage enzyme to cleave protein sequence
 * properties:
 * - name
 * - rule: a regular expression (sintrg or RegExp object)
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define('fishtones/models/dry/CleavageEnzyme',['underscore', 'Backbone'], function(_, Backbone) {
    var CleavageEnzyme = Backbone.Model.extend({
        idAttribute : 'name',
        defaults : {
            name : '',
            rule : null
        },
        set : function(attrs, options) {
            if (_.isString(attrs.rule)) {
                attrs.rule = new RegExp( attrs.rule, 'g');
            }
            return Backbone.Model.prototype.set.call(this, attrs, options);
        },
        initialize : function() {
        },

        toString : function() {
            var self = this;
            return self.get('name') + self.get('rule');
        },
        /**
         *
         * @param seq an input amino acid string sequence
         * @return {Array} a list of string sequences
         */
        cleave : function(seq) {
            var ret = [];
            var regexp = new RegExp(this.get('rule').source, 'g');
            while ( m = regexp.exec(seq)) {
                ret.push(m[0]);
            }
            return ret
        }
    });
    return CleavageEnzyme;
});

/*
 * enzyme with regular expression. Theses are a bit ugly, because JavaScript does support look ahead
 * This file is to be loaded by collections/dry/CleavageEnzymeDictionary
 * 
 * Copyright (c) 2013-2-14, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define('fishtones/data/cleavageEnzymes',[],function () {
    return [
        {
            name: "trypsin",
            rule: '(?:[RK]|.+?(?:[RK]|$))(?=[^P]|$)'
        },
        {
            name: "arg-c",
            rule: '(?:R|.+?(?:R|$))(?=[^P]|$)'
        },
        {
            name: "chymotrypsin",
            rule: '(?:[FLWY]|.+?(?:[FLWY]|$))(?=[^P]|$)'
        }
    ]
});


/*
 * A singleton cleavage enzyme collection, loaded from data/cleavageEnzymes.js
 * 
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define('fishtones/collections/dry/CleavageEnzymeDictionary',['fishtones/models/dry/CleavageEnzyme', 'fishtones/data/cleavageEnzymes'], function(CleavageEnzyme, bs_enzymes) {
    var CleavageEnzymeDictionary = Backbone.Collection.extend({
        model : CleavageEnzyme,
        defaults : {
        },
        initialize : function() {
            var self = this;
            self.add(bs_enzymes);
        }
    });
    return new CleavageEnzymeDictionary();
});

/*
 * An amino acid sequence, with
 * - accessioncode
 * - name
 * - sequence
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define('fishtones/models/dry/AASequence',['jquery', 'underscore', 'Backbone'], function($, _, Backbone) {
    var AASequence = Backbone.Model.extend({
        idAttribute : 'name',
        defaults : {
            name : null,
            accessionCode : null,
            sequence : null
        },
        initialize : function() {
        },
        toString : function() {
            var self = this;
            return self.get('accessioncode') + '|' + self.get('name') + ' (' + self.get('sequence').lengh + ')';
        },
        size : function() {
            var s = this.get('sequence')
            if (s == null) {
                return 0
            }
            return s.length
        }
    });
    return AASequence;
}); 

/*
 * a few default sequences, but any other can be added
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define('fishtones/data/aaSequences',[],function() {
    return [{
        name : "H3.1",
        accessionCode : "P68431",
        sequence : "MARTKQTARKSTGGKAPRKQLATKAARKSAPATGGVKKPHRYRPGTVALREIRRYQKSTELLIRKLPFQRLVREIAQDFKTDLRFQSSAVMALQEACEAYLVGLFEDTNLCAIHAKRVTIMPKDIQLARRIRGERA"
    }, {
        name : "H3.1T",
        accessionCode : "Q16695",
        sequence : "MARTKQTARKSTGGKAPRKQLATKVARKSAPATGGVKKPHRYRPGTVALREIRRYQKSTELLIRKLPFQRLMREIAQDFKTDLRFQSSAVMALQEACESYLVGLFEDTNLCVIHAKRVTIMPKDIQLARRIRGERA"
    }, {
        name : "H3.2",
        accessionCode : "Q71DI3",
        sequence : "MARTKQTARKSTGGKAPRKQLATKAARKSAPATGGVKKPHRYRPGTVALREIRRYQKSTELLIRKLPFQRLVREIAQDFKTDLRFQSSAVMALQEASEAYLVGLFEDTNLCAIHAKRVTIMPKDIQLARRIRGERA"
    }, {
        name : "H3.3",
        accessionCode : "P84243",
        sequence : "MARTKQTARKSTGGKAPRKQLATKAARKSAPSTGGVKKPHRYRPGTVALREIRRYQKSTELLIRKLPFQRLVREIAQDFKTDLRFQSAAIGALQEASEAYLVGLFEDTNLCAIHAKRVTIMPKDIQLARRIRGERA"
    }, {
        name : "H3.C",
        accessionCode : "Q6NXT2",
        sequence : "MARTKQTARKSTGGKAPRKQLATKAARKSTPSTCGVKPHRYRPGTVALREIRRYQKSTELLIRKLPFQRLVREIAQDFNTDLRFQSAAVGALQEASEAYLVGLLEDTNLCAIHAKRVTIMPKDIQLARRIRGERA"
    }, {
        name : "H4",
        accessionCode : "P62805",
        sequence : "MSGRGKGGKGLGKGGAKRHRKVLRDNIQGITKPAIRRLARRGGVKRISGLIYEETRGVLKVFLENVIRDAVTYTEHAKRKTVTAMDVVYALKRQGRTLYGFGG"
    }]
});

// >sp|P68431|H31_HUMAN Histone H3.1 OS=Homo sapiens GN=HIST1H3A PE=1 SV=2
// MARTKQTARKSTGGKAPRKQLATKAARKSAPATGGVKKPHRYRPGTVALREIRRYQKSTELLIRKLPFQRLVREIAQDFKTDLRFQSSAVMALQEACEAYLVGLFEDTNLCAIHAKRVTIMPKDIQLARRIRGERA
// >sp|Q16695|H31T_HUMAN Histone H3.1t OS=Homo sapiens GN=HIST3H3 PE=1 SV=3
// MARTKQTARKSTGGKAPRKQLATKVARKSAPATGGVKKPHRYRPGTVALREIRRYQKSTELLIRKLPFQRLMREIAQDFKTDLRFQSSAVMALQEACESYLVGLFEDTNLCVIHAKRVTIMPKDIQLARRIRGERA

// >sp|Q71DI3|H32_HUMAN Histone H3.2 OS=Homo sapiens GN=HIST2H3A PE=1 SV=3
// MARTKQTARKSTGGKAPRKQLATKAARKSAPATGGVKKPHRYRPGTVALREIRRYQKSTELLIRKLPFQRLVREIAQDFKTDLRFQSSAVMALQEASEAYLVGLFEDTNLCAIHAKRVTIMPKDIQLARRIRGERA

// >sp|P84243|H33_HUMAN Histone H3.3 OS=Homo sapiens GN=H3F3A PE=1 SV=2
// MARTKQTARKSTGGKAPRKQLATKAARKSAPSTGGVKKPHRYRPGTVALREIRRYQKSTELLIRKLPFQRLVREIAQDFKTDLRFQSAAIGALQEASEAYLVGLFEDTNLCAIHAKRVTIMPKDIQLARRIRGERA
// >sp|Q6NXT2|H3C_HUMAN Histone H3.3C OS=Homo sapiens GN=H3F3C PE=1 SV=3
// MARTKQTARKSTGGKAPRKQLATKAARKSTPSTCGVKPHRYRPGTVALREIRRYQKSTELLIRKLPFQRLVREIAQDFNTDLRFQSAAVGALQEASEAYLVGLLEDTNLCAIHAKRVTIMPKDIQLARRIRGERA
//
// >sp|P62805|H4_HUMAN Histone H4 OS=Homo sapiens GN=HIST1H4A PE=1 SV=2
// MSGRGKGGKGLGKGGAKRHRKVLRDNIQGITKPAIRRLARRGGVKRISGLIYEETRGVLKVFLENVIRDAVTYTEHAKRKTVTAMDVVYALKRQGRTLYGFGG
;
/*
 * A singleton dictionary for a few protein sequences (mainly histone tails, but add your own...)
 * it allow to get a name to a sequence, but also, if a tryptic peptide sequence is unique across the different AASequence,
 * we can refer to it like H3.3K27
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define('fishtones/collections/dry/AASequenceDictionary',['Backbone', 'fishtones/models/dry/AASequence', 'fishtones/data/aaSequences'], function(Backbone, AASequence, bs_sequences) {
    var AASequenceDictionary = Backbone.Collection.extend({
        model : AASequence,
        defaults : {
        },
        initialize : function(options) {
            var self = this;
            self.add(bs_sequences);
        }
    });
    return new AASequenceDictionary();
});

/*
 * a AASequencePeptidePtr object transforms peptide sequence into a shorter pointer to the proteins.
 * This alias should be unequivocal regarding to the list of known proteins (AASequenceDictionary)
 *
 * This class is used as a utility by RuichSequenceShortcuter
 *
 * We want to give H3K4 and this kind of shortcut, given an enzyme, and it returns a unambiguous peptide
 * And vice versa, given a peptide, it gives back the shortest possible pointer
 *
 * For example, See AASequencePeptidePtr-test.js for examples
 *
 * Properties:
 * - cleavageEnzyme: either a name refering to the dictionary or an object
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */


define('fishtones/models/dry/AASequencePeptidePtr',['underscore', 'Backbone', 'fishtones/collections/dry/CleavageEnzymeDictionary', 'fishtones/collections/dry/AASequenceDictionary'], function (_, Backbone, dicoCE, dicoSeq) {
    var AASequencePeptidePtr = Backbone.Model.extend({
        defaults: {
            cleavageEnzyme: null,
            peptideIndex: {}
        },
        initialize: function () {
        },
        set: function (attrs, options) {
            var self = this;
            var ce = null;
            if (attrs == 'cleavageEnzyme') {
                if (_.isString(options)) {
                    ce = options = dicoCE.get(options)
                } else if (options instanceof CleavageEnzyme) {
                    ce = options;
                }
            } else if (_.isString(attrs.cleavageEnzyme)) {
                ce = attrs.cleavageEnzyme = dicoCE.get(attrs.cleavageEnzyme);
            } else if (attrs.cleavageEnzyme) {
                ce = attrs.cleavageEnzyme;
            }
            if (ce != null) {
                self.p_rebuildPeptideIndex(ce);
            }
            return Backbone.Model.prototype.set.call(self, attrs, options);
        },

        /**
         * rebuild the index peptide -> sequence + positions
         * @param {CleavageEnzyme} optional params (default is the cleavageEnzyme property). We can pass it in case the enzyme pro has not bee set yet (setter overiding)
         */
        p_rebuildPeptideIndex: function (ce) {
            var self = this;
            var pindex = {};

            ce = ce || self.get('cleavageEnzyme');
            if (ce == null) {
                return;
            }
            var n = 0;
            _.each(dicoSeq.models, function (aaSeq) {
                var pos = 0;
                _.each(ce.cleave(aaSeq.get('sequence')), function (pept) {
                    var plist = pindex[pept];
                    if (!plist) {
                        pindex[pept] = [];
                        plist = pindex[pept]
                    }
                    plist.push({
                        aaSeq: aaSeq,
                        offset: pos
                    })
                    pos += pept.length;
                })
                n++
            });
            self.set('peptideIndex', pindex);
            return self;
        },

        /**
         * tansform
         * H3.[1,1T,2] -> H3.1
         * H3.1 -> H3.1
         */
        ptrTrim: function (ptr) {

            if (m = /(.+)\[(.+?),.*?](.*)/.exec(ptr)) {
                return m[1] + m[2] + m[3]
            }
            return ptr;
        },
        /**
         * from the sequence pointer, extract the list of proteins matching
         * H3K4 => all the prot stating with a name H3
         * @param {String} ptr
         */
        ptr2AASequences: function (ptr) {
            var self = this;
            var seqPtr = self.p_ptr2seqAndPeptAnchor(self.ptrTrim(ptr)).seqPtr;

            if (dicoSeq.get(seqPtr) != null) {
                return [dicoSeq.get(seqPtr)];
            }

            var l = _.filter(dicoSeq.models, function (aaseq) {
                return aaseq.get('name').indexOf(seqPtr) == 0
            });

            if (l.length == 0) {
                throw {
                    name: 'IllegalsequencePtrException',
                    message: 'cannot find matching AASequence [' + ptr + ']/[' + seqPtr + ']'
                }
                return null;
            }
            return l;
        },
        /**
         * from the sequence pointer, return one map for the peptide: {sequence: ... , offset:...}
         * It will the be passed to RichSequenceShortcuter for the actualRichSequence creation
         *
         * If the answer is ambiguous, an excpetionHandler.raise(excpetion) is raised
         *
         * @param {String} ptr
         */
        ptr2peptide: function (ptr) {
            var self = this;
            var lSequences = self.ptr2AASequences(ptr);

            var aaptr = self.p_ptr2seqAndPeptAnchor(ptr).aaPtr;
            var m = aaptr.match(/([A-Z])(\d+)/)
            var anchorAA = m[1];
            var anchorPos = parseInt(m[2]);

            var lpept = _.chain(lSequences).collect(function (aaSeq) {
                return self.p_cleavedPeptideAt(aaSeq, anchorPos);
            }).uniq().groupBy(function (p) {
                return p.sequence + '|' + p.offset
            }).values().collect(function (l) {
                return l[0]
            }).value();

            if (lpept.length > 1) {
                throw {
                    name: 'AmbiguousPtrException',
                    message: 'pointer ' + ptr + ' points to multiple peptides: ' + _.collect(lpept, function (p) {
                        return p.sequence + '@' + p.offset
                    }).join(', ') + ".\nChoose a less ambiguous protein name among: " + _.collect(lSequences, function (aaSeq) {
                        return aaSeq.get('name');
                    }).join(', ')
                };
                return null;
            }

            var ret = lpept[0];

            if (ret.sequence.charAt(anchorPos - ret.offset) != anchorAA) {
                throw {
                    name: 'InvalidPtrException',
                    message: 'pointer ' + ptr + ' does not point to aminoacid: ' + anchorAA + ' at position ' + anchorPos + ' (in fact:' + ret.sequence.charAt(anchorPos - ret.offset) + ')'
                };
                return null;

            }

            return ret

        },

        /**
         * from a list of AASequence or names, build a short concatenation on them
         */
        concatenateNames: function (lseq) {
            var self = this;
            var lNames = _.collect(lseq, function (n) {
                if (_.isString(n)) {
                    return n
                }
                return n.get('name');
            });
            lNames = lNames.sort();

            if (lNames.length <= 1) {
                return lNames[0];
            }

            var iCommon = 1;
            while (iCommon <= lNames[0].length) {
                var pref = lNames[0].substr(0, iCommon);

                if (_.any(lNames, function (n) {
                    return n.substr(0, iCommon) != pref;
                })) {

                    iCommon--;
                    break;
                }
                iCommon++
            }
            var common = lNames[0].substr(0, iCommon);

            var allNames4common = _.chain(dicoSeq.models).collect(function (aaseq) {
                return aaseq.get('name')
            }).filter(function (n) {
                return n.indexOf(common) == 0
            }).value().sort()
            if (allNames4common.length == lNames.length) {
                return self.p_shortenName(common)
            }
            return common + lNames[0].substr(iCommon);

            // return common + '[' + _.collect(lNames, function(n) {
            // return n.substr(iCommon);
            // }).join(',') + ']'
        },

        /**
         * from a sequence, return the cleaved peptide containeing position pos
         * @param {AASequence} aaSeq
         * @param {int} pos
         */
        p_cleavedPeptideAt: function (aaSeq, pos) {
            var self = this;
            if (pos >= aaSeq.size()) {
                throw {
                    name: 'IllegalPositionOnSequence',
                    message: 'position ' + pos + ' exceed size ' + aaSeq.size() + ' for seq ' + get.get('name')
                };
                return null;
            }
            var p = 0;

            var regexp = self.get('cleavageEnzyme').get('rule');
            regexp.lastIndex = 0;
            while (m = regexp.exec(aaSeq.get('sequence'))) {
                var pept = m[0]
                p += pept.length;
                if (p > pos) {
                    return {
                        sequence: pept,
                        offset: p - pept.length
                    }
                }
            }
            return null
        },
        /**
         * from H2AK27AcK36Me -> {seqPtr:'H2A', aaPtr:'K27'}
         * @param {String} ptr
         */
        p_ptr2seqAndPeptAnchor: function (ptr) {
            var re = /^\s*([A-Z]+.*?)([A-Z]\d+)/;
            var m = ptr.match(re);
            if (!m) {
                throw {
                    name: 'IllegalsequencePtrException',
                    message: ' cannot extract sequence name head  / AA pos from [' + ptr + '] with ' + re
                };
                return null;
            }
            return {
                seqPtr: m[1],
                aaPtr: m[2]
            }

        },
        // check if have them all stating with common (in this case, we can return only the common part)
        p_shortenName: function (name) {
            var allNames = _.collect(dicoSeq.models, function (aaseq) {
                return aaseq.get('name');
            })
            var curName = name;
            var i = name.length - 1;
            while (i > 0) {
                var truncated = name.substr(0, i);
                if (_.any(allNames, function (n) {

                    var okFull = n.substr(0, name.length) == name;
                    var okTrunc = n.substr(0, truncated.length) == truncated;
                    return (!okFull && okTrunc) || (okFull && !okTrunc);
                })) {
                    break;
                }
                i--;
            }
            return name.substr(0, i + 1)
        },

        toString: function () {
            var self = this;
            return self.get('cleavageEnzyme') + ' # peptides: ' + _.size(self.get('peptideIndex'));
        }
    });
    return AASequencePeptidePtr;
});

/*
 * Builds and unbuilds peptide sequence atlas composing
 * ImplicitModifier for labels
 * AASequencePeptidePtr to point a tryptic peptide to an unambiguous protein sequence an position
 * transform common modidifications into a shortcut ACD{Phospho}EF{Dimethyl}G -> ACDPoEFMe2G
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define('fishtones/services/dry/RichSequenceShortcuter',['jquery', 'underscore', 'Backbone', 'fishtones/models/dry/RichSequence', 'fishtones/models/dry/AASequencePeptidePtr', 'fishtones/collections/dry/AminoAcidDictionary', 'fishtones/collections/dry/ResidueModificationDictionary', 'fishtones/services/dry/ImplicitModifier'], function($, _, Backbone, RichSequence, AASequencePeptidePtr, dicoAA, dicoResMod, implicitModifier) {

    var RichSequenceShortcuter = Backbone.Model.extend({
        defaults : {
            modif2short : {
                // 'Label:13C(6)15N(2)':'Silack',
                // 'Label:13C(6)15N(4)':'Silacr',
                Propionyl : "Prop",
                'Propionyl:2H(5)' : 'Propd5',
                Methyl : ['Me', 'Me1'],
                Dimethyl : 'Me2',
                Trimethyl : 'Me3',
                Acetyl : 'Ac',
                Phospho : 'Po',
                GlyGly : 'Ub'
            },
            reReverse : /([A-Z])((?:[A-Z][a-z0-9]+)*)/g,
            reRevSplitModif : /(?:[A-Z][a-z0-9]+)/g

        },
        initialize : function(options) {
            var self = this;
            options = options || {cleavageEnzyme: 'arg-c'};
            self.set('aaSequencePeptidePtr', new AASequencePeptidePtr());
            self.get('aaSequencePeptidePtr').set('cleavageEnzyme', options.cleavageEnzyme);
        },
        set : function(attrs, options) {
            var self = this;
            if (attrs.modif2short) {
                self.p_init_short2modif(attrs.modif2short);
            }
            return Backbone.Model.prototype.set.call(this, attrs, options);
        },

        // this.short2modif = null;
        // this.p_init_short2modif = p_init_short2modif;
        short2modif : function(modifShorctut) {
            var rm = this.get('short2modif')[modifShorctut];
            if (!rm) {
                console.error('UnknownShortModifName', modifShorctut, this.get('short2modif'))
                throw {
                    name : 'UnknownShortModifName',
                    message : modifShorctut
                }
            }
            return rm;
        },
        /**
         * from one odif, return the short form of it.
         * The only trick is that one modif can have several short forms (Methyl -> Me and Me1)
         * and we pick the first in the list
         */
        modif2short : function(resmod) {
            var self = this;
            var short = self.get('modif2short')[resmod.get('name')];
            if (!short) {
                return resmod.get('name');
            }
            return ( short instanceof Array) ? short[0] : short;
        },

        /*
         * construct a map from short name to modif object. In case 2 shortcut point
         * to the same modif, we take the one with the shortest name
         */
        p_init_short2modif : function(newVal) {
            var self = this;
            var tmp_short2modif = {};
            var tmp_modif2short = newVal || self.get('modif2short');
            for (mod in tmp_modif2short) {
                var vals = tmp_modif2short[mod]
                var lshorts = ( vals instanceof Array) ? vals : [vals];
                _.each(lshorts, function(short) {
                    if (tmp_short2modif[short] && tmp_short2modif[short].get('name').length < mod.length) {
                        return;
                    }
                    tmp_short2modif[short] = dicoResMod.get(mod);
                })
            }
            self.set('short2modif', tmp_short2modif);
            return self;
        },

        /**
         * extract label at the end betewwen curly bracket if any
         * return an array with two element
         * [0]: peptide string without any treatment
         * [1]: an array, maybe empty with the labels in an alphanumerical order
         */
        string2peptideAndLabels : function(str) {
            var re = /(.+)\[(.*)\]\s*$/;
            var m = re.exec(str);
            if (!m) {
                return [str.trim(), []]
            }
            return [m[1].trim(), m[2].trim().split(',').sort()]

        },

        /**
         * from a minified string, build a full RichSequence pbject
         */
        richSeqFromString : function(str) {
            var self = this;

            var t = self.string2peptideAndLabels(str)
            str = t[0]
            var modifLabels = t[1];

            var rs;
            try {
                rs = new RichSequence().fromString(str)
            } catch(e) {
                var tmp_seq = []
                var tmp_reRevSplitModif = self.get('reRevSplitModif');
                var matches = new RegExpFullSpliter().split(self.get('reReverse'), str.trim())

                _.each(matches, function(m) {
                    var raa = {
                        aa : dicoAA.get(m[1])
                    };
                    var modifStr = m[2];
                    if (modifStr) {
                        raa.modifications = [];
                        _.each(modifStr.match(tmp_reRevSplitModif), function(m) {
                            raa.modifications.push(self.short2modif(m) || dicoResMod.get(m))
                        });
                    }
                    tmp_seq.push(raa);
                });

                rs = new RichSequence({
                    sequence : tmp_seq
                });
            }
            implicitModifier.label(modifLabels, rs)
            return rs;

        },

        /**
         * The inverse of richSeqFromString
         */
        richSeqToString : function(richSeq) {
            var self = this;
            var s = '';

            richSeq = richSeq.clone()
            var labels = implicitModifier.getLabelsAndClean(richSeq)

            var tmp_seq = richSeq.get('sequence');
            var tmp_modif2short = self.get('modif2short');

            for ( i = 0; i < tmp_seq.length; i++) {
                s += tmp_seq[i].aa.get('code1');
                if (tmp_seq[i].modifications) {

                    s += _.collect(tmp_seq[i].modifications, function(m) {
                        var mname = self.modif2short(m);
                        if (mname == m.get('name')) {
                            return ('{' + mname + '}')
                        } else {
                            return mname
                        }
                        //return (tmp_modif2short[m.get('name')] != undefined) ? tmp_modif2short[m.get('name')] : ('{' + m.name + '}')
                    }).join('');
                }
            }
            if (labels.length > 0) {
                s += ' [' + labels.join(',') + ']';
            }
            return s;
        },
        /**
         * 'H3.1K9Me', 'H3K4', 'H3.CK9MeAc', 'H3K9MeK14AC',  'H3.CK9MeAc [prop_d10]', return the modified full RichSeq
         *
         */
        richSeqFromSequencePtr : function(ptr) {
            var self = this;

            var t = self.string2peptideAndLabels(ptr)
            ptr = t[0]
            var modifLabels = t[1];

            var pept = self.get('aaSequencePeptidePtr').ptr2peptide(ptr);

            if (pept == null) {
                return null;
            }
            var aa = pept.sequence.split('');
            var re = /([A-Z])(\d+)((?:[A-Z][a-z][a-z0-9]*)*)/g;

            while ( m = re.exec(ptr)) {
                var i = parseInt(m[2]) - pept.offset
                aa[i] += m[3]
            }
            var seqpp = aa.join('')

            var richSeq = self.richSeqFromString(seqpp)
            implicitModifier.label(modifLabels, richSeq)
            return richSeq;

        },

        /**
         * Well, that's the reverse of richSeqFromSequencePtr.
         * from a rich sequence, we try to find the shortest possible ptr
         *
         * @param {Object} richSeq
         */
        richSeqToSequencePtr : function(richSeqOrig) {
            var self = this;

            var richSeq = richSeqOrig.clone()
            var labels = implicitModifier.getLabelsAndClean(richSeq)
            if (labels.length > 0) {
                labels = ' [' + labels.join(',') + ']';
            } else {
                labels = ''
            }

            var aaseq = _.collect(richSeq.get('sequence'), function(raa) {
                return raa.aa.get('code1');
            }).join('');

            var regSeqList = self.get('aaSequencePeptidePtr').get('peptideIndex')[aaseq];

            if (!regSeqList) {
                return self.richSeqToString(richSeq);
            }

            var seqPtr = self.get('aaSequencePeptidePtr').concatenateNames(_.collect(regSeqList, function(pp) {
                return pp.aaSeq.get('name')
            }));

            //caputre the starting position. must the same for all peptides
            var offset = _.chain(regSeqList).collect(function(pp) {
                return pp.offset
            }).uniq().value();
            if (offset.length > 1) {
                //we have different sizes
                return self.richSeqToString(richSeq);
            }
            offset = offset[0]

            var miniStr = '';
            _.each(richSeq.get('sequence'), function(raa, i) {
                var mods = _.chain(raa.modifications).collect(function(m) {
                    return self.modif2short(m);
                }).value().join('');
                if (mods !== '') {
                    miniStr += raa.aa.get('code1') + (i + offset) + mods
                }
            });
            if (miniStr === '') {
                //find at least one lysine
                var ik = _.collect(richSeq.get('sequence'), function(raa) {
                    return raa.aa.get('code1')
                }).join('').indexOf('K');
                if (ik >= 0) {
                    miniStr = 'K' + (ik + offset)
                }
            }
            if (miniStr === '') {
                return self.richSeqToString(richSeq);
            }

            //back check that the reverse is give the same
            miniStr = seqPtr + miniStr + labels;
            var backPept = self.richSeqFromSequencePtr(miniStr, true);

            if (!backPept.equalsTo(richSeqOrig)) {
                return self.richSeqToString(richSeqOrig);
            }
            return miniStr
        },
        /**
         * Will try to build the sequence from a sequencePtr or a classic sequence
         * @param {Object} str
         * @param {RichSequence} ipRichSeq, for inplace replacement instead of creating a new one...
         */
        richSeqFrom : function(str, ipRichSeq) {
            var self = this;
            if (arguments.length == 3) {
                console.error('3 parameters, no good!!')
            }
            str = str.replace(/^\w\./, '');
            str = str.replace(/\.\w$/, '');
            try {
                return new RichSequence().fromString(str);
            } catch(exc) {
                try {
                    return self.richSeqFromSequencePtr(str)
                } catch(exc) {
                    var rs = self.richSeqFromString(str)
                    return rs
                }
            }

        },
        /**
         * Will try to build the sequence from a sequencePtr or a classic sequence
         * compared to richSeqFrom, inplace replacement of ipRichSeq, instead of reating a new one...
         * @param {RichSequence} ipRichSeq,
         * @param {Object} str
         */
        richSeqReadFrom : function(ipRichSeq, str) {
            var self = this;
            var rs = self.richSeqFrom(str);

            //ok, we can do better, bu that will fly for the moment
            ipRichSeq.fromString(rs.toString());
        }
    });

    return RichSequenceShortcuter;
});

/*
 * given a partial RichSequence string, return value autocompletion values.
 * This can cover:
 * - give me a numerical value, I'll return close modification list
 * - give me a partial modification name, I'll shoot the matching modifications
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define('fishtones/services/dry/RichSequenceAutoCompletioner',['jquery', 'underscore', 'Backbone', 'fishtones/collections/dry/AminoAcidDictionary', 'fishtones/collections/dry/ResidueModificationDictionary'], function ($, _, Backbone, dicoAA, dicoResMod) {

    var RichSequenceAutoCompletioner = function () {
        var self = this;
        self.modifNames = _.chain(dicoResMod.models).collect(function (rm) {
            return rm.get('name')
        }).sort().value();

        self.modif2mass = {}
        _.each(dicoResMod.models, function (rm) {
            self.modif2mass[rm.get('name')] = rm.get('mass')
        })
    };

    /**
     * return a true value if the current there is not closeed curly bracket before the next open or the end
     * (i.e., if we call that funciton fter opening a culry, it will us if we shall add a cose one)
     * @param {Object} txt
     * @param {Object} pos
     */
    RichSequenceAutoCompletioner.prototype.closeCurly = function (txt, pos) {
        var tail = txt.substring(pos)
        if (tail.indexOf('}') < 0 || (tail.indexOf('{') > 0) && (tail.indexOf('}') > tail.indexOf('{'))) {
            return true
        }
        return false;
    };
    /**
     * given a text and a postion, extract the prefix that will be used as a anchor for autocompletion, as well as the text position to be replaced by the autocompletioner
     * Think that we can come back into  curly brackets and we still want some completion
     * return null is we are not at a position to get any replacement
     *
     * go check jasmine RichSequenceAutoCompletioner%20replaceable to get tons of examples
     * @param {Object} txt
     * @param {Object} pos
     */
    RichSequenceAutoCompletioner.prototype.replaceable = function (txt, pos) {
        var before = txt.substring(0, pos)
        var after = txt.substring(pos)

        if (before.indexOf('{') < 0) {
            //not even an open curly, don't waste my time
            return null
        }

        before = before.replace(/.*\}/, '');
        if (before.indexOf('{') < 0) {
            //we are not after an open curly bracket
            return null;
        }
        before = before.replace(/.*[\{,]/, '');

        after = after.replace(/[\},].*/, '');

        return {
            prefix: before,
            posStart: pos - before.length,
            posEnd: pos + after.length
        }

    };

    /**
     * get the list of modifcation maatching the prefix. i.e.
     * starting with the prefix
     * case is not important
     * prefix can be a mass (+/- 1 Da)
     * @param {Object} prefix
     */
    RichSequenceAutoCompletioner.prototype.getList = function (prefix) {
        var self = this;

        var mass = parseFloat(prefix)
        if (_.isFinite(mass)) {
            var mInf = mass - 1.0
            var mSup = mass + 1.0
            return _.chain(self.modif2mass).collect(function (mass, name) {
                if (mass < mInf || mass > mSup) {
                    return null
                }
                return name
            }).filter(function (n) {
                return n != null
            }).value()
        }

        prefix = prefix.toLowerCase();
        return _.filter(this.modifNames, function (n) {
            return n.toLowerCase().indexOf(prefix) == 0
        })
    }
    return RichSequenceAutoCompletioner;
});

/*
 RequireJS text 0.27.0 Copyright (c) 2010-2011, The Dojo Foundation All Rights Reserved.
 Available via the MIT or new BSD license.
 see: http://github.com/jrburke/requirejs for details
*/
(function(){var k=["Msxml2.XMLHTTP","Microsoft.XMLHTTP","Msxml2.XMLHTTP.4.0"],n=/^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im,o=/<body[^>]*>\s*([\s\S]+)\s*<\/body>/im,i=typeof location!=="undefined"&&location.href,p=i&&location.protocol&&location.protocol.replace(/\:/,""),q=i&&location.hostname,r=i&&(location.port||void 0),j=[];define('text',[],function(){var g,h,l;typeof window!=="undefined"&&window.navigator&&window.document?h=function(a,b){var c=g.createXhr();c.open("GET",a,!0);c.onreadystatechange=
function(){c.readyState===4&&b(c.responseText)};c.send(null)}:typeof process!=="undefined"&&process.versions&&process.versions.node?(l=require.nodeRequire("fs"),h=function(a,b){b(l.readFileSync(a,"utf8"))}):typeof Packages!=="undefined"&&(h=function(a,b){var c=new java.io.File(a),e=java.lang.System.getProperty("line.separator"),c=new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(c),"utf-8")),d,f,g="";try{d=new java.lang.StringBuffer;(f=c.readLine())&&f.length()&&
f.charAt(0)===65279&&(f=f.substring(1));for(d.append(f);(f=c.readLine())!==null;)d.append(e),d.append(f);g=String(d.toString())}finally{c.close()}b(g)});return g={version:"0.27.0",strip:function(a){if(a){var a=a.replace(n,""),b=a.match(o);b&&(a=b[1])}else a="";return a},jsEscape:function(a){return a.replace(/(['\\])/g,"\\$1").replace(/[\f]/g,"\\f").replace(/[\b]/g,"\\b").replace(/[\n]/g,"\\n").replace(/[\t]/g,"\\t").replace(/[\r]/g,"\\r")},createXhr:function(){var a,b,c;if(typeof XMLHttpRequest!==
"undefined")return new XMLHttpRequest;else for(b=0;b<3;b++){c=k[b];try{a=new ActiveXObject(c)}catch(e){}if(a){k=[c];break}}if(!a)throw Error("createXhr(): XMLHttpRequest not available");return a},get:h,parseName:function(a){var b=!1,c=a.indexOf("."),e=a.substring(0,c),a=a.substring(c+1,a.length),c=a.indexOf("!");c!==-1&&(b=a.substring(c+1,a.length),b=b==="strip",a=a.substring(0,c));return{moduleName:e,ext:a,strip:b}},xdRegExp:/^((\w+)\:)?\/\/([^\/\\]+)/,useXhr:function(a,b,c,e){var d=g.xdRegExp.exec(a),
f;if(!d)return!0;a=d[2];d=d[3];d=d.split(":");f=d[1];d=d[0];return(!a||a===b)&&(!d||d===c)&&(!f&&!d||f===e)},finishLoad:function(a,b,c,e,d){c=b?g.strip(c):c;d.isBuild&&d.inlineText&&(j[a]=c);e(c)},load:function(a,b,c,e){var d=g.parseName(a),f=d.moduleName+"."+d.ext,m=b.toUrl(f),h=e&&e.text&&e.text.useXhr||g.useXhr;!i||h(m,p,q,r)?g.get(m,function(b){g.finishLoad(a,d.strip,b,c,e)}):b([f],function(a){g.finishLoad(d.moduleName+"."+d.ext,d.strip,a,c,e)})},write:function(a,b,c){if(b in j){var e=g.jsEscape(j[b]);
c.asModule(a+"!"+b,"define(function () { return '"+e+"';});\n")}},writeFile:function(a,b,c,e,d){var b=g.parseName(b),f=b.moduleName+"."+b.ext,h=c.toUrl(b.moduleName+"."+b.ext)+".js";g.load(f,c,function(){var b=function(a){return e(h,a)};b.asModule=function(a,b){return e.asModule(a,h,b)};g.write(a,f,b,d)},d)}}})})();

define('text!fishtones-templates/dry/forms/richsequence-input.html',[],function () { return '<div class="input-append" style="width:100%">\n    <span class="glyphicon glyphicon-question-sign"></span>\n    <input id="{{inputId}}" type="text" class="{{inputClass}}" placeholder="{{placeholder}}"\n           value="{{value}}"/>\n\n    <button id="{{buttonId}}" class="{{buttonClass}}" type="button">{{buttonText}}</button>\n    <span id="{{validIndicatorId}}" class="badge badge-important">X</span>\n</div>';});

/**
 * Input field for  RichSequence, with autocompletion
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define('fishtones/views/dry/forms/RichSequenceInput',['jquery-plus', 'underscore', 'Backbone', 'fishtones/models/dry/RichSequence', 'fishtones/services/dry/RichSequenceShortcuter', 'fishtones/services/dry/RichSequenceAutoCompletioner', 'text!fishtones-templates/dry/forms/richsequence-input.html'],
    function ($, _, Backbone, RichSequence, RichSequenceShortcuter, RichSequenceAutoCompletioner, tmpl) {

        RichSequenceInput = Backbone.View.extend({
            initialize: function (options) {
                var self = this;

                if (!self.model) {
                    self.model = new RichSequence();
                }
                //initialization per se
                self.richSequenceShortcuter = new RichSequenceShortcuter();
                self.autoCompletioner = new RichSequenceAutoCompletioner()
                self.callbacksInvalid = [];
                self.callbacksValid = [];
                self.callbacksClear = [];

                self.action = options && options.action;

                //dom construction
                var args = $.extend({
                    placeholder: 'H3K4, H3.1K18Ac, H3.1K18AcK23Me2, KQTAR, KAcQTAR, K{Acetylation,Methylation}QTAR{Methylation}',
                    inputClass: 'form-control',
                    value: '',
                    inputId: 'rsi-input-' + self.cid,
                    buttonClass: 'btn',
                    buttonId: 'rsi-but-' + self.cid,
                    buttonText: 'action',
                    hideButton: false,
                    hideValidIndicator: true,
                    validIndicatorId: 'rsi-badge-' + self.cid
                }, options);

                var cont = $(self.el).append($(_.template(tmpl, args)));
                self.elInput = cont.find('input');
                self.elButton = cont.find('button');
                self.hideIndicator = cont.find('span.badge')


                if (args.hideButton) {
                    self.elButton.hide();
                }else{
                }
                if (args.hideValidIndicator) {
                    self.hideIndicator.hide();
                }else{
                }

                self.elIcon = cont.find('span.glyphicon');
                setTimeout(function(){
                    var totalWidth = $(self.el).width();
                    totalWidth-=self.elButton.outerWidth(true);
                    totalWidth-=self.hideIndicator.outerWidth(true);
                    totalWidth-= self.elIcon.outerWidth(true);
                    totalWidth-=20

                    self.elInput.width(''+totalWidth+'px');
                },0);

                self.elInput.val(self.model.toString())

                self.elInput.typeahead({
                    source: function (txt, process) {
                        var typeahead = this;
                        typeahead.replaceContext = null;
                        var pCaret = self.elInput[0].selectionStart
                        var insertedChar = txt.charAt(pCaret - 1)

                        //close the curly bracket if needed
                        if (insertedChar == '{' && self.autoCompletioner.closeCurly(txt, pCaret)) {
                            self.elInput.val(txt.substring(0, pCaret) + '}' + txt.substring(pCaret))
                            self.setCaretAt(pCaret)
                            return false;
                        }

                        var replace = self.autoCompletioner.replaceable(txt, pCaret)
                        if (replace == null) {
                            typeahead.hide();
                            return null
                        }
                        if (replace.prefix.length < 2) {
                            typeahead.hide();
                            return null;
                        }

                        typeahead.replaceContext = replace
                        return self.autoCompletioner.getList(replace.prefix)
                    },
                    matcher: function () {
                        return true
                    },
                    highlighter: function (txt) {
                        var typeahead = this;

                        return self.elInput.val().substring(0, typeahead.replaceContext.posStart) + '<b>' + txt + '</b>' + self.elInput.val().substring(typeahead.replaceContext.posEnd)
                    },
                    updater: function (txt) {
                        var typeahead = this;
                        self.setCaretSelection(typeahead.replaceContext.posStart, typeahead.replaceContext.posEnd)

                        var newVal = self.elInput.val().substring(0, typeahead.replaceContext.posStart) + txt + self.elInput.val().substring(typeahead.replaceContext.posEnd)
                        self.elInput.val(newVal)
                        self.update()
                        return newVal
                    }
                })

                var pop = self.elIcon.popover({
                    placement: "bottom",
                    html: true,
                    trigger: 'hover',
                    title: 'How to enter a peptide  <button type="button" class="close" data-dismiss="modal" aria-hidden="true"',

                    content: "There is more than one way to do it:<ul> <li>shortcut as <code>H3K9</code> or <code>H3.1K27</code></li><li>shortcut with modification as <code>H3K9Me2</code></li><li>as sequence with short modification <code>QKAcTARMe</code></li><li>with long version modification <code>QK{Acetyl}TAR</code></li><li>with explicit mass <code>PEP{1234.567}TIDEMe</code></li><li>in context <code>R.QKTAR.K</code></li></ul>The modification list can be found <a href=''>soon</a>"
                });

            },
            render: function () {
                var self = this;
                self.elInput.val(self.model.toString());
                self.delegateEvents({
                    'input': 'update',
                    'keypress input': 'inputKeyPressed',
                    'click button': 'callAction'
                })
                // self.on('change:input', function(){self.update()});
                // self.on('keypress:input', function(){self.inputKeyPressed()});
                // self.on('button:click', function(){self.callAction()});
                return self;
            },
            // events : {
            // 'input' : 'update',
            // 'keypress input' : 'inputKeyPressed',
            // 'click button' : 'callAction'
            // },
            update: function (evt) {
                var self = this;
                try {
                    var inStr = self.elInput.val().trim();
                    if (inStr == '') {
                        _.each(self.callbacksClear, function (f) {
                            f(self.model)
                        });
                        return;
                    }

                    self.richSequenceShortcuter.richSeqReadFrom(self.model, inStr)
                    self.isValid = true;
                    self.elButton.removeClass('btn-warning').addClass('btn-success').attr('disabled', null);
                    self.hideIndicator.removeClass('badge-important').addClass('badge-success').html('&radic;');
                    _.each(self.callbacksValid, function (f) {
                        f(self.model)
                    });
                } catch (exc) {
                    self.isValid = false;
                    self.elButton.addClass('btn-warning').removeClass('btn-success').attr('disabled', 'disabled');
                    self.hideIndicator.removeClass('badge-success').addClass('badge-important').html('X');
                    _.each(self.callbacksInvalid, function (f) {
                        f(exc)
                    });
                }

            },
            /**
             * click button if enter key is pressed
             */
            inputKeyPressed: function (evt) {
                var self = this;
                if (evt.charCode == 13) {
                    self.callAction();
                }
            },
            /**
             * add a funciton to be called whenever the field is a valid RichSequence descriptor
             * argument passed to the function will a RichSequence (the RSI model)
             * @param {function} f
             */
            addCallbackValid: function (f) {
                this.callbacksValid.push(f)
            },
            /**
             * add a funciton to be called whenever the field is a INvalid RichSequence descriptor
             * arg passed to function is the current exception
             * @param {function} f
             */
            addCallbackInvalid: function (f) {
                this.callbacksInvalid.push(f)
            },
            addCallbackClear: function (f) {
                this.callbacksClear.push(f)
            },
            callAction: function () {
                var self = this;
                if (self.action == undefined) {
                    return;
                }
                self.action(self.model)
            },
            setCaretAt: function (pos) {
                var self = this;
                var node = self.elInput[0];
                node.setSelectionRange(pos, pos);
            },
            setCaretSelection: function (pStart, pEnd) {
                var self = this;
                var node = self.elInput[0];
                node.setSelectionRange(pStart, pEnd);
            },
            /**
             * just return the text in the input field
             */
            inputSequence: function () {
                var self = this;
                return self.elInput.val().trim()
            }
        })
        return RichSequenceInput;
    });

/*
 * SVG render of theoretical fragment on a sequence
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define('fishtones/views/dry/TheoOnSequenceView',['underscore', 'Backbone', 'd3'], function(_, Backbone, d3) {

    TheoOnSequenceView = Backbone.View.extend({
        defaults : {
        },

        render : function() {
            var self = this;

            var theoSpectrum = self.model;

            var wUnit = 65;
            var hUnit = 15;

            var width = (theoSpectrum.get('richSequence').size() + 1) * wUnit;
            var height = (theoSpectrum.get('fragSeries').length + 2 ) * hUnit;

            self.viz = d3.select(self.el).append("svg").attr('class', 'd3-widget-theo-on-sequence').attr("width", width).attr("height", height);

            var series2i = {};
            var i_c = 0;
            var i_n = 0;
            _.each(theoSpectrum.get('fragSeries'), function(fs) {
                if (fs < 'm') {// nterm
                    i_n = i_n - 1;
                    series2i[fs] = i_n;
                } else {
                    i_c = i_c + 1
                    series2i[fs] = i_c;
                }
            });
            i_n -= 0.5;

            var richSeq = theoSpectrum.get('richSequence');
            self.viz.append('g').selectAll('text.aa').data(richSeq.get('sequence')).enter().append('text').attr('class', 'aa').attr('x', function(aa, i) {
                return (i + 1) * wUnit;
            }).attr('y', (-i_n + 0.5) * hUnit).text(function(raa) {
                return raa.aa.get('code1');
            });

            var size = richSeq.size();
            var modifs = [richSeq.getModificationArray(-1)].concat(_.collect(richSeq.get('sequence'), function(raa) {
                return raa.modifications
            })).concat([richSeq.getModificationArray(size)]);
            self.viz.append('g').selectAll('text.aa-modif').data(modifs).enter().append('text').attr('class', 'aa-modif').attr('x', function(mods, i) {
                if(i==0){
                    return wUnit *0.45;
                }
                if(i==size){
                    return (i-0.45)*wUnit;
                }
                return i * wUnit;
            }).attr('y', (-i_n + 0.5) * hUnit + 10).text(function(mods) {
                if (mods == undefined) {
                    return ''
                }
                return _.collect(mods, function(m) {
                    return m.get('name');
                }).join(',');

            }).style('text-anchor', function(mods, i){
                if(i==0){
                    return 'end';
                }
                if(i==size){
                    return 'start';
                }
                return 'middle'
            });

            var peak2pos = function(p) {
                var series = p.series;
                if (series < 'm') {
                    return {
                        isNterm : true,
                        x : wUnit * (p.pos + 1.5) - 7,
                        y : (series2i[series] - i_n) * hUnit
                    }
                }
                return {
                    isNterm : false,
                    x : wUnit * (p.pos + .5) + 7,
                    y : (series2i[series] - i_n + 1) * hUnit
                }
            }
            self.viz.append('g').selectAll('path.fragment').data(theoSpectrum.get('peaks')).enter().append('path').attr('class', 'fragment').attr('d', function(p) {
                var series = p.series;
                var pos = peak2pos(p)
                if (pos.isNterm) {
                    return 'M' + pos.x + ',' + pos.y + 'l7,3 l0,' + (hUnit - 5);
                } else {
                    return 'M' + pos.x + ',' + pos.y + 'l-7,-3 l0,' + (-hUnit + 5);
                }
            });
            self.viz.append('g').selectAll('text.frag-moz.peaks').data(theoSpectrum.get('peaks')).enter().append('text').attr('class', 'frag-moz peaks').attr('x', function(p) {
                var pos = peak2pos(p);
                return pos.x + (pos.isNterm ? -3 : +3);
            }).attr('y', function(p) {
                return peak2pos(p).y + 3;
            }).style('text-anchor', function(p) {
                return peak2pos(p).isNterm ? 'end' : 'start';
            }).text(function(p) {
                return p.moz.toFixed(4)
            });

            //add fragseries name on left/right column
            var dSeriesNames = _.zip(_.keys(series2i), _.values(series2i));
            self.viz.append('g').selectAll('text.frag-moz.legend').data(dSeriesNames).enter().append('text').attr('class', 'frag-moz legend').attr('x', function(p) {
                return (p[0] < 'm') ? 5 : (width - 5);
            }).attr('y', function(p) {
                var pk = {
                    series : p[0],
                    pos : 0
                }
                return peak2pos(pk).y + 3;
            }).style('text-anchor', function(p) {
                return (p[0] > 'm') ? 'end' : 'start';
            }).text(function(p) {
                return p[0];
            });

        }
    });

    return TheoOnSequenceView;
});

/**
 * Extends PeakListPairAlignment for a pair of two ExpSpectrum
 * Properties are
 * - spectrumA
 * - spectrumB
 *
 * alignment is recomputed if any of them trigge a 'change' event
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define('fishtones/models/match/SpectraPairAlignment',['underscore', './PeakListPairAlignment'], function(_, PeakListPairAlignment) {

    /**
     * build the alignment with options {richSequence:..., expSpectrum:...}
     */
    var PSMAlignment = PeakListPairAlignment.extend({
        initialize : function(options) {
            var self = this;
            PSMAlignment.__super__.initialize.call(this, {});
            self.build()

            self.get('spectrumA').on("change", function() {
                self.build()
            })
            self.get('spectrumB').on("change", function() {
                self.build()
            })
        },
        /**
         * @private
         */
        build : function() {
            var self = this;

            self.set('pklA', self.get('spectrumA'))
            self.set('pklB', self.get('spectrumB'))

            var matchIndices = self.matchIndices();

            var xpeaksA = self.get('spectrumA').get('mozs');
            var xIntensitiesA = self.get('spectrumA').get('intensityRanks');
            var xpeaksB = self.get('spectrumB').get('mozs');
            var xIntensitiesB = self.get('spectrumB').get('intensityRanks');

            var matches = _.map(matchIndices, function(mi) {
                return {
                    pkB : {
                        index : mi.iB,
                        moz : xpeaksB[mi.iB],
                        intensityRank : xIntensitiesB[mi.iB],
                    },
                    pkA : {
                        index : mi.iA,
                        moz : xpeaksA[mi.iA],
                        intensityRank : xIntensitiesA[mi.iA],
                    },
                    errorPPM : mi.errorPPM
                }
            })
            self.set('matches', matches);

        },

        /**
         * @return difference between the experimental and the theoretical precursors (MH)
         */
        deltaPrecMozs : function() {
            var self = this;
            var z = self.get('expSpectrum').get('precCharge');
            var theo = massBuilder.computeMassRichSequence(self.get('richSequence'), z)
            return (self.get('expSpectrum').get('precMoz') - theo) * z
        },
        /**
         *
         * @return {{}} ready for JSON
         */
        serialize : function() {
            var self = this;
            var ret = {};
            ret.expSpectrum = self.get('expSpectrum').toJSON()

            var rseq = self.get('richSequence').toString();
            ret.richSequence = rseq

            ret.id = self.computeId();
            ret.aaSequence = self.get('richSequence').toAAString();

            return ret;
        },
        computeId : function() {
            var self = this;
            return self.get('expSpectrum').get('id') + '|' + self.get('richSequence').toString()

        },
        /**
         * return the number of unmacthed experimental peak, with a mass greater than the precursor,
         * intensity < inFirst and with tol error
         * @param {Object} tol
         * @param {Object} inFirst
         */
        unmatchedFactor : function(tol, inFirst) {
            var self = this;
            var matches = self.closerThanPPM(tol);

            var pks = _.filter(_.zip(self.get('expSpectrum').get('mozs'), self.get('expSpectrum').get('intensityRanks')), function(p) {
                return p[1] < inFirst
            });

            var mPrec = self.get('expSpectrum').get('precMoz')
            return _.filter(pks, function(p) {
                return p[0] > mPrec;
            }).length - _.filter(matches, function(m) {
                return (m.exp.intensityRank < inFirst) && (m.exp.moz > mPrec);
            }).length

        }
    });

    return PSMAlignment;
});

/*
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define('fishtones/views/match/SpectraPairAlignmentView',['underscore', 'd3', '../commons/CommonWidgetView', 'fishtones/views/utils/D3ScalingContext', 'fishtones/views/utils/D3ScalingArea'], function(_, d3, CommonWidgetView, D3ScalingContext, D3ScalingArea) {
  /*
   * projected peaks contains 4 values:
   *
   * 0: moz
   * 1:intensity
   * 2: intensity ranks
   * 3: isMathcing ( constructed at the buildData step)
   */
  var projectSpectrum = function(expSp) {
    return {
      precursor : {
        scanNumber : expSp.get('scanNumber'),
        id : expSp.get('id')
      },
      peaks : _.chain(expSp.get('mozs')).zip(expSp.get('intensities'), expSp.get('intensityRanks')).value()
    }
  }
  var peakRankClass = function(pk) {
    var irk = pk[2];
    return 'rk-' + ((irk < 40) ? Math.floor(irk / 10) : 'x');
  }
  var SpectraPairAlignmentView = CommonWidgetView.extend({
    defaults : {
    },
    initialize : function(options) {
      options = $.extend({}, options);
      SpectraPairAlignmentView.__super__.initialize.call(this, options)
      var self = this;
      self.isEnhanced = options.enhanced;
      self.maxRankMatchingPeaks = options.maxPeaks || 1000;
      self.independentYScales = options.independentYScales;
      self.colorPeaks = options.colorPeaks;

      self.fragTol = options.fragTol || 20;
      self.heightMiddleZone = (self.isEnhanced) ? (self.height() * 0.1) : 0

      self.build();
      self.model.on('change', function() {
        self.build().render();
      })
    },

    build : function() {
      return this.buildData().buildContext().buildD3();
    },
    buildData : function() {
      var self = this;
      self.spA = projectSpectrum(self.model.get('spectrumA'));
      self.spB = projectSpectrum(self.model.get('spectrumB'));

      if (self.isEnhanced) {
        _.each(self.model.closerThanPPM(self.fragTol), function(p) {
          self.spA.peaks[p.pkA.index][3] = true;
          self.spB.peaks[p.pkB.index][3] = true;
        })
      }

      self.allPeaks = self.spA.peaks.map(function(p) {
        p[4] = 0
        return p;
      }).concat(self.spB.peaks.map(function(p) {
        p[4] = 1
        return p;
      }))

      return self;
    },
    buildContext : function() {
      var self = this;

      var xMax = Math.max(self.spA.peaks[self.spA.peaks.length-1][0], self.spB.peaks[self.spB.peaks.length-1][0]) * 1.1;
      var xMin = Math.max(self.spA.peaks[0][0], self.spB.peaks[0][0]) * 0.5;
      var yMax = Math.max(_.max(self.model.get('spectrumA').get('intensities')), _.max(self.model.get('spectrumB').get('intensities'))) * 1.05;

      self.setupScalingContext({
        xDomain : [xMin, xMax],
        yDomain : [0, yMax],
        height : (self.height() - self.heightMiddleZone) / 2,
        width : self.width()
      })

      return self;
    },
    buildD3 : function() {
      var self = this;

      self.vis = self.el.append('svg');
      self.vis.attr('width', self.width()).attr('height', self.height()).attr('class', 'spectra-pair-alignment');
      self.vis.append('line').attr('y1', self.height() / 2).attr('y2', self.height() / 2).attr('x1', 0).attr('x2', self.width()).attr('class', 'axis')

      var ys = [self.scalingContext.y(), self.scalingContext.y()]

      ys[1].range([(self.height() + self.heightMiddleZone) / 2, self.height()]);
      if (self.independentYScales) {
        ys[0].domain([0, _.max(self.model.get('spectrumA').get('intensities')) * 1.05])
        ys[1].domain([0, _.max(self.model.get('spectrumB').get('intensities')) * 1.05])
      }

      var j0up = (self.height() - self.heightMiddleZone) / 2;
      var j0down = (self.height() + self.heightMiddleZone) / 2;

      self.peaksHolder = self.vis.selectAll('line.peak').data(self.allPeaks).enter().append('line').attr('class', function(pk) {
        var cl = 'peak  peak-x';
        if (self.colorPeaks) {
          cl += ' ' + peakRankClass(pk);
        }
        if (self.isEnhanced) {
          cl += pk[3] ? " matched" : " unmatched";
        }
        return cl;
      }).attr('y1', function(pk) {
        return ys[pk[4]](0);
        //(pk[1] > 0) ? j0up : j0down;
      }).attr('y2', function(pk) {
        return ys[pk[4]](pk[1])//(pk[1] > 0) ? (j0up - y(pk[1])) : (j0down + y(-pk[1]));
      });

      if (self.isEnhanced) {
        self.vis.selectAll('line.peak-match').data(_.filter(self.spA.peaks.concat(self.spB.peaks), function(pk) {
          return pk[3] && (pk[2] < self.maxRankMatchingPeaks );
        })).enter().append('line').attr('class', function(pk) {
          var cl = 'peak peak-match peak-x';
          cl += ' ' + peakRankClass(pk);
          return cl
        }).attr('y1', self.height() / 2).attr('y2', function(pk) {
          return (pk[4] == 0) ? j0up : j0down;
        })
      }

      var gtitles = self.vis.append('g').attr('class', 'titles')
      gtitles.append('text').text('#' + self.spA.precursor.scanNumber).attr('x', self.width() - 5).attr('y', 30).attr('class', 'scan top')
      gtitles.append('text').text('#' + self.spB.precursor.scanNumber).attr('x', self.width() - 5).attr('y', self.height() - 30).attr('class', 'scan bottom')

      self.axisContainer = self.vis.append('g').attr('class', 'axis');

      return self;
    },
    render : function() {
      var self = this;
      var x = self.scalingContext.x();

      self.vis.selectAll('line.peak-x').attr('x1', function(pk) {
        return x(pk[0])
      }).attr('x2', function(pk) {
        return x(pk[0])
      });
      var xAxis = d3.svg.axis().scale(x).tickSize(6, 0, 0).ticks(3)//"".tickFormat(d3.format("d"));
      self.axisContainer.call(xAxis);
    }
  });

  return SpectraPairAlignmentView;

})
;
/**
 * this is a grid for displaying a spectrum/peptide match. The classic stuff, as
 * a html table, adding color and so...
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define('fishtones/views/match/MatchGridValuesView',['underscore', 'Backbone', '../commons/CommonWidgetView'], function (_, Backbone, CommonWidgetView) {

    MatchGridValuesView = CommonWidgetView.extend({
        initialize: function (options) {
            var self = this;
            MatchGridValuesView.__super__.initialize.call(this, arguments)

            options = $.extend({}, options);
            self.height = options.height || 400;
            self.width = options.width || 300;
            self.tol = options.tol || 500;

            self.el.classed('d3-widget-match-grid-values', true)
        },
        render: function () {

            var self = this;

            var theoSpectrum = self.model.get('theoSpectrum');
            var nbSeries = theoSpectrum.get('fragSeries').length

            self.el.append('rect').attr('class', 'background').attr('width', self.width).attr('height', self.height)
            // get frag series -> ordinate
            var series2i = {};
            var i_c = 0;
            var i_n = 0;
            _.each(theoSpectrum.get('fragSeries'), function (fs) {
                if (fs < 'm') {// nterm
                    i_n = i_n - 3;
                    series2i[fs] = i_n + 2;
                } else {
                    i_c = i_c + 3
                    series2i[fs] = i_c + 2;
                }
            });

            // we have to scale [0:(width - 2*10)] x [0-height] to [i_n:i_c+1] x
            // [-1: theoSpectrum.richSequence.size()]
            var richSeq = theoSpectrum.get('richSequence');
            var size = richSeq.size();

            var scale = Math.min(((self.width) / (i_c + 1 - i_n + 3)), (self.height / (size + 1)));
            var transf = 'scale(' + scale + ',' + scale + '),translate(' + (-i_n + 1) + ',1.7)';

            var gCont = self.el.append('g').attr('transform', transf);

            var fs2i = function (fs) {
                return series2i[fs];
            }
            // data matches
            var dmatches = self.model.closerThanPPM(self.tol);

            gCont.selectAll('text.aa').data(richSeq.get('sequence')).enter().append('text').attr('class', 'aa').attr('x', 1).attr('y', function (d, i) {
                return i + 0.5
            }).text(function (d) {
                return d.aa.get('code1')
            });

            var modifs = [richSeq.getModificationArray(-1)].concat(_.collect(richSeq.get('sequence'), function (raa) {
                return raa.modifications
            })).concat([richSeq.getModificationArray(size)]);
            gCont.selectAll('text.aa-modif').data(modifs).enter().append('text').attr('class', 'aa-modif').attr('x', 1).attr('y', function (d, i) {
                if (i == size) {
                    return i + 0.32 - 0.5 + 0.5
                }
                return i + 0.32 - 1 + 0.5;
            }).text(function (mods) {
                if (mods == undefined) {
                    return ''
                }
                return _.collect(mods, function (m) {
                    return m.get('name');
                }).join(',');

            });

            gCont.selectAll('text.series').data(theoSpectrum.get('fragSeries')).enter().append('text').attr('class', 'series').attr('x', function (d) {
                return series2i[d];
            }).attr('y', -1).text(function (d) {
                return d;
            });

            var poslab = [];
            for (i = 1; i <= size; i++) {
                poslab.push(i)
            }
            gCont.selectAll('text.poslabel.nterm').data(poslab).enter().append('text').attr('class', 'poslabel nterm').attr('x', i_n - 0.9).attr('y', function (d, i) {
                return i + 1
            }).text(function (d) {
                return d
            });
            gCont.selectAll('text.poslabel.cterm').data(poslab).enter().append('text').attr('class', 'poslabel cterm').attr('x', i_c + 2.9).attr('y', function (d, i) {
                return size - i - 1
            }).text(function (d) {
                return d
            });

            gCont.selectAll('text.theofrag').data(theoSpectrum.get('peaks')).enter().append('text').attr('class', 'theofrag').attr('x', function (p) {
                return series2i[p.series]
            }).attr('y', function (p) {
                return (p.series < 'g') ? (p.pos + 1) : p.pos
            }).text(function (p) {
                return p.moz.toFixed(2);
            });

            gCont.selectAll('rect.matching').data(dmatches).enter().append('rect').attr('class', function (d) {
                var irk = d.exp.intensityRank;
                return "matching rk-" + ((irk < 40) ? Math.floor(irk / 10) : 'x')
            }).attr('x', function (d) {
                return series2i[d.theo.series] - 2.8
            }).attr('y', function (d) {
                return (d.theo.series < 'g') ? (d.theo.pos - 0.7 + 1) : (d.theo.pos - 0.7);
            }).attr('width', 3).attr('height', 1);
        }
    });

    return MatchGridValuesView;
});

/*
 * a compact iconic view of Spectrum/Spectrum alignment
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define('fishtones/views/match/SpectraPairAlignmentIcon',['underscore', 'd3', '../commons/CommonWidgetView', 'fishtones/utils/DeltaMass', 'fishtones/views/utils/D3ScalingContext', 'fishtones/views/utils/D3ScalingArea'], function (_, d3, CommonWidgetView, DeltaMass, D3ScalingContext, D3ScalingArea) {

    var projectSpectrum = function (expSp, sample) {
        return {
            precursor: {
                scanNumber: expSp.get('scanNumber'),
                id: expSp.get('id')
            },
            peaks: _.chain(expSp.get('mozs')).zip(expSp.get('intensities'), expSp.get('intensityRanks')).map(function (p, i) {
                return {
                    moz: p[0],
                    intensityRank: p[2],
                    origIndex: i,
                    sample: sample
                };
            }).value()
        }
    }
    var SpectraPairAlignmentIcon = CommonWidgetView.extend({
        defaults: {
        },
        initialize: function (options) {
            options = $.extend({}, options);
            SpectraPairAlignmentIcon.__super__.initialize.call(this, options)
            var self = this;

            self.maxPeaks = options.maxPeaks || 50;
            self.fragTol = options.fragTol || 20;

            self.build();
            self.model.on('change', function () {
                self.build().render();
            })
        },
        build: function () {
            return this.buildData().buildContext().buildD3();
        },
        buildData: function () {
            var self = this;
            self.spA = projectSpectrum(self.model.get('spectrumA'), 0);
            self.spB = projectSpectrum(self.model.get('spectrumB'), 1);

            //label the peaks
            var pkBins = [
                [],
                []
            ]

            //one projected peaks contains [moz, intensity, intensityRank, isMatching, sampleName, overallNumber]

            self.sortedMatchedPeaks = _.chain(self.spA.peaks.concat(self.spB.peaks)).filter(function (p) {
                return p.intensityRank < self.maxPeaks;
            }).sortBy(function (p) {
                return p.moz;
            }).map(function (p, i) {
                p.binIndex = i;
                p.matched = false;
                pkBins[p.sample][p.origIndex] = i;
                return p;
            }).value();

            var matches = self.model.closerThanPPM(self.fragTol);
            _.each(matches, function (m) {
                if ((m.pkB.intensityRank >= self.maxPeaks) || (m.pkA.intensityRank >= self.maxPeaks))
                    return;
                self.sortedMatchedPeaks.push({
                    sample: 1,
                    binIndex: pkBins[0][m.pkA.index],
                    intensityRank: m.pkB.intensityRank,
                    matched: true
                });
                self.sortedMatchedPeaks.push({
                    sample: 0,
                    binIndex: pkBins[1][m.pkB.index],
                    intensityRank: m.pkA.intensityRank,
                    matched: true
                })

                self.sortedMatchedPeaks[pkBins[1][m.pkB.index]].matched = true
                self.sortedMatchedPeaks[pkBins[0][m.pkA.index]].matched = true


            })

            return self;
        },
        buildContext: function () {
            var self = this;

            self.scalingContext = new D3ScalingContext({
                xDomain: [0, 2 * self.maxPeaks],
                yDomain: [2, 0],
                height: self.height(),
                width: self.width()
            })

            return self;
        },
        buildD3: function () {
            var self = this;
            self.vis = self.el.append('svg');
            self.vis.attr('width', self.width()).attr('height', self.height()).attr('class', 'spectra-pair-icon');
            self.vis.append('rect').attr('class', 'background').attr('height', '100%').attr('width', '100%');

            self.peaksHolder = self.vis.selectAll('rect.peak-bin').data(self.sortedMatchedPeaks).enter().append('rect').attr('class', 'peak-bin');
            return self;
        },
        render: function () {
            var self = this;
            var x = self.scalingContext.x();
            var y = self.scalingContext.y();

            self.peaksHolder.attr('x', function (pk) {
                // if(pk[4]=='B' && p[3]){
                // return x(pk[5]-1)
                // }
                return x(pk.binIndex)
            }).attr('width', function (pk) {
                return x(1)
            }).attr('height', y(1)).attr('y', function (pk) {
                return y(pk.sample)
            }).attr('class', function (pk) {
                var irk = pk.intensityRank;
                var cl = 'spectra-pair-icon-bin rk-' + ((irk < 40) ? Math.floor(irk / 10) : 'x');
                if (pk.matched)
                    cl += " matched"
                else
                    cl += " unmatched"
                return cl;
            });
        }
    });

    return SpectraPairAlignmentIcon;

});
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

    define('MSMSJSExport',[
        'jquery',
        'Config', 'fishtones/models/wet/ExpMSMSSpectrum', 'fishtones/collections/wet/ExpMSMSSpectrumCollection', 'fishtones/models/wet/MSMSRun', 'fishtones/models/wet/Injection', 'fishtones/models/wet/Experiment', 'fishtones/collections/wet/XICCollection', 'fishtones/views/wet/XICView', 'fishtones/views/wet/MultiXICView', 'fishtones/views/wet/XICMultiPaneView', 'fishtones/views/wet/SpectrumView',
        'fishtones/models/dry/RichSequence', 'fishtones/services/dry/ImplicitModifier', 'fishtones/services/dry/MassBuilder', 'fishtones/services/dry/RichSequenceShortcuter', 'fishtones/collections/dry/ResidueModificationDictionary', 'fishtones/collections/dry/AminoAcidDictionary', 'fishtones/views/dry/forms/RichSequenceInput', 'fishtones/views/dry/TheoOnSequenceView',
        'fishtones/models/match/SpectraPairAlignment', 'fishtones/views/match/SpectraPairAlignmentView', 'fishtones/models/match/PSMAlignment', 'fishtones/views/match/MatchSpectrumView', 'fishtones/views/match/MatchGridValuesView', 'fishtones/views/match/MatchMapPQView', 'fishtones/views/match/MatchMapSlimView', 'fishtones/views/match/SpectraPairAlignmentIcon',
        'fishtones/views/utils/D3ScalingContext', 'fishtones/utils/DeltaMass',
    ], buildExport);

})();
  //ok, that's jsut to fit togehter

  //sorry for that, but I don't know how to make aliases
  define('Backbone', ['backbone'], function(bb){
    return bb;
  });
  
  define('fishtones', ['MSMSJSExport'], function(fte){
    return fte;
  });
}());
