/**
 * a singleton to assume if user wants data come from gfy backend or from the grails application (get queries should be the same, but url head varies)
 * the object contains a single 'value' field to be either 'GFY' or 'STANDALONE'.
 * from this value, we can ask for a url
 * when this value is set or initilized, it is written/read to a cookie
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define(['jquery', 'underscore', 'Backbone', 'jQueryCookie', 'Config'], function($, _, bb, undef, config) {
    var urls = {
        STANDALONE : '/fishtones/backend/wet-access',
        GFY : '/fishtones/backend/ms'
    };
    var defaultVal = 'GFY';
    var cookieName = 'backend_switch';

    var BackendSwitch = bb.Model.extend({
        initialize : function() {
            var self = this;
            var ck = $.cookie(cookieName);
            if (ck) {
                self.val(ck)
            } else {
                self.val(defaultVal)
            }
        },
        val : function(v) {
            var self = this;

            if (v === undefined) {
                return self.get('value');
            }

            self.set('value', v);
            $.cookie(cookieName, v, {
                expires : 666,
                path : '/'
            });
            if (v === 'GFY') {
                config.set('wet.url.rest', self.url() + '/gfy-wet');
            } else {
                config.set('wet.url.rest', self.url());
            }

            self.setupCss();
            return self;
        },
        url : function() {
            return urls[this.val()]
        },
        clearCookie : function() {
            $.cookie(cookieName, '', {
                expires : 666,
                path : '/'
            });
            //var v = $.removeCookie(cookieName);
        },
        setupCss : function() {
            var self = this;
            if (self.cssSheet === undefined) {
                self.cssSheet = document.createElement("style");
                self.cssSheet.type = "text/css";
                document.body.appendChild(self.cssSheet);
            }
            if (self.val() === 'GFY') {
                self.cssSheet.innerHTML = ".backend-switch-standalone { display: none }";
            } else {
                self.cssSheet.innerHTML = ".backend-switch-gfy { display: none }";

            }

        }
    });

    return new BackendSwitch();
});
