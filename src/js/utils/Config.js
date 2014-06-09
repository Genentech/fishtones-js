/**
 * a singleton object that will handle global scope configuration (path to wet info rest service etc..)
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define(['underscore'], function (_) {
    _.templateSettings = {
        interpolate: /\{\{(.+?)\}\}/g
    };

    Config = function () {
        var self = this;
        self.data = {}
    }
    Config.prototype.set = function (key, value) {
        this.data[key] = value;
        return this;
    }
    Config.prototype.get = function (key) {
        return this.data[key];
    }

    return new Config();
});
