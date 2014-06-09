/*
 * provide an input field to select proteins (AASequence) based on the aaSequenceDictionary
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define([
        'jquery',
        'Underscore',
        'Backbone',
        'text!templates/dry/forms/SequenceSelectorTemplate.html',
        'text!templates/dry/forms/SequenceUploadFormTemplate.html',
        'models/dry/AASequence',
        'collections/dry/AASequenceDictionary'
    ],
    function ($, _, Backbone, SequenceSelectorTemplate, SequenceUploadFormTemplate, AASequence, AASequenceDictionary) {
        var AASequenceSelectorView = Backbone.View.extend({
            model: AASequence,
            events: {
                "change .param": 'updateSequence',
                "change #peffFile": 'uploadPeff'
            },
            initialize: function () {
                var self = this;
                _.bindAll(this, 'render');
                _.bindAll(this, 'updateSequence');
                _.bindAll(this, 'uploadPeff');

                AASequenceDictionary.bind('reset', self.render);
                self.model.bind('change', self.render);
                self.bind('change', self.updateModel);
            },
            //OK, with this stupid rendering, we keep loosing dinb event. but frankly, I'm not sure this is a big deal here...
            render: function (options) {
                var self = this;
                console.log('pipo');
                console.log('SequenceSelectorTemplate', SequenceSelectorTemplate);
                console.log(AASequenceDictionary);
                var rform = $(_.template(SequenceSelectorTemplate, {
                    selected: self.model,
                    list: AASequenceDictionary.models
                }));
                console.log('rfoprm', rform);
                $(this.el).empty();
                $(this.el).append(rform);
                var uploadForm = $(_.template(SequenceUploadFormTemplate, {}));
                //);
                console.log(uploadForm);
                $(this.el).append(uploadForm);

            },
            updateSequence: function (evt) {
                var self = this;
                var el = $(evt.target);
                var id = el.attr('id');
                self.model.set(name, AASequenceDictionary.get(id));
            },
            uploadPeff: function (evt) {
                var self = this;
                var file = evt.currentTarget.files[0];

                var reader = new FileReader();

                // Closure to capture the file information.
                reader.onload = (function (f) {
                    return function (e) {
                        $.post(BACKEND_URL + '/sequence/loadPeff', {peff: e.target.result}, function (data) {
                            AASequenceDictionary.fetch();
                        });
                    }
                })(file);
                reader.readAsBinaryString(file);
            }
        });
        return AASequenceSelectorView;

    });

