/*
 * basic charting widgets
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define(['jquery', './BChartData', './BChartLines'], function($, BChartData, BChartLines){
    var BChart = function(options){
        this._data = new BChartData()
    }
    
    BChart.prototype.data = function(){
        return this._data;
    }
    
    return BChart;
})
