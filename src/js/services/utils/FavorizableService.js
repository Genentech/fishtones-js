/*
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define(['underscore'], function(_) {
    var FavorizableService = function() {
        var self = this;

        self.manager = {};
    };

    /**
     * register the behavior for a given type
     * @param {String} type
     * @param handlers a map of functions for different behaviors
     *  - getOne(favItem, callback)
     *  - getList(favItemList, callback)
     *  - setOne(favItem, callback)
     */
    FavorizableService.prototype.register = function(type, handlers) {
        this.manager[type] = handlers
    };
    
    FavorizableService.prototype.isRegistered = function(type) {
        return this.manager[type] !== undefined
    };
    

    /**
     * given one type and one id, return the favorized value fpr the object (boolean)
     * @param {FavorizableItem} favItem
     */

    FavorizableService.prototype.getOne = function(favItem) {
        var self = this;
        this.manager[favItem.get('type')].getOne(favItem.get('id'), function(bFav) {
            favItem.setFavorite(bFav);
        })
    }
    /**
     * given one type and one id, return the favorized value fpr the object (boolean)
     * @param {List[FavorizableITems]} favItemList
     * @param {function} callback (function called a map id -> true/false)
     */
    FavorizableService.prototype.getList = function(favItemList) {
        var self = this;
        if (_.size(favItemList) == 0) {
            return;
        }
        var tmpMap = {};
        _.each(favItemList, function(fit) {
            tmpMap[fit.get('id')] = fit;
        });
        self.manager[favItemList[0].get('type')].getList(_.keys(tmpMap), function(bFavMap) {
            _.each(bFavMap, function(bFav, id) {
                tmpMap[id].setFavorite(bFav);
            });
        });

    }

    FavorizableService.prototype.setOne = function(favItem, bFav) {
        var self = this;
        self.manager[favItem.get('type')].setOne(favItem.get('id'), bFav, favItem.get('obj'), function(ret) {
            favItem.setFavorite(ret[favItem.get('id')]);
        })
    }
    return new FavorizableService();
});
