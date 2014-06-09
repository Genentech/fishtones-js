/*
 * area to handle move/zoom etc. buttons
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define(['underscore', 'd3'], function(_, d3){
    /**
     * svg container
     * d3-Scaling-context (contains the viewport and domains boundaries
     * a call back to be called when zoomed
     */
    D3ScalingAreaButtons = function(container, context, callback, options) {
        options = $.extend({}, options);
        var self = this;
        self.context = context;
        self.container = container;
        self.callback = callback
        self.height = options.height || 30;

        self.container.attr('width', context.width);
        self.container.attr('height', self.height);

        self.p_setup = p_setup;

        self.p_setup()

    }
      return D3ScalingAreaButtons;

});