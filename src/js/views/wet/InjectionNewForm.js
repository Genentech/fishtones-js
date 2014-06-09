/**
 * New injection is done in 5 steps
 * a) create a new injection with name, tolerances
 * b) submit the multipart form upload the run mzxml
 * c) change the new form into an update one
 * d) go to list and see the completion there
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define(['jquery', 'Backbone', 'Config', 'fishtones/models/wet/Injection', 'fishtones/services/wet/InjectionService', './InjectionUpdateForm', './InjectionRunUploadStatusView', 'text!fishtones-templates/wet/injection-new-form.html'], function ($, Backbone, config, Injection, injectionService, InjectionUpdateForm, InjectionRunUploadStatusView, tmpl) {
    InjectionNewForm = Backbone.View.extend({
        initialize: function () {
            var self = this;
            self.build();
        },
        events: {
            "click button": function (evt) {
                this.launchCreation()
            },

            "keyup input": 'inputChanged',
            "change input[type=file]": function (evt) {
                var self = this;

                if (self.components.pName.val().trim() == '') {
                    //set a default name based on the file's
                    var fname = $(evt.currentTarget).val();
                    fname = fname.replace(/.*[/\\]/, '')
                    fname = fname.replace(/\.mzxml$/i, '')
                    self.components.pName.val(fname)
                }
                self.inputChanged();
            }

        },
        build: function () {
            var self = this;
            $(self.el).empty();
            var jqEl = $(_.template(tmpl, {}));
            $(self.el).hide();
            $(self.el).append(jqEl);

            self.components = {
                butSubmit: jqEl.find('button'),
                formUpload: jqEl.find('#form-upload-run'),
                pName: jqEl.find('#inputInjName'),
                pPrecursorTol: jqEl.find('#inputPrecursorTol'),
                pFragmentTol: jqEl.find('#inputFragmentTol'),
            }
            self.components.formUpload.target = $('#iframe_dev_null')[0]
            var elIframe = $('<iframe class="iframe_dev_null" style="display:none; height:0px; width:0px"></iframe>');
            $('body').append(elIframe)
            self.components.formUpload.target = elIframe
        },
        render: function () {
            var self = this;
            $(self.el).show();
        },
        //apply the four steps
        launchCreation: function () {
            var self = this;
            var urlInj = new Injection().urlRoot();
            //a) create a new injection with name, tolerances
            $.ajax({
                type: 'POST',
                url: urlInj,
                data: {
                    name: self.components.pName.val(),
                    precursorTol: self.components.pPrecursorTol.val(),
                    fragmentTol: self.components.pFragmentTol.val()
                },
                success: function (inj) {
                    //b) submit the multipart form upload the run mzxml
                    var url = urlInj + '/' + inj.id + '/run';
                    self.components.formUpload.attr('action', url)
                    var fReq = self.components.formUpload.submit();

                    //c)change new form into update one
                    $(self.el).children().hide()

                    //d) loop on progress bar
                    location.hash = 'injection/list'

                }
            })
        },
        inputChanged: function () {
            var self = this;
            if ($(self.el).find('input[name=mzxml]').val() != "" && $(self.el).find('input[name=name]').val().trim() != "") {
                self.components.butSubmit.removeClass('btn-info').addClass('btn-success').attr('disabled', null)
            } else {
                self.components.butSubmit.addClass('btn-info').removeClass('btn-success').attr('disabled', 'disabled')
            }
        }
    });
    return InjectionNewForm;
});

