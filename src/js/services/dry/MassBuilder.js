/*
 * Builds theoretical masses based on a RichSeuence. It can be intact mass (with charges) or fragmentation spectra.
 * Visit MassBuilder-test.js for plenty of examples.
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define(['jquery', 'underscore', 'Backbone', 'fishtones/models/dry/RichSequence', 'fishtones/models/dry/TheoSpectrum', 'fishtones/collections/dry/AminoAcidDictionary', 'fishtones/collections/dry/ResidueModificationDictionary'], function($, _, Backbone, RichSequence, TheoSpectrum, dicoAA, dicoResMod) {
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
