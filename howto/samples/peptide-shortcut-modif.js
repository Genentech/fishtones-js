/*
 based on an original peptide shortcut, uncompress it to a full length peptide and compress it back
 */
var richSeqShortcuter = new  fishtones.dry.RichSequenceShortcuter();

//locate table body and create an underscore.js template
var tbody      = $('#target').find('tbody');
var templateTD = '<tr><td class="text-muted"><%= origShortcut %></td>' +
    '<td "><%= peptide %></td><td><%= revShortcut %></td></tr>';

var cases = [
    'PKPTPoIDER',
    'PKPTIDER [silac]',
    'PKMe2PTIDER [prop_d0]',
];

cases.forEach(function (origShortcut) {
    var peptide     = richSeqShortcuter.richSeqFromString(origShortcut);
    var revShortcut = richSeqShortcuter.richSeqToString(peptide);

    //append a line in the table using underscore.js template
    tbody.append($(_.template(templateTD, {
        origShortcut: origShortcut,
        peptide     : peptide.toString(),
        revShortcut : revShortcut
    })));
});