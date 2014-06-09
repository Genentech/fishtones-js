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

define(['Backbone', 'Config'], function(Backbone, config) {
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
