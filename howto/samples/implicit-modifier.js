/*
 Based on an original peptide and label(s), uses the ImplicitModifier
 and applies a series of operation to a list peptide/label(s):
 * build an explicit peptide
 * detect back the implied label(s)
 * clean up the peptide
 */
var implModifier = fishtones.dry.ImplicitModifier;

//locate table body and create an underscore.js template
var tbody      = $('#target').find('tbody');
var templateTD = '<tr><td class="text-muted"><%= origPept %></td>' +
    '<td class="text-muted"><%= origLabels %></td>' +
    '<td><small><%= explicitPeptide %></small></td>' +
    '<td><%= detectedLabels %></td><td><%= cleanPeptide %></td></tr>';

var cases = [
    ['QKTAR', 'silac'],
    ['QK{Methyl}TAR', 'prop_d0'],
    ['QK{Dimethyl}TAR', 'prop_d0'],
    ['QK{Dimethyl}TAR', 'silac'],
    ['QKTA', 'prop_d0,silac']
];

cases.forEach(function (c) {
    //build original data from parameters
    var origPept   = new fishtones.dry.RichSequence().fromString(c[0]);
    var origLabels = c[1];

    //creates the explicit peptide and add the label inferred modifications
    var explicitPeptide = origPept.clone();
    implModifier.label(origLabels.split(','), explicitPeptide);

    //reverse the process to extract the clean peptide & labels
    var cleanPeptide   = explicitPeptide.clone();
    var detectedLabels = implModifier.getLabelsAndClean(cleanPeptide);

    //append a line in the table using underscore.js template
    tbody.append($(_.template(templateTD, {
        origPept       : c[0],
        origLabels     : origLabels,
        explicitPeptide: explicitPeptide.toString(),
        detectedLabels : detectedLabels.join(','),
        cleanPeptide   : cleanPeptide
    })));
});