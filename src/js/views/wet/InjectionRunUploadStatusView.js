/**
 * a widget that display the status of an injection run being uploaded.
 * The widget shall refressh it seltf on a given intrval (defaut 1000ms)
 * stop when completed or error
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define(['jquery', 'Backbone', 'text!fishtones-templates/wet/injection-run-upload-status.html'], function ($, Backbone, tmpl) {
    InjectionRunUploadStatusView = Backbone.View.extend({
        initialize: function () {
            var self = this;
            self.model.on("change", self.render, self);

            self.timeInterval = 3000;

            $(self.el).empty();
            $(self.el).append($(tmpl));
            self.elProgressBar = $(self.el).find('.bar')
            self.elMessage = $(self.el).find('span.message')

            self.status = {
                status: 'n/a',
                progress: '0',
                message: 'init'
            }
        },
        render: function () {
            var self = this;
            if (self.status.status == 'ERROR') {
                $(self.el).empty().append('<div class="alert alert-error" style="width:100%">' + self.status.message + '<div>')
                return;
            }
            self.elProgressBar.css('width', (Math.round(100 * self.status.progress)) + '%');
            self.elMessage.html(self.status.message)

        },
        update: function () {
            var self = this;
            var url = self.model.urlRoot() + '/' + self.model.get('id') + '/runuploadstatus'

            $.getJSON(url, {}, function (data) {

                self.status.progress = data.progress
                self.status.message = data.message
                self.status.status = data.status

                self.render()

                if (data.status == 'ERROR' || data.status == 'COMPLETED') {
                    return;
                }

                setTimeout(function () {
                    self.update()
                }, self.timeInterval);

            })
        }
    });
    return InjectionRunUploadStatusView;
});

