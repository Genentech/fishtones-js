/**
 * singleton used to raise excpetions....
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define(['Backbone'], function (Backbone) {
    ExceptionHandler = Backbone.Model.extend({
        defaults: {
            name: null,
            message: null,
            throwException: false
        },
        initialize: function () {
            var self = this;

        },
        raise: function (exc) {
            console.error('raising ', exc, exc.name, exc.message, exc.stack)
            if (this.get('throwException')) {
                throw exc;
            }
            exc.date = new Date()
            this.set(exc);
        }
    });
    return new ExceptionHandler()
});

