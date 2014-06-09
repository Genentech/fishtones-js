define(['underscore', 'Backbone', 'fishtones/models/utils/FavorizableItem', 'fishtones/views/utils/FavorizableItemView', 'fishtones/services/utils/FavorizableService'], function (_, bb, FavorizableItem, FavorizableItemView, favService) {
    var Dummy = bb.Model.extend({})


    return describe('Favorizable', function () {
        describe('Item', function () {
            var it_1 = new FavorizableItem({
                obj: new Dummy(),
                type: 'dummy',
                id: 123
            });
            it('constructor', function () {
                expect(it_1 instanceof FavorizableItem).toBe(true);
            })
            it('get/set fav', function () {

                expect(it_1.isFavorite()).toBe(false);
                it_1.setFavorite(true);
                expect(it_1.isFavorite()).toBe(true);
                it_1.setFavorite(false);
                expect(it_1.isFavorite()).toBe(false);
            })
        });
        describe('FavorizableView', function () {
            describe('ItemView', function () {
                var add5 = function (name) {
                    var items = [new FavorizableItem({
                        obj: new Dummy(),
                        type: 'dummy',
                        id: 1
                    }), new FavorizableItem({
                        obj: new Dummy(),
                        type: 'dummy',
                        id: 2
                    })];

                    var div = addDZDiv('Favorizable', name, 200, 40);
                    var views = [];
                    _.times(5, function (i) {
                        var el = $('<span/>');
                        div.append(el);
                        views[i] = new FavorizableItemView({
                            el: el,
                            model: items[i % 2]
                        });
                    })

                    return {
                        items: items,
                        views: views
                    }
                }
                var checkViews = function (views, exp) {
                    _.each(exp, function (v, i) {
                        expect($(views[i].icon).hasClass('icon-star')).toBe(v);
                        expect($(views[i].icon).hasClass('icon-star-empty')).toBe(!v);
                    })
                }
                it('init, all false', function () {
                    var ctx = add5(this.description);
                    checkViews(ctx.views, [false, false, false, false, false]);

                });
                it('one item set 3 views', function () {
                    var ctx = add5(this.description);
                    checkViews(ctx.views, [false, false, false, false, false]);

                    ctx.items[0].setFavorite(true);
                    checkViews(ctx.views, [true, false, true, false, true]);
                });

                it('click one', function () {
                    var ctx = add5(this.description);
                    checkViews(ctx.views, [false, false, false, false, false]);

                    ctx.views[3].icon.click();
                    checkViews(ctx.views, [false, true, false, true, false]);
                });
            });
        });

        describe('FavorizableService', function () {
            it('exist', function () {
                expect(favService).not.toBeUndefined();
            });

            var items = _.collect(_.range(0, 10), function (id) {
                return new FavorizableItem({
                    obj: new Dummy({
                        name: 'myname_' + id
                    }),
                    type: 'dummy',
                    id: id
                });
            });
            var favVals = {
                1: true,
                4: true,
                5: true
            }
            /* ************  this is the important part, the definition of the FavoriteSevice behavior
             * */

            favService.register('dummy', {
                getOne: function (id, callback) {
                    callback(favVals[id] || false);
                },
                getList: function (ids, callback) {
                    var ret = {}
                    _.each(ids, function (id) {
                        ret[id] = favVals[id] || false;
                    });
                    callback(ret);
                },
                setOne: function (id, bFav, obj, callback) {
                    favVals[id] = bFav;
                    var ret = {};
                    ret[id] = bFav;
                    callback(ret);
                },
            })
            var checkOne = function (bExp) {
                _.each(bExp, function (v, i) {
                    expect(items[i].isFavorite()).toBe(v)
                })
            }
            var reset = function () {
                _.each(items, function (itm) {
                    itm.setFavorite(false);
                });
                favVals = {
                    1: true,
                    4: true,
                    5: true
                }
            }
            it('getOne', function () {
                reset();
                checkOne([false, false])
                favService.getOne(items[0]);
                favService.getOne(items[1]);
                checkOne([false, true])
            })
            it('getList', function () {
                reset();
                checkOne([false, false, false, false, false, false])
                favService.getList([items[0], items[1], items[2], items[4]]);
                checkOne([false, true, false, false, true, false])
            })
            it('setOne', function () {
                reset();
                checkOne([false, false, false, false, false])

                favService.setOne(items[2], true);
                checkOne([false, false, true, false, false])

                favService.setOne(items[2], false);
                checkOne([false, false, false, false, false])
            })
        });
    });

});
