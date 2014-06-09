/**
 * singleton exception view
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define(['jquery', 'underscore', 'Backbone', 'bootstrap', 'exceptionHandler', 'text!fishtones-templates/utils/exception.html'], function ($, _, Backbone, Bootstrap, exceptionHandler, tmpl) {

    ExceptionView = Backbone.View.extend({
        initialize: function (options) {
            var self = this;
            self.el = $(_.template(tmpl, {}));
            self.model = exceptionHandler;
            $('body').append(self.el);

            self.el.find('.close').click(function () {
                self.el.modal('hide');
            });
//            self.render();
            self.model.on('change', function () {
                self.render();
            })
        },

        render: function () {
            var self = this;

            window.alert(self.model.get('name') + "\n" + self.model.get('message'))
            return

            if (self.model.get('name') == null) {
//                $(self.el).modal('hide');
                return;
            }
            $(self.el).modal('show');
            self.el.find('.name').html(self.model.get('name'));
            self.el.find('.message').html(self.model.get('message'));
            self.el.alert()
        },
    });

    return new ExceptionView();
});
