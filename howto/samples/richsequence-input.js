/*
 create a rich sequence input box
 callback are invoked on click button, valid and invalid input state
 */
var elTarget     = $('#target');
var elInput      = elTarget.find('#input');
var elOut        = elTarget.find('#output');
var elOutIsValid = elTarget.find('#output-is-valid');

var richSeqInput = new fishtones.dry.RichSequenceInput({
    el: elInput,
    buttonText: 'click me'
});
richSeqInput.action = function (rss) {
    elOut.text(rss.toString());
}
richSeqInput.addCallbackValid(function (rss) {
    elOutIsValid.text('YES')
});
richSeqInput.addCallbackInvalid(function (exc) {
    elOutIsValid.text('NO')
});
richSeqInput.render();
