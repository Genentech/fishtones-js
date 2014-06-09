/*
 * switch button to swap the backend service
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define(['jquery', 'underscore', 'Backbone', 'fishtones/services/wet/BackendSwitch', 'text!fishtones-templates/wet/backend-switch.html'], function($, _, bb, backendSwitch, tmpl) {
    var BackendSwitchView = bb.View.extend({
        initialize : function() {
            var self = this;
            self.model = backendSwitch;

            this.model.on('change', function() {
                self.render()
            })
            var jqel = $(tmpl);
            self.elButtons = {
                GFY : jqel.find('button[name=GFY]'),
                STANDALONE : jqel.find('button[name=STANDALONE]')
            }
            $(self.el).append(jqel);
            self.render();

        },
        events : {
            'click button' : 'click',
        },
        click : function(evt) {
            var self = this;
            var v = $(evt.target).attr('name')
            self.model.val(v);
            if(! self.options.preventReload)
                location.reload();
        },
        render : function() {
            var self = this;

            $(self.el).find('button').removeClass('disabled');
            self.elButtons[self.model.val()].addClass('disabled');
        }
    });
    return BackendSwitchView;
});
