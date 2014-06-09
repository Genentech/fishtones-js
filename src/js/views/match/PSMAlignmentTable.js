/*
 * An html table to display a list of PSM alignment widgets
 * The scale can be locked across all the spectra view, so the zooming is propagated
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define(['jquery', 'underscore', 'Backbone', './PSMAlignmentTableLine', 'fishtones/services/utils/FavorizableService', 'fishtones/views/utils/D3ScalingContext', 'text!fishtones-templates/match/psm-table.html'], function ($, _, Backbone, PSMAlignmentTableLine, favService, D3ScalingContext, tmpl) {

    PSMAlignmentTable = Backbone.View.extend({
        initialize: function (options) {
            var self = this;
            if (options == undefined) {
                options = {};
            }
            self.hide = options.hide;

            $(self.el).empty();
            $(self.el).append(tmpl)

            self.tbody = $(self.el).find('tbody');

            if (options.hide) {
                _.each(options.hide, function (h) {
                    $(self.el).find('.' + h).hide()
                    $(self.el).find('.' + h).hide()

                })
            }
            self.p_setup_scale_locker();
            //self.initFavorize();
        },
        p_setup_scale_locker: function () {
            var self = this;
            var elLocker = $(self.el).find("#scale-locker");

            var fUpdate = function (srcContext, widgetOrig) {
                _.each(self.spectraWidgets, function (w, i) {
                    if (w == widgetOrig) {
                        return;
                    }
                    w.scalingContext.xRange(srcContext.xRange()[0], srcContext.xRange()[1]);
                    w.render();
                });
            };

            elLocker.click(function () {
                if (elLocker.hasClass('unlock')) {
                    elLocker.removeClass('unlock').addClass('lock');
                    _.each(self.spectraWidgets, function (w) {
                        w.scalingContext.xOrigDomainBackup = [w.scalingContext.xMin(), w.scalingContext.xMax()];
                        w.scalingContext.xMin(self.xUnionDomain[0]);
                        w.scalingContext.xMax(self.xUnionDomain[2]);
                        w.scalingContext.addChangeXDomainCallBack('global update', function (c) {
                            fUpdate(c, w)
                        });
                        w.scalingContext.reset();
                        w.render();
                    })
                } else {
                    elLocker.removeClass('lock').addClass('unlock');
                    _.each(self.spectraWidgets, function (w) {
                        w.scalingArea.context.removeChangeXDomainCallBack('global update');
                        w.scalingContext.xMin(w.scalingContext.xOrigDomainBackup[0]);
                        w.scalingContext.xMax(w.scalingContext.xOrigDomainBackup[1]);

                        w.scalingContext.reset();
                        w.render();
                    })
                }
            });

        },
        p_updateGlobalScalingContext: function () {
            var self = this;

            if (self.spectraWidgets.length == 0) {
                return;
            }
            var xDomains = _.collect(self.spectraWidgets, function (w) {
                return w.scalingContext.xDomain()
            });
            self.xUnionDomain = [_.chain(xDomains).collect(function (r) {
                return r[0]
            }).min().value(), _.chain(xDomains).collect(function (r) {
                return r[1]
            }).max().value()]

        },
        render: function () {
            var self = this;
            self.tbody.empty();
            self.favorizes = []
            self.spectraWidgets = []
            _.chain(self.model.models).sortBy(function (psma) {
                return psma.get('expSpectrum').get('scanNumber')
            }).each(function (psma) {
                var tr = $('<tr/>');
                self.tbody.append(tr);
                psma.build()
                var tline = new PSMAlignmentTableLine({
                    el: tr,
                    model: psma,
                    hide: self.hide
                });
                tline.render({
                    fragmentTol: self.model.fragmentTol
                });
                self.favorizes.push(tline.favorize)
                self.spectraWidgets.push(tline.widgetMatchSpectrum);
            });
            $(self.el).find("#scale-locker").removeClass('lock').addClass('unlock')
            self.p_updateGlobalScalingContext();
            //self.setFavorite()
        },
        clear: function () {
            this.tbody.empty();
        },
        setFavorite: function () {
            var self = this;
            favService.getList(self.favorizes);
        },
        initFavorize: function () {
            var self = this;
            if (favService.isRegistered('psm'))
                return;

            var urlPSMStore = "/fishtones/backend/ms/store/psm";
            favService.register('psm', {
                getOne: function (id, callback) {
                    $.getJSON(urlPSMStore + "/isFavorite/" + id, {}, callback)
                },
                getList: function (ids, callback) {
                    $.post(urlPSMStore + "/areFavorite", {
                        ids: ids,//.join("\n"),
                    }, callback, 'json');
                },

                setOne: function (id, bFav, obj, callback) {
                    var ser = obj.serialize();
                    var url = urlPSMStore + "/setFavorite";
                    $.post(url, {
                        id: ser.id,
                        isFavorite: bFav,
                        'obj': JSON.stringify(ser)
                    }, callback, 'json')
                },
            })
        }
    });

    return PSMAlignmentTable;
});
