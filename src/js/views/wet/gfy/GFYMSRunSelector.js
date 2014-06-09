/*
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define(['jquery-plus', 'underscore', 'Backbone', 'Config', 'fishtones/models/wet/MSMSRun', 'text!fishtones-templates/wet/gfy/msrun-selector.html'],
    function($, _, bb, config, MSMSRun, tmpl) {
    var gfyrs = bb.View.extend({
        initialize : function() {
            var self = this;

            var jqEl = $(tmpl)
            self.elInput = $(jqEl).find('input');
            self.elButton = $(jqEl).find('button');

            var x = self.elInput.typeahead({
                minLength : 3, 
                source : function(query, process) {
                    $.getJSON(config.get('wet.url.rest') + "/msmsrun/autocomplete/name/" + query, function(data) {
                        console.log(data)
                        //we have to messup with the string function, because bootstrap store the item as a string in th <li> attribute... hum hum hum
                        _.each(data, function(d) {
                            d.toString = function() {
                                return d.id + '|' + d.creationDate + '|' + d.name
                            }
                        })
                        process(data);
                    })
                },
                matcher : function(item) {
                    return item.name;
                },
                updater : function(item) {
                    //well, here, it's not the object which is passed, but the string attribute
                    var a = item.split('|', 3)
                    var run = new MSMSRun({
                        id : a[0],
                        name : a[2]
                    })
                    self.model = run
                    if (self.options.callback) {
                        self.options.callback(run);
                    }
                    return a[2]
                },
                highlighter : function(item) {
                    return '<span class="muted">' + item.creationDate + '</span> ' + item.name
                },
                sorter : function(items) {
                    return items.sort(function(a, b) {
                        if (a.creationDate == b.creationDate) {
                            a.name.localeCompare(b.name);
                        };
                        return b.creationDate.localeCompare(a.creationDate);
                    });

                },
                items : 100,
                menu : '<ul class="typeahead dropdown-menu msmsrun-selector"></ul>'
            })

            $(self.el).empty().append(jqEl);
        }
    })

    return gfyrs;
});
