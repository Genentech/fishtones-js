/*
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define(['underscore', 'Backbone'], function( _, bb){
    var FavorizableItem = bb.Model.extend({
        defaults:{
            bFavorite:false
        },
        isFavorite: function(){
            return this.get('bFavorite')
        },
        setFavorite: function(val){
            var self = this;
            self.set('bFavorite', val);
        }
        
    });

    return FavorizableItem;
});
