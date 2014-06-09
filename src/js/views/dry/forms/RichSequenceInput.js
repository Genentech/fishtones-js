/**
 * Input field for  RichSequence, with autocompletion
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define(['jquery-plus', 'underscore', 'Backbone', 'fishtones/models/dry/RichSequence', 'fishtones/services/dry/RichSequenceShortcuter', 'fishtones/services/dry/RichSequenceAutoCompletioner', 'text!fishtones-templates/dry/forms/richsequence-input.html'],
    function ($, _, Backbone, RichSequence, RichSequenceShortcuter, RichSequenceAutoCompletioner, tmpl) {

        RichSequenceInput = Backbone.View.extend({
            initialize: function (options) {
                var self = this;

                if (!self.model) {
                    self.model = new RichSequence();
                }
                //initialization per se
                self.richSequenceShortcuter = new RichSequenceShortcuter();
                self.autoCompletioner = new RichSequenceAutoCompletioner()
                self.callbacksInvalid = [];
                self.callbacksValid = [];
                self.callbacksClear = [];

                self.action = options && options.action;

                //dom construction
                var args = $.extend({
                    placeholder: 'H3K4, H3.1K18Ac, H3.1K18AcK23Me2, KQTAR, KAcQTAR, K{Acetylation,Methylation}QTAR{Methylation}',
                    inputClass: 'form-control',
                    value: '',
                    inputId: 'rsi-input-' + self.cid,
                    buttonClass: 'btn',
                    buttonId: 'rsi-but-' + self.cid,
                    buttonText: 'action',
                    hideButton: false,
                    hideValidIndicator: true,
                    validIndicatorId: 'rsi-badge-' + self.cid
                }, options);

                var cont = $(self.el).append($(_.template(tmpl, args)));
                self.elInput = cont.find('input');
                self.elButton = cont.find('button');
                self.hideIndicator = cont.find('span.badge')


                if (args.hideButton) {
                    self.elButton.hide();
                }else{
                }
                if (args.hideValidIndicator) {
                    self.hideIndicator.hide();
                }else{
                }

                self.elIcon = cont.find('span.glyphicon');
                setTimeout(function(){
                    var totalWidth = $(self.el).width();
                    totalWidth-=self.elButton.outerWidth(true);
                    totalWidth-=self.hideIndicator.outerWidth(true);
                    totalWidth-= self.elIcon.outerWidth(true);
                    totalWidth-=20

                    self.elInput.width(''+totalWidth+'px');
                },0);

                self.elInput.val(self.model.toString())

                self.elInput.typeahead({
                    source: function (txt, process) {
                        var typeahead = this;
                        typeahead.replaceContext = null;
                        var pCaret = self.elInput[0].selectionStart
                        var insertedChar = txt.charAt(pCaret - 1)

                        //close the curly bracket if needed
                        if (insertedChar == '{' && self.autoCompletioner.closeCurly(txt, pCaret)) {
                            self.elInput.val(txt.substring(0, pCaret) + '}' + txt.substring(pCaret))
                            self.setCaretAt(pCaret)
                            return false;
                        }

                        var replace = self.autoCompletioner.replaceable(txt, pCaret)
                        if (replace == null) {
                            typeahead.hide();
                            return null
                        }
                        if (replace.prefix.length < 2) {
                            typeahead.hide();
                            return null;
                        }

                        typeahead.replaceContext = replace
                        return self.autoCompletioner.getList(replace.prefix)
                    },
                    matcher: function () {
                        return true
                    },
                    highlighter: function (txt) {
                        var typeahead = this;

                        return self.elInput.val().substring(0, typeahead.replaceContext.posStart) + '<b>' + txt + '</b>' + self.elInput.val().substring(typeahead.replaceContext.posEnd)
                    },
                    updater: function (txt) {
                        var typeahead = this;
                        self.setCaretSelection(typeahead.replaceContext.posStart, typeahead.replaceContext.posEnd)

                        var newVal = self.elInput.val().substring(0, typeahead.replaceContext.posStart) + txt + self.elInput.val().substring(typeahead.replaceContext.posEnd)
                        self.elInput.val(newVal)
                        self.update()
                        return newVal
                    }
                })

                var pop = self.elIcon.popover({
                    placement: "bottom",
                    html: true,
                    trigger: 'hover',
                    title: 'How to enter a peptide  <button type="button" class="close" data-dismiss="modal" aria-hidden="true"',

                    content: "There is more than one way to do it:<ul> <li>shortcut as <code>H3K9</code> or <code>H3.1K27</code></li><li>shortcut with modification as <code>H3K9Me2</code></li><li>as sequence with short modification <code>QKAcTARMe</code></li><li>with long version modification <code>QK{Acetyl}TAR</code></li><li>with explicit mass <code>PEP{1234.567}TIDEMe</code></li><li>in context <code>R.QKTAR.K</code></li></ul>The modification list can be found <a href=''>soon</a>"
                });

            },
            render: function () {
                var self = this;
                self.elInput.val(self.model.toString());
                self.delegateEvents({
                    'input': 'update',
                    'keypress input': 'inputKeyPressed',
                    'click button': 'callAction'
                })
                // self.on('change:input', function(){self.update()});
                // self.on('keypress:input', function(){self.inputKeyPressed()});
                // self.on('button:click', function(){self.callAction()});
                return self;
            },
            // events : {
            // 'input' : 'update',
            // 'keypress input' : 'inputKeyPressed',
            // 'click button' : 'callAction'
            // },
            update: function (evt) {
                var self = this;
                try {
                    var inStr = self.elInput.val().trim();
                    if (inStr == '') {
                        _.each(self.callbacksClear, function (f) {
                            f(self.model)
                        });
                        return;
                    }

                    self.richSequenceShortcuter.richSeqReadFrom(self.model, inStr)
                    self.isValid = true;
                    self.elButton.removeClass('btn-warning').addClass('btn-success').attr('disabled', null);
                    self.hideIndicator.removeClass('badge-important').addClass('badge-success').html('&radic;');
                    _.each(self.callbacksValid, function (f) {
                        f(self.model)
                    });
                } catch (exc) {
                    self.isValid = false;
                    self.elButton.addClass('btn-warning').removeClass('btn-success').attr('disabled', 'disabled');
                    self.hideIndicator.removeClass('badge-success').addClass('badge-important').html('X');
                    _.each(self.callbacksInvalid, function (f) {
                        f(exc)
                    });
                }

            },
            /**
             * click button if enter key is pressed
             */
            inputKeyPressed: function (evt) {
                var self = this;
                if (evt.charCode == 13) {
                    self.callAction();
                }
            },
            /**
             * add a funciton to be called whenever the field is a valid RichSequence descriptor
             * argument passed to the function will a RichSequence (the RSI model)
             * @param {function} f
             */
            addCallbackValid: function (f) {
                this.callbacksValid.push(f)
            },
            /**
             * add a funciton to be called whenever the field is a INvalid RichSequence descriptor
             * arg passed to function is the current exception
             * @param {function} f
             */
            addCallbackInvalid: function (f) {
                this.callbacksInvalid.push(f)
            },
            addCallbackClear: function (f) {
                this.callbacksClear.push(f)
            },
            callAction: function () {
                var self = this;
                if (self.action == undefined) {
                    return;
                }
                self.action(self.model)
            },
            setCaretAt: function (pos) {
                var self = this;
                var node = self.elInput[0];
                node.setSelectionRange(pos, pos);
            },
            setCaretSelection: function (pStart, pEnd) {
                var self = this;
                var node = self.elInput[0];
                node.setSelectionRange(pStart, pEnd);
            },
            /**
             * just return the text in the input field
             */
            inputSequence: function () {
                var self = this;
                return self.elInput.val().trim()
            }
        })
        return RichSequenceInput;
    });
