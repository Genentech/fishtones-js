/*
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define(['jquery',
        'Underscore',
        'Backbone',
        'text!fishtones/templates/dry/SequenceProcessParamsLineTemplate.html',
        'fishtones/models/dry/SequenceProcessParams',
    ],
    function ($, _, Backbone, sppTmpl, spp) {
        var SequenceProcessParamsLineView = Backbone.View.extend({
            model: spp,
            events: {
//            "change" : "pipo"
            },
            initialize: function () {
                var self = this;
                _.bindAll(this, 'render');
                self.model.bind('change', self.render);

            },
            render: function (options) {
                var self = this;
                $(this.el).html(_.template(sppTmpl, self.model.toJson()));
            },
        });
        return  SequenceProcessParamsLineView;
    });

