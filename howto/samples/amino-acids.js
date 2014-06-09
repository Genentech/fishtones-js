/*
    add one new amino acid and list them all
 */
var dico = fishtones.dry.AminoAcidDictionary;
dico.add({
    code1: 'X',
    mass : 1234.5678
});

var tmpl      = '<div class="col-md-2"><strong style="font-family:monospace;"><%= code1 %>:</strong> <%= mass %></div>';
var container = $('#target').find('div');
dico.each(function (aa) {
    container.append(_.template(tmpl, {
        code1: aa.get('code1'),
        mass : aa.get('mass')
    }));
})
