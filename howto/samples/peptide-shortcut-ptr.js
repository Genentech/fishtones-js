/*
 based on an original peptide, build a sequence pointer shortcut and uncompresses it.
 */
var richSeqShortcuter = new  fishtones.dry.RichSequenceShortcuter({cleavageEnzyme: 'arg-c'});

//locate table body and create an underscore.js template
var tbody      = $('#target').find('tbody');
var templateTD = '<tr><td class="text-muted"><%= origPeptide %></td>' +
    '<td "><%= shortcut %></td><td><%= reverted %></td></tr>';

var cases = [
    '{Propionyl}TK{Acetyl}QTAR',
    '{Propionyl}TKQTAR',
    'PKPTIDER'
];

cases.forEach(function (origPeptide) {
    var peptide    = new fishtones.dry.RichSequence().fromString(origPeptide);
    var shortcut   = richSeqShortcuter.richSeqToSequencePtr(peptide);
    var revPeptide = richSeqShortcuter.richSeqFrom(shortcut);

    //append a line in the table using underscore.js template
    tbody.append($(_.template(templateTD, {
        origPeptide: origPeptide,
        shortcut   : shortcut,
        reverted   :revPeptide
    })));
});