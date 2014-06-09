/**
 * a system to collect text data in a persistent way  the idea is
 * to collect data into a file, to sent it later to R or wherever
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */


define(['jquery', 'underscore'], function ($, _) {
    /**
     * constructor with options
     *
     * @params name : 'default'
     * @params persistent : false
     * @params baseDirectory : 'data_collector'
     * @params doNotDuplicateHeader : false
     * @params append: false - append over existing Datacollector with same
     *         baseDirectory/name
     * @params size: 10M
     */

    var DataCollector = function (options) {
        var self = this
        options = $.extend({
            name: 'default.txt',
            baseDirectory: '/data_collector',
            doNotDuplicateHeader: false,
            create: true,
            onChange: null
        }, options);

        _.each(['name', 'baseDirectory', 'doNotDuplicateHeader', 'create', 'onChange'], function (e) {
            self[e] = options[e]
        });

        self.fileEntry = null;

        self.p_writeFile = p_writeFile;
        self.p_init = p_init

        window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

        window.requestFileSystem(window.TEMPORARY, 5 * 1024 * 1024/* 5MB */, function (fs) {
            self.fs = fs;
        }, errorHandler);

        if (DataCollector.g_fs == null) {
            setTimeout(function () {
                if (self.fs != null) {
                    self.p_init(options);
                }
            }, 100);
            return;
        }

    }
    var p_init = function (options) {
        var self = this;
        self.fs.root.getDirectory(self.baseDirectory, {
            create: true
        }, function (dirEntry) {
            dirEntry.getFile(self.name, {
                create: true
            }, function (fileEntry) {
                if (self.create) {
                    fileEntry.remove(function () {
                        dirEntry.getFile(self.name, {
                            create: true
                        }, function (fileEntry) {
                            self.fileEntry = fileEntry;
                        });
                    });
                } else {
                    self.fileEntry = fileEntry;
                }
            });
        }, errorHandler);

    }

    function errorHandler(e) {
        var msg = '';
        switch (e.code) {
            case FileError.QUOTA_EXCEEDED_ERR:
                msg = 'QUOTA_EXCEEDED_ERR';
                break;
            case FileError.NOT_FOUND_ERR:
                msg = 'NOT_FOUND_ERR';
                break;
            case FileError.SECURITY_ERR:
                msg = 'SECURITY_ERR';
                break;
            case FileError.INVALID_MODIFICATION_ERR:
                msg = 'INVALID_MODIFICATION_ERR';
                break;
            case FileError.INVALID_STATE_ERR:
                msg = 'INVALID_STATE_ERR';
                break;
            case FileError.TYPE_MISMATCH_ERR:
                msg = 'TYPE_MISMATCH_ERR';
                break;
            default:
                msg = 'Unknown Error';
                break;
        }
        ;
        console.error('Exception: ' + msg, arguments);
    }

    var maxTimeout = 1000;
    DataCollector.prototype.whenReady = function (callback, t) {
        var self = this;
        if (t == null) {
            t = 1
        }
        if (t >= 50) {
            throw {
                name: 'TimeoutExpired',
                message: callback
            }
        }
        if (self.fileEntry) {
            callback();
            return;
        }
        setTimeout(function () {
            self.whenReady(callback, t + 1);
        }, t * 20);
    }

    DataCollector.prototype.filename = function () {
        return this.baseDirectory + '/' + this.name;
    }
    var p_writeFile = function (append, txt, callback) {
        var self = this;
        self.fileEntry.createWriter(function (fileWriter) {

            fileWriter.onwriteend = function (e) {
                if (callback) {
                    callback()
                }
            };

            fileWriter.onerror = function (e) {
                console.log('Write failed: ' + e.toString());
            };

            l = fileWriter.length;
            if (append) {
                fileWriter.seek(l);
                if (l > 0 && self.doNotDuplicateHeader) {
                    txt = txt.replace(/.*?\n/, '');
                }
            } else {
                fileWriter.truncate(0);
                l = 0;
            }
            // EOF.

            if (txt != '') {
                var bb = new Blob([txt], {
                    type: 'text/plain'
                });
                fileWriter.write(bb);
            }
            if (self.onChange) {
                self.onChange(self, {
                    length: l + txt.length
                })
            }
        });
    }

    DataCollector.prototype.clear = function (callback) {
        var self = this;
        this.whenReady(function () {
            self.p_writeFile(false, '', callback);
            if (self.onChange) {
                self.onChange(self, {
                    length: 0
                })
            }

        });
    };

    DataCollector.prototype.append = function (txt, callback) {
        var self = this;
        self.whenReady(function () {
            self.p_writeFile(true, txt, callback);
        })
    };

    /**
     * call the argument function with the written ontent
     */
    DataCollector.prototype.read = function (callback) {
        var self = this;
        this.whenReady(function () {
            self.fileEntry.file(function (f) {
                var reader = new FileReader();
                reader.onloadend = function (e) {
                    callback(this.result);
                };
                reader.readAsText(f);
            }, errorHandler);
        });
    };

    DataCollector.prototype.size = function (callback) {
        var self = this;
        self.whenReady(function () {
            self.fileEntry.createWriter(function (fileWriter) {
                callback(fileWriter.length);
            });
        })
    }

    return DataCollector;

}); 
