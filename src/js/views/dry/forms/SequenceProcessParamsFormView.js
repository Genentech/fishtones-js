/*
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define(['jquery', 'Underscore', 'Backbone', 'text!templates/dry/forms/SequenceProcessParamsFormTemplate.html', 'models/dry/SequenceProcessParams', 'collections/dry/CleavageEnzymeDictionary'], function($, _, Backbone, sppFormTmpl, spp, CleavageEnzymeDictionary) {
    var SequenceProcessParamsFormView = Backbone.View.extend({
        model : spp,
        events : {
            "change .param" : 'updateModel',
        },
        initialize : function() {
            var self = this;
            _.bindAll(this, 'render');
            _.bindAll(this, 'updateModel');
            
            CleavageEnzymeDictionary.bind('reset', self.render);
            self.model.bind('change', self.render);
            self.bind('change', self.updateModel);
        },
        //OK, with this stupid rendering, we keep loosing dinb event. but frankly, I'm not sure this is a big deal here...
        render : function(options) {
            var self = this;
            var rform = $(_.template(sppFormTmpl, {
                selected : self.model,
                enzymes : CleavageEnzymeDictionary.models
            }));
            $(this.el).html(rform);
        },
        updateModel : function(evt) {
            var self = this;
            var el = $(evt.target);
            var name = el.attr('name');
            var val = el.val()
            if (el.attr('type') == 'integer') {
                val = parseInt(val);
            }
            self.model.set(name, val);
        }
    });
    return SequenceProcessParamsFormView;
});

