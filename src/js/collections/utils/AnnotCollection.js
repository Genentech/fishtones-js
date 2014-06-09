/*
 * just a collection of Anotation
 * 
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define(['Backbone', '../../models/utils/Annotation'], function(bb, Annotation) {
    return bb.Collection.extend({
        model : Annotation
    });
});