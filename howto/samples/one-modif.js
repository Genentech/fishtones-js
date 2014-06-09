//adding one modification to the dictionary
var dico = fishtones.dry.ResidueModificationDictionary;
dico.add({
    name    : 'my-modif',
    fullName: 'a sample modification',
    mass    : 1234.5678
});

var mod = dico.get('my-modif');
$('#target').text('mass=' + mod.get('mass'));