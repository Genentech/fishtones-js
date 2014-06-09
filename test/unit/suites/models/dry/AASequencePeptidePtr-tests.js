define(['underscore', 'fishtones/models/dry/AASequencePeptidePtr', 'fishtones/models/dry/CleavageEnzyme', 'fishtones/collections/dry/AASequenceDictionary'], function(_, AASequencePeptidePtr, CleavageEnzyme, dicoSeq) {

    return describe('AASequencePeptidePtr', function() {

        describe("constructor ", function() {
            it("set enzyme as text ", function() {
                var spp = new AASequencePeptidePtr();
                expect(_.size(spp.get('peptideIndex'))).toEqual(0)

                spp.set('cleavageEnzyme', 'trypsin');
                expect(spp.get('cleavageEnzyme') instanceof CleavageEnzyme).toBe(true)
            });
        });
        describe("changing enzyme change overall number of peptides ", function() {
            var spp = new AASequencePeptidePtr();
            it("trypsin", function() {
                //grep sequence js/data/aaSequences.js | cut -f2 -d'"' | perl -p -e 's/(?<=[KR])(?=[^P])/\n/g' | sort -u | wc -l
                spp.set('cleavageEnzyme', 'trypsin');
                expect(_.size(spp.get('peptideIndex'))).toEqual(51)
            });
            it("arg-c", function() {
                //grep sequence js/data/aaSequences.js | cut -f2 -d'"' | perl -p -e 's/(?<=[KR])(?=[^P])/\n/g' | sort -u | wc -l
                spp.set('cleavageEnzyme', 'arg-c');
                expect(_.size(spp.get('peptideIndex'))).toEqual(39)
            });
        });

        describe("extract seqPtr/aaPtr from pointer", function() {
            var checkPtrExtract = function(ptr, seqPtr, aaPtr, comment) {
                it(comment + ':' + ptr + " -> " + seqPtr + ' | ' + aaPtr, function() {
                    var xtract = spp.p_ptr2seqAndPeptAnchor(ptr);
                    expect(xtract.seqPtr).toEqual(seqPtr);
                    expect(xtract.aaPtr).toEqual(aaPtr);
                });
            }
            var spp = new AASequencePeptidePtr();

            checkPtrExtract("H3.1TK4", "H3.1T", 'K4', "ac long");
            checkPtrExtract("H4K5", "H4", 'K5', "shorty");
            checkPtrExtract("H4K523", "H4", 'K523', "long aa pos");
        });
        describe("ptrTrim", function() {
            var spp = new AASequencePeptidePtr();
            var check = function(ptr, expected, comment) {
                it(comment + ':' + ptr + " -> " + expected, function() {
                    expect(spp.ptrTrim(ptr)).toEqual(expected)
                });
            };
            check('H3.1', 'H3.1', 'single')            
            check('H3.1', 'H3.1', 'multiple')            
            check('H3.1K27', 'H3.1K27', 'single K27')            
            check('H3.1K27', 'H3.1K27', 'multiple K27')            
        });
        describe("ptr to peptide OK, check ptr2AAsequences", function() {
            var checkPtr2names = function(ptr, names, comment) {
                it(comment + ':' + ptr + " -> " + names, function() {
                    expect(_.collect(spp.ptr2AASequences(ptr), function(aa) {
                        return aa.get('name')
                    }).sort()).toEqual(names.sort())
                });
            }
            var spp = new AASequencePeptidePtr();

            checkPtr2names("H3.1TK4", ["H3.1T"], "unambiguous");
            checkPtr2names("H4K5", ["H4"], "unambiguous");
            checkPtr2names("H3K4", ["H3.1", "H3.1T", "H3.2", "H3.3", "H3.C"], "multiple");
            checkPtr2names("H3.1K4", ["H3.1"], "ambiguous (H3.1C), but one exact match");
            checkPtr2names("H3.1K27", ["H3.1"], "multiple, yet synomym ptr");
        });
        describe("extract clev peptide from sequence", function() {
            var spp = new AASequencePeptidePtr();
            spp.set('cleavageEnzyme', 'arg-c');

            it('ok peptides', function() {
                var aaSeq = dicoSeq.get('H3.1');
                expect(aaSeq).not.toBeNull();
                expect(spp.p_cleavedPeptideAt(aaSeq, 0)).toEqual({
                    sequence : 'MAR',
                    offset : 0
                });
                expect(spp.p_cleavedPeptideAt(aaSeq, 27)).toEqual({
                    sequence : 'KSAPATGGVKKPHR',
                    offset : 27
                });
            });
        })
        describe("extract peptide sequence", function() {
            var checkPtr2peptseq = function(ptr, expected, comment) {
                it(comment + ':' + ptr + " -> " + expected.sequence + '@' + expected.offset, function() {
                    var pept = spp.ptr2peptide(ptr);
                    expect(pept).toEqual(expected);
                });
            }
            var spp = new AASequencePeptidePtr();
            spp.set('cleavageEnzyme', 'arg-c');
            checkPtr2peptseq('H3.1K4', {
                sequence : 'TKQTAR',
                offset : 3
            }, 'peptide from unambiguous seq')

            checkPtr2peptseq('H3K4', {
                sequence : 'TKQTAR',
                offset : 3
            }, 'peptide from all H3')

            checkPtr2peptseq('H3.3K27', {
                sequence : 'KSAPSTGGVKKPHR',
                offset : 27
            }, 'peptide from all H3.3 specific')
            checkPtr2peptseq('H3.3K36', {
                sequence : 'KSAPSTGGVKKPHR',
                offset : 27
            }, 'idem as H3.3K27, but hooked from position 36')
        });

        describe("ptr to peptide, failing", function() {
            var checkPtr2names = function(ptr, comment) {
                it(comment + ':' + ptr, function() {
                    var f = function() {
                        spp.ptr2peptide(ptr)
                    };
                    expect(f).toThrow();
                });
            }
            var spp = new AASequencePeptidePtr();
            spp.set('cleavageEnzyme', 'arg-c');
            checkPtr2names("H3", "not  a peptide pointer");
            checkPtr2names("H9K4", "sequence does not exist");

            checkPtr2names("H3K5", "K not on position 5");
            checkPtr2names("H3K27", "peptide seq different for H3.3");
        });

        describe("sequence names concatenation", function() {
            var spp = new AASequencePeptidePtr();
            var check = function(input, expected) {
                it(input + ' -> ' + expected, function() {
                    expect(spp.concatenateNames(input.split(','))).toEqual(expected)
                })
            }
            describe('no reduction', function() {
                check('H3.1', 'H3.1');
                check('H3.1,H3.2', 'H3.1');//[1,2]');
                check('H4,H3.1,H3.2', 'H3.1');//[3.1,3.2,4]');
            });
            it('shorten name', function() {
                expect(spp.p_shortenName('H3.1')).toEqual('H3.1')
                expect(spp.p_shortenName('H3.')).toEqual('H3')
            });
            describe('reduction', function() {
                check('H3.1,H3.1T,H3.2,H3.3,H3.C', 'H3');
            });
        })
        describe("peptide seq 2 ptr", function() {
            var spp = new AASequencePeptidePtr();

            var check = function(input, expected) {
                it(input + ' -> ' + expected, function() {
                    expect(spp.concatenateNames(input.split(','))).toEqual(expected)
                })
            }
            check('H3.1', 'H3.1');
            check('H3.1,H3.2', 'H3.1');//[1,2]');
            check('H2A,H3.1,H3.2', 'H2A')//[2A,3.1,3.2]');
        })
    });
});
