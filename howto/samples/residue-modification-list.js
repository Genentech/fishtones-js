//shows 4 predefined modifications from unimod
var dico  = fishtones.dry.ResidueModificationDictionary;
var tbody = $('#target').find('tbody');

['Phospho', 'Oxidation', 'Methyl', 'Dimethyl'].forEach(function (name) {
    var modif = dico.get(name);
    tbody.append($(
            '<tr><td>' + modif.get('name')
            + '</td><td>' + modif.get('mass')
            + '</td></tr>'
    ));
})