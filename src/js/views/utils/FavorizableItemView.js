/*
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define(['jquery', 'underscore', 'Backbone', 'fishtones/services/utils/FavorizableService'], function($, _, bb, favService) {
    var FIV = bb.View.extend({
        initialize : function(opt) {
            var self = this;

            $(self.el).empty();
            var el = $('<a class="btn"><i class="icon-star-empty"></i></a>');
            $(self.el).append(el);
            self.icon = el.find('i');

            self.model.bind('change', function() {
                self.render();
            });
            self.render();
        },
        events : {
            'click' : 'click',
        },
        click : function() {
            var self = this;
            var model = self.model;
            if (favService.isRegistered(model.get('type'))) {
                favService.setOne(model, !model.isFavorite());
            } else {
                model.setFavorite(! model.isFavorite());
            }
        },
        render : function() {
            var self = this;
            if (self.model.isFavorite()) {
                self.icon.removeClass('icon-star-empty').addClass('icon-star');
                $(self.el).css('opacity', '1.0');
            } else {
                self.icon.removeClass('icon-star').addClass('icon-star-empty');
                $(self.el).css('opacity', '0.6');
            }
            return self;
        }
    });
    return FIV;
});
