/*
 * list all modifications in a table
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define(['underscore', 'bootstrap', 'Backbone', 'fishtones/collections/dry/ResidueModificationDictionary', 'fishtones/services/dry/RichSequenceShortcuter', 'text!fishtones-templates/dry/residue-modification-table.html', 'text!fishtones-templates/dry/residue-modification-table-line.html'], function (_, Bootstrap, Backbone, dicoResMod, RichSequenceShortcuter, tmpl_table, tmpl_line) {
    ResidueModificationTable = Backbone.View.extend({
        initialize: function (options) {
            var self = this;
            self.model = dicoResMod;
            self.rss = new RichSequenceShortcuter();
        },
        render: function () {
            var self = this;
            $(self.el).empty();
            $(self.el).append($(tmpl_table))

            var elTBody = $(self.el).find('tbody');
            _.each(dicoResMod.models, function (resmod) {
                elTBody.append(_.template(tmpl_line, {
                    name: resmod.get('name'),
                    mass: resmod.get('mass'),
                    fullName: resmod.get('fullName'),
                    shortcut: self.rss.get('modif2short')[resmod.get('name')] || ''
                }))

            });

        }
    });
    return ResidueModificationTable;
})
