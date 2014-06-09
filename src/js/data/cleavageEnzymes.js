/*
 * enzyme with regular expression. Theses are a bit ugly, because JavaScript does support look ahead
 * This file is to be loaded by collections/dry/CleavageEnzymeDictionary
 * 
 * Copyright (c) 2013-2-14, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define(function () {
    return [
        {
            name: "trypsin",
            rule: '(?:[RK]|.+?(?:[RK]|$))(?=[^P]|$)'
        },
        {
            name: "arg-c",
            rule: '(?:R|.+?(?:R|$))(?=[^P]|$)'
        },
        {
            name: "chymotrypsin",
            rule: '(?:[FLWY]|.+?(?:[FLWY]|$))(?=[^P]|$)'
        }
    ]
});

