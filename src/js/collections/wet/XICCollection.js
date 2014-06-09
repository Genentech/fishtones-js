/*
 * just a collection of XIC, with an attached collection legend container
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define(['Backbone', 'fishtones/models/wet/XIC'], function(Backbone, XIC) {
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
