/*
 * various jquery plugins and utilities for the how-to web site
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

$(function () {
    $.fn.hideBlock = function (options) {
        return this.each(function () {
            var $el = $(this);
            var level = options.level || 'danger';
            var type = options.type || 'none';

            var header;
            if ($el.children().length == 0 || $el.find(':first-child').prop("tagName").toLowerCase() != 'h4') {
                header = $('<h4/>');
                $el.prepend(header);
            } else {
                header = $el.children().first();
            }

            header.addClass('hide-block');
            var span = $('<span class="btn label label-' + level + '" style="margin-right:1em">' + type + '</span>');
            header.prepend(span);

            var plusMinusToggle = $('<span style="padding-left:.5em" class="pull-right">+</span>');
            span.append(plusMinusToggle);
            var hiddenChildren;
            if (options.hasVisualization) {
                hiddenChildren = $el.find('pre');
            } else {
                hiddenChildren = $el.children().slice(1);
            }
            hiddenChildren.hide();

            span.click(function () {
                hiddenChildren.toggle();
                if (hiddenChildren.is(':visible')) {
                    plusMinusToggle.text('-');
                } else {
                    plusMinusToggle.text('+');
                }
            });

            if (location.hash === '#nohide') {
                span.click();
            }

        });
    };

    /*
     sampleCode plugin will load the code & template denominated by the sample attribute
     */
    $.fn.sampleCode = function (options) {
        var success = options && options.success;
        return this.each(function () {
            var $el = $(this);
            var codeName = $el.attr('sample');

            var elName = $('<span><strong>source: </strong><code>samples/' + codeName + '.(js|html)</code></span>');
            var codePre = $('<pre/>');
            var codeResults = $('<div class="sample-results"/>');
            $el.append(elName)
            $el.append(codePre);
            $el.append(codeResults);


            (function (lel) {
                $.when($.get('samples/' + codeName + '.html'), $.ajax('samples/' + codeName + '.js', {dataType: 'text'})).done(function (htmlReq, jsReq) {
                    var html = htmlReq[0];
                    var js = jsReq[0];

                    codeResults.append($(html));
                    codePre.text(js);
                    js = js.replace("$('#target')", 'codeResults');
                    try {
                        eval(js);
                    } catch (e) {
                        console.error(e.message);
                        console.error(e.stack);

                        codeResults.empty();
                        codeResults.append('<pre>' + e.message + '</pre>')
                    }
                    setTimeout(function () {
                        var hasVisualization = lel.attr('with_visualization');
                        var typeStr = hasVisualization ? 'code sample & viz' : 'code sample'
                        lel.hideBlock({level: 'danger', type: typeStr, hasVisualization: hasVisualization});
                    }, 0)
                });
            })($el);
        });

    };

    var addHeaderFooter = function () {
        $.get('templates/header.html', function (html) {
            var page = location.pathname.replace(new RegExp('.*/'), '');
            var $html = $(html)
            $html.find('a[href="' + page + '"]').parent().addClass('active');
            $('body').prepend($html);
        });


        $.get('templates/footer.html', function (html) {
            $('body').append(html);
        });


    };

    addHeaderFooter();

    //if they are element to dispkay, check that ajax works (i.e. we are not on some local file system)
    $.ajax({
        url: 'samples/amino-acids.html',
        success: function () {
        },
        error: function () {
            alert('This how to web site requires ajax to be enabled. That is typically not the case on a file system. Visit http://research-pub.gene.com/fishtones/howto or serve the file with and http server.')
        }
    });


    $("#affix-nav").affix({
        offset: {
            top: 0
        }
    });
    $('.sample-code').sampleCode();
    $('.api-block').hideBlock({level: 'warning', type: '(partial) API'});


    /*
     hack the data.demo url, as file do not like ? and & characters

     */
    fishtones.deps.$(document).ajaxSend(function (event, jqxhr, settings) {
        var reQM = /\?/g;
        var reAND = /&/g;
        if (settings.url.indexOf('data-demo/') == 0) {
            settings.url = settings.url.replace(reQM, '_QM_').replace(reAND, '_AND_');
            settings.url += '.json';
        }

    });

});
