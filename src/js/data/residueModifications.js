/*
 * a json port of Unimod + some custom modifs.
 * loaded by collections/dry/ResidueModificationDictionary
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define(function () {
    return [
        {
            "name": "PIC",
            "fullName": "PIC",
            "mass": 119.037114,
            formula: 'C7ONH5'
        },
        {
            "name": "PIC_HEAVY",
            "fullName": "PIC_HEAVY",
            "mass": 125.05724298,
            formula: 'C7ONH5'
        },
        {
            "name": "13C15N-A",
            "fullName": "13C15N-A",
            "mass": 4.0070994066,
        },
        {
            "name": "13C15N-C",
            "fullName": "13C15N-C",
            "mass": 4.0070994066,
        },
        {
            "name": "13C15N-D",
            "fullName": "13C15N-D",
            "mass": 5.0104542444,
        },
        {
            "name": "13C15N-E",
            "fullName": "13C15N-E",
            "mass": 6.0138090822,
        },
        {
            "name": "13C15N-F",
            "fullName": "13C15N-F",
            "mass": 10.0272284334,
        },
        {
            "name": "13C15N-",
            "fullName": "13C15N-",
            "mass": 3.0037445688,
        },
        {
            "name": "13C15N-H",
            "fullName": "13C15N-H",
            "mass": 9.0112337064
        },
        {
            "name": "13C15N-I",
            "fullName": "13C15N-I",
            "mass": 7.01716392
        },
        {
            "name": "13C15N-K",
            "fullName": "13C15N-K",
            "mass": 8.0141988132
        },
        {
            "name": "13C15N-L",
            "fullName": "13C15N-L",
            "mass": 7.01716392
        },
        {
            "name": "13C15N-M",
            "fullName": "13C15N-M",
            "mass": 6.0138090822
        },
        {
            "name": "13C15N-N",
            "fullName": "13C15N-N",
            "mass": 6.0074891376
        },
        {
            "name": "13C15N-P",
            "fullName": "13C15N-P",
            "mass": 6.0138090822
        },
        {
            "name": "13C15N-Q",
            "fullName": "13C15N-Q",
            "mass": 7.0108439754
        },
        {
            "name": "13C15N-R",
            "fullName": "13C15N-R",
            "mass": 10.0082685996
        },
        {
            "name": "13C15N-S",
            "fullName": "13C15N-S",
            "mass": 4.0070994066
        },
        {
            "name": "13C15N-T",
            "fullName": "13C15N-T",
            "mass": 5.0104542444
        },
        {
            "name": "13C15N-V",
            "fullName": "13C15N-V",
            "mass": 6.0138090822
        },
        {
            "name": "13C15N-W",
            "fullName": "13C15N-W",
            "mass": 13.0309730022
        },
        {
            "name": "13C15N-Y",
            "fullName": "13C15N-Y",
            "mass": 10.0272284334
        },
        {
            "name": "Acetyl",
            "fullName": "Acetylation",
            "mass": 42.010565
        },
        {
            "name": "Amidated",
            "fullName": "Amidation",
            "mass": -0.984016
        },
        {
            "name": "Biotin",
            "fullName": "Biotinylation",
            "mass": 226.077598
        },
        {
            "name": "Carbamidomethyl",
            "fullName": "Iodoacetamide derivative",
            "mass": 57.021464
        },
        {
            "name": "Carbamyl",
            "fullName": "Carbamylation",
            "mass": 43.005814
        },
        {
            "name": "Carboxymethyl",
            "fullName": "Iodoacetic acid derivative",
            "mass": 58.005479
        },
        {
            "name": "Deamidated",
            "fullName": "Deamidation",
            "mass": 0.984016
        },
        {
            "name": "Met->Hse",
            "fullName": "Homoserine",
            "mass": -29.992806
        },
        {
            "name": "Met->Hsl",
            "fullName": "Homoserine lactone",
            "mass": -48.003371
        },
        {
            "name": "NIPCAM",
            "fullName": "N-isopropylcarboxamidomethyl",
            "mass": 99.068414
        },
        {
            "name": "Phospho",
            "fullName": "Phosphorylation",
            "mass": 79.966331
        },
        {
            "name": "Dehydrated",
            "fullName": "Dehydration",
            "mass": -18.010565
        },
        {
            "name": "Propionamide",
            "fullName": "Acrylamide adduct",
            "mass": 71.037114
        },
        {
            "name": "Pyro-carbamidomethyl",
            "fullName": "S-carbamoylmethylcysteine cyclization (N-terminus)",
            "mass": 39.994915
        },
        {
            "name": "Glu->pyro-Glu",
            "fullName": "Pyro-glu from E",
            "mass": -18.010565
        },
        {
            "name": "Gln->pyro-Glu",
            "fullName": "Pyro-glu from Q",
            "mass": -17.026549
        },
        {
            "name": "Cation:Na",
            "fullName": "Sodium adduct",
            "mass": 21.981943
        },
        {
            "name": "Pyridylethyl",
            "fullName": "S-pyridylethylation",
            "mass": 105.057849
        },
        {
            "name": "Methyl",
            "fullName": "Methylation",
            "mass": 14.01565
        },
        {
            "name": "Oxidation",
            "fullName": "Oxidation or Hydroxylation",
            "mass": 15.994915
        },
        {
            "name": "Dimethyl",
            "fullName": "di-Methylation",
            "mass": 28.0313
        },
        {
            "name": "Trimethyl",
            "fullName": "tri-Methylation",
            "mass": 42.04695
        },
        {
            "name": "Methylthio",
            "fullName": "Beta-methylthiolation",
            "mass": 45.987721
        },
        {
            "name": "Sulfo",
            "fullName": "O-Sulfonation",
            "mass": 79.956815
        },
        {
            "name": "Hex",
            "fullName": "Hexose",
            "mass": 162.052823
        },
        {
            "name": "HexNAc",
            "fullName": "N-Acetylhexosamine",
            "mass": 203.079373
        },
        {
            "name": "Myristoyl",
            "fullName": "Myristoylation",
            "mass": 210.198366
        },
        {
            "name": "Guanidinyl",
            "fullName": "Guanidination",
            "mass": 42.021798
        },
        {
            "name": "Propionyl",
            "fullName": "Propionate labeling reagent light form (N-term & K)",
            "mass": 56.026215
        },
        {
            "name": "Pro->pyro-Glu",
            "fullName": "proline oxidation to pyroglutamic acid",
            "mass": 13.979265
        },
        {
            "name": "NHS-LC-Biotin",
            "fullName": "NHS-LC-Biotin",
            "mass": 339.161662
        },
        {
            "name": "ICAT-C",
            "fullName": "Applied Biosystems cleavable ICAT(TM) light",
            "mass": 227.126991
        },
        {
            "name": "ICAT-C:13C(9)",
            "fullName": "Applied Biosystems cleavable ICAT(TM) heavy",
            "mass": 236.157185
        },
        {
            "name": "Nethylmaleimide",
            "fullName": "N-ethylmaleimide on cysteines",
            "mass": 125.047679
        },
        {
            "name": "GlyGly",
            "fullName": "ubiquitinylation residue",
            "mass": 114.042927
        },
        {
            "name": "Formyl",
            "fullName": "Formylation",
            "mass": 27.994915
        },
        {
            "name": "Hex(1)HexNAc(1)NeuAc(2) (ST)",
            "fullName": "Hex1HexNAc1NeuAc2 (ST)",
            "mass": 947.323029
        },
        {
            "name": "Dimethyl:2H(6)13C(2)",
            "fullName": "dimethylated arginine",
            "mass": 36.07567
        },
        {
            "name": "Delta:H(4)C(2)O(-1)S(1)",
            "fullName": "S-Ethylcystine from Serine",
            "mass": 44.008456
        },
        {
            "name": "Label:13C(6)",
            "fullName": "13C(6) Silac label",
            "mass": 6.020129
        },
        {
            "name": "Label:18O(2)",
            "fullName": "O18 label at both C-terminal oxygens",
            "mass": 4.008491
        },
        {
            "name": "iTRAQ4plex",
            "fullName": "Representative mass and accurate mass for 116 & 117",
            "mass": 144.102063
        },
        {
            "name": "Label:18O(1)",
            "fullName": "O18 Labeling",
            "mass": 2.004246
        },
        {
            "name": "Label:13C(6)15N(2)",
            "fullName": "13C(6) 15N(2) Silac label",
            "mass": 8.014199
        },
        {
            "name": "Label:13C(6)15N(4)",
            "fullName": "13C(6) 15N(4) Silac label",
            "mass": 10.008269
        },
        {
            "name": "Label:13C(9)15N(1)",
            "fullName": "13C(9) 15N(1) Silac label",
            "mass": 10.027228
        },
        {
            "name": "Label:13C(5)15N(1)",
            "fullName": "13C(5) 15N(1) Silac label",
            "mass": 6.013809
        },
        {
            "name": "Nitrosyl",
            "fullName": "S-nitrosylation",
            "mass": 28.990164
        },
        {
            "name": "AEBS",
            "fullName": "Aminoethylbenzenesulfonylation",
            "mass": 183.035399
        },
        {
            "name": "Ethanolyl",
            "fullName": "Ethanolation of Cys",
            "mass": 44.026215
        },
        {
            "name": "Ethyl",
            "fullName": "Ethylation",
            "mass": 28.0313
        },
        {
            "name": "Carboxy",
            "fullName": "Carboxylation",
            "mass": 43.989829
        },
        {
            "name": "Nethylmaleimide+water",
            "fullName": "Nethylmaleimidehydrolysis",
            "mass": 143.058243
        },
        {
            "name": "ICPL:13C(6)",
            "fullName": "Bruker Daltonics SERVA-ICPL(TM) quantification chemistry, heavy form",
            "mass": 111.041593
        },
        {
            "name": "ICPL",
            "fullName": "Bruker Daltonics SERVA-ICPL(TM) quantification chemistry, light form",
            "mass": 105.021464
        },
        {
            "name": "Dehydro",
            "fullName": "Half of a disulfide bridge",
            "mass": -1.007825
        },
        {
            "name": "Hypusine",
            "fullName": "hypusine",
            "mass": 87.068414
        },
        {
            "name": "Ammonia-loss",
            "fullName": "Loss of ammonia",
            "mass": -17.026549
        },
        {
            "name": "Glucosylgalactosyl",
            "fullName": "glucosylgalactosyl hydroxylysine",
            "mass": 340.100562
        },
        {
            "name": "Dioxidation",
            "fullName": "dihydroxy",
            "mass": 31.989829
        },
        {
            "name": "HexN",
            "fullName": "Hexosamine",
            "mass": 161.068808
        },
        {
            "name": "Label:2H(4)",
            "fullName": "4,4,5,5-D4 Lysine",
            "mass": 4.025107
        },
        {
            "name": "Dimethyl:2H(4)13C(2)",
            "fullName": "DiMethyl-C13HD2",
            "mass": 34.063117
        },
        {
            "name": "Maleimide-PEO2-Biotin",
            "fullName": "Maleimide-PEO2-Biotin",
            "mass": 525.225719
        },
        {
            "name": "Ala->Ser",
            "fullName": "Ala->Ser substitution",
            "mass": 15.994915
        },
        {
            "name": "Thr->Ile",
            "fullName": "Thr->Ile substitution",
            "mass": 12.036386
        },
        {
            "name": "ICPL:2H(4)",
            "fullName": "Bruker Daltonics SERVA-ICPL(TM) quantification chemistry, medium form",
            "mass": 109.046571
        },
        {
            "name": "iTRAQ8plex",
            "fullName": "Representative mass and accurate mass for 113, 114, 116 & 117",
            "mass": 304.20536
        },
        {
            "name": "Label:13C(6)15N(1)",
            "fullName": "13C(6) 15N(1) Silac label",
            "mass": 7.017164
        },
        {
            "name": "TMT6plex",
            "fullName": "",
            "mass": 229.162932
        },
        {
            "name": "TMT2plex",
            "fullName": "TMT2plex by Thermo",
            "mass": 225.155833
        },
        {
            "name": "TMT",
            "fullName": "",
            "mass": 224.152478
        },
        {
            "name": "ExacTagThiol",
            "fullName": "ExacTag Thiol label mass for 2-4-7-10 plex",
            "mass": 972.365219
        },
        {
            "name": "ExacTagAmine",
            "fullName": "ExacTag Amine label mass for 2-4-7-10 plex",
            "mass": 1030.35294
        },
        {
            "name": "ArgGlyGly",
            "fullName": "Ubiquitination RGG",
            "mass": 270.144039
        },
        {
            "name": "Sulfo-NHS-SS-Biotin",
            "fullName": "EZ-Link Sulfo-NHS-SS-Biotin (Pierce)",
            "mass": 389.090154
        },
        {
            "name": "BPA",
            "fullName": "Benzoyal Phenylalanine",
            "mass": 268.097368
        },
        {
            "name": "BPA_AILV",
            "fullName": "Benzoyal Phenylalanine AILV",
            "mass": 268.097368
        },
        {
            "name": "BPA_STDN",
            "fullName": "Benzoyal Phenylalanine STDN",
            "mass": 268.097368
        },
        {
            "name": "BPA_PWYF",
            "fullName": "Benzoyal Phenylalanine PWYF",
            "mass": 268.097368
        },
        {
            "name": "BPA_RECQ",
            "fullName": "Benzoyal Phenylalanine RECQ",
            "mass": 268.097368
        },
        {
            "name": "BPA_GHKM",
            "fullName": "Benzoyal Phenylalanine GHKM",
            "mass": 268.097368
        },
        {
            "name": "SMCC linker",
            "fullName": "Succinimidyl-4-(N-maleimidomethyl)cyclohexane-1-carboxylate",
            "mass": 219.089543
        },
        {
            "name": "CHD",
            "fullName": "1,2-Cyclohexanedione arginine",
            "mass": 112.05243
        },
        {
            "name": "BD",
            "fullName": "1,2-Butanedione arginine",
            "mass": 86.036779
        },
        {
            "name": "HA-Ubiquitin Vinyl Sulfone",
            "fullName": "HA-Ubiquitin Vinyl Sulfone",
            "mass": 120.011924
        },
        {
            "name": "HA-Gly-Ubiquitin Vinyl Sulfone",
            "fullName": "HA-Glycyl-Ubiquitin Vinyl Sulfone",
            "mass": 177.033388
        },
        {
            "name": "Carbamidomethyl-Deuterated",
            "fullName": "Deuterated Iodoacetamide Derivative",
            "mass": 59.034017
        },
        {
            "name": "RGGUbiq",
            "fullName": "Ubiquitination RGG - ArgGlyGly",
            "mass": 270.144039
        },
        {
            "name": "iodoacetanilide",
            "fullName": "iodoacetanilide",
            "mass": 139.072893
        },
        {
            "name": "propylmercapto",
            "fullName": "propylmercapto / propanethiol",
            "mass": 58.024106
        },
        {
            "name": "GlyGly 13C(6) 15N(2) Lys",
            "fullName": "Double modification of Ubiquitin and Lys+8.02",
            "mass": 122.057126
        },
        {
            "name": "REPLi-DNP",
            "fullName": "DNP Fret modification for REPLi project",
            "mass": 252.049469
        },
        {
            "name": "REPLi-MCA-H",
            "fullName": "REPLi-MCA C12H8O4",
            "mass": 216.042259
        },
        {
            "name": "QQQTGG",
            "fullName": "SUMO Lys-QQQTGG",
            "mass": 599.266339
        },
        {
            "name": "ICPL:13C(6)2H(4)",
            "fullName": "Bruker Daltonics SERVA-ICPL(TM) quantification chemistry, heavy form, +10  yuk3 1-31-2011",
            "mass": 115.0667
        },
        {
            "name": "mTRAQ d0",
            "fullName": "mTRAQ ragent by AB SCIEX, delta 0 form",
            "mass": 140.094963
        },
        {
            "name": "mTRAQ d4",
            "fullName": "mTRAQ ragent by AB SCIEX, delta +4 form",
            "mass": 144.102063
        },
        {
            "name": "mTRAQ d8",
            "fullName": "mTRAQ ragent by AB SCIEX, delta +8 form",
            "mass": 148.109162
        },
        {
            "name": "Hex(1)HexNAc(1) (ST)",
            "fullName": "Hex1HexNAc1 (ST)",
            "mass": 365.132196
        },
        {
            "name": "Hex(1)HexNAc(1)NeuAc(1) (ST)",
            "fullName": "Hex1HexNAc1NeuAc1 (ST)",
            "mass": 656.227613
        },
        {
            "name": "TMT-LysGlyGly",
            "fullName": "TMT with Ubiquitin (GlyGly) modification on same residue",
            "mass": 338.195405
        },
        {
            "name": "TMT6-LysGlyGly",
            "fullName": "TMT 6plex with Ubiquitin Modification",
            "mass": 343.20586
        },
        {
            "name": "Crotonylation",
            "fullName": "Crotonylation",
            "mass": 68.026215
        },
        {
            "name": "LRLRGG-K",
            "fullName": "LeuArgLeuArgGlyGly-Lys",
            "mass": 652.413278
        },
        {
            "name": "RLRGG-K",
            "fullName": "ArgLeuArgGlyGly-Lys",
            "mass": 539.329214
        },
        {
            "name": "LRGG-K",
            "fullName": "LRGG modification on Lys",
            "mass": 383.228103
        },
        {
            "name": "AQUA_V",
            "fullName": "aqua-V",
            "mass": 6.013809,
        },
        {
            "name": "AQUA_P",
            "fullName": "isotopically modified residues Pro",
            "mass": 6.013809
        },
        {
            "name": "AQUA_PV",
            "fullName": "isotopically modified residues Pro and Val",
            "mass": 6.013809
        },
        {
            "name": "AQUA_L",
            "fullName": "isotopically modified residue Leu",
            "mass": 7.017164
        },
        {
            "name": "AQUA_I",
            "fullName": "isotopically modified residue Isoleucine",
            "mass": 7.017164
        },
        {
            "name": "AQUA_T",
            "fullName": "isotopically modified residue Thr",
            "mass": 5.01045
        },
        {
            "name": "AQUA_G",
            "fullName": "isotopically modified residue Gly",
            "mass": 3.003745
        },
        {
            "name": "AQUA_F",
            "fullName": "isotopically modified residue F",
            "mass": 10.028
        },
        {
            "name": "AQUA_A",
            "fullName": "isotopically modified residue Ala",
            "mass": 4.007099
        },
        {
            "name": "AQUA_Yphos",
            "fullName": "isotopically modified residue phosphorylated Tyr",
            "mass": 89.993559
        },
        {
            "name": "AQUA_Y",
            "fullName": "isotopically modified residue Tyr",
            "mass": 10.027228
        },
        {
            "name": "Acetyl_heavy_Lys",
            "fullName": "Acetyl_heavy_Lys",
            "mass": 50.024764
        },
        {
            "name": "QEQTGG",
            "fullName": "SUMO Lys-QEQTGG",
            "mass": 600.250354
        },
        {
            "name": "MonoMethylPropionyl",
            "fullName": "MonoMethylPropionylLysine",
            "mass": 70.041865
        },
        {
            "name": "Propionyl:2H(5)",
            "fullName": "Propionate labeling reagent pentadeuterated form (+5amu), N-term & K",
            "mass": 61.057598
        },
        {
            "name": "GlyGlyCarbamyl",
            "fullName": "Carbamylated Diglycine",
            "mass": 157.048741
        },
        {
            "name": "AQUA_D",
            "fullName": "isotopically modified residue Asp",
            "mass": 5.010454
        },
        {
            "name": "A>R",
            "fullName": "Ala>Arg",
            "mass": 85.063997
        },
        {
            "name": "A>N",
            "fullName": "Ala>Asn",
            "mass": 43.005813
        },
        {
            "name": "A>D",
            "fullName": "Ala>Asp",
            "mass": 43.989829
        },
        {
            "name": "A>C",
            "fullName": "Ala>Cys",
            "mass": 31.972071
        },
        {
            "name": "A>E",
            "fullName": "Ala>Glu",
            "mass": 58.00547900000001
        },
        {
            "name": "A>Q",
            "fullName": "Ala>Gln",
            "mass": 57.02146400000001
        },
        {
            "name": "A>G",
            "fullName": "Ala>Gly",
            "mass": -14.01565
        },
        {
            "name": "A>H",
            "fullName": "Ala>His",
            "mass": 66.02179799999999
        },
        {
            "name": "A>I",
            "fullName": "Ala>Ile",
            "mass": 42.046949999999995
        },
        {
            "name": "A>L",
            "fullName": "Ala>Leu",
            "mass": 42.046949999999995
        },
        {
            "name": "A>K",
            "fullName": "Ala>Lys",
            "mass": 57.057849000000004
        },
        {
            "name": "A>M",
            "fullName": "Ala>Met",
            "mass": 60.00337099999999
        },
        {
            "name": "A>F",
            "fullName": "Ala>Phe",
            "mass": 76.03129999999999
        },
        {
            "name": "A>P",
            "fullName": "Ala>Pro",
            "mass": 26.015649999999994
        },
        {
            "name": "A>S",
            "fullName": "Ala>Ser",
            "mass": 15.994913999999994
        },
        {
            "name": "A>T",
            "fullName": "Ala>Thr",
            "mass": 30.010565
        },
        {
            "name": "A>W",
            "fullName": "Ala>Trp",
            "mass": 115.04219900000001
        },
        {
            "name": "A>Y",
            "fullName": "Ala>Tyr",
            "mass": 92.026206
        },
        {
            "name": "A>V",
            "fullName": "Ala>Val",
            "mass": 28.0313
        },
        {
            "name": "R>A",
            "fullName": "Arg>Ala",
            "mass": -85.063997
        },
        {
            "name": "R>N",
            "fullName": "Arg>Asn",
            "mass": -42.058184
        },
        {
            "name": "R>D",
            "fullName": "Arg>Asp",
            "mass": -41.074168
        },
        {
            "name": "R>C",
            "fullName": "Arg>Cys",
            "mass": -53.091926
        },
        {
            "name": "R>E",
            "fullName": "Arg>Glu",
            "mass": -27.058517999999992
        },
        {
            "name": "R>Q",
            "fullName": "Arg>Gln",
            "mass": -28.04253299999999
        },
        {
            "name": "R>G",
            "fullName": "Arg>Gly",
            "mass": -99.079647
        },
        {
            "name": "R>H",
            "fullName": "Arg>His",
            "mass": -19.04219900000001
        },
        {
            "name": "R>I",
            "fullName": "Arg>Ile",
            "mass": -43.017047000000005
        },
        {
            "name": "R>L",
            "fullName": "Arg>Leu",
            "mass": -43.017047000000005
        },
        {
            "name": "R>K",
            "fullName": "Arg>Lys",
            "mass": -28.006147999999996
        },
        {
            "name": "R>M",
            "fullName": "Arg>Met",
            "mass": -25.060626000000013
        },
        {
            "name": "R>F",
            "fullName": "Arg>Phe",
            "mass": -9.032697000000013
        },
        {
            "name": "R>P",
            "fullName": "Arg>Pro",
            "mass": -59.04834700000001
        },
        {
            "name": "R>S",
            "fullName": "Arg>Ser",
            "mass": -69.069083
        },
        {
            "name": "R>T",
            "fullName": "Arg>Thr",
            "mass": -55.053432
        },
        {
            "name": "R>W",
            "fullName": "Arg>Trp",
            "mass": 29.97820200000001
        },
        {
            "name": "R>Y",
            "fullName": "Arg>Tyr",
            "mass": 6.962209000000001
        },
        {
            "name": "R>V",
            "fullName": "Arg>Val",
            "mass": -57.032697
        },
        {
            "name": "N>A",
            "fullName": "Asn>Ala",
            "mass": -43.005813
        },
        {
            "name": "N>R",
            "fullName": "Asn>Arg",
            "mass": 42.058184
        },
        {
            "name": "N>D",
            "fullName": "Asn>Asp",
            "mass": 0.9840159999999969
        },
        {
            "name": "N>C",
            "fullName": "Asn>Cys",
            "mass": -11.033742000000004
        },
        {
            "name": "N>E",
            "fullName": "Asn>Glu",
            "mass": 14.999666000000005
        },
        {
            "name": "N>Q",
            "fullName": "Asn>Gln",
            "mass": 14.015651000000005
        },
        {
            "name": "N>G",
            "fullName": "Asn>Gly",
            "mass": -57.021463000000004
        },
        {
            "name": "N>H",
            "fullName": "Asn>His",
            "mass": 23.015984999999986
        },
        {
            "name": "N>I",
            "fullName": "Asn>Ile",
            "mass": -0.958863000000008
        },
        {
            "name": "N>L",
            "fullName": "Asn>Leu",
            "mass": -0.958863000000008
        },
        {
            "name": "N>K",
            "fullName": "Asn>Lys",
            "mass": 14.052036000000001
        },
        {
            "name": "N>M",
            "fullName": "Asn>Met",
            "mass": 16.997557999999984
        },
        {
            "name": "N>F",
            "fullName": "Asn>Phe",
            "mass": 33.025486999999984
        },
        {
            "name": "N>P",
            "fullName": "Asn>Pro",
            "mass": -16.99016300000001
        },
        {
            "name": "N>S",
            "fullName": "Asn>Ser",
            "mass": -27.01089900000001
        },
        {
            "name": "N>T",
            "fullName": "Asn>Thr",
            "mass": -12.995248000000004
        },
        {
            "name": "N>W",
            "fullName": "Asn>Trp",
            "mass": 72.03638600000001
        },
        {
            "name": "N>Y",
            "fullName": "Asn>Tyr",
            "mass": 49.020393
        },
        {
            "name": "N>V",
            "fullName": "Asn>Val",
            "mass": -14.974513000000002
        },
        {
            "name": "D>A",
            "fullName": "Asp>Ala",
            "mass": -43.989829
        },
        {
            "name": "D>R",
            "fullName": "Asp>Arg",
            "mass": 41.074168
        },
        {
            "name": "D>N",
            "fullName": "Asp>Asn",
            "mass": -0.9840159999999969
        },
        {
            "name": "D>C",
            "fullName": "Asp>Cys",
            "mass": -12.017758
        },
        {
            "name": "D>E",
            "fullName": "Asp>Glu",
            "mass": 14.015650000000008
        },
        {
            "name": "D>Q",
            "fullName": "Asp>Gln",
            "mass": 13.031635000000009
        },
        {
            "name": "D>G",
            "fullName": "Asp>Gly",
            "mass": -58.005479
        },
        {
            "name": "D>H",
            "fullName": "Asp>His",
            "mass": 22.03196899999999
        },
        {
            "name": "D>I",
            "fullName": "Asp>Ile",
            "mass": -1.942879000000005
        },
        {
            "name": "D>L",
            "fullName": "Asp>Leu",
            "mass": -1.942879000000005
        },
        {
            "name": "D>K",
            "fullName": "Asp>Lys",
            "mass": 13.068020000000004
        },
        {
            "name": "D>M",
            "fullName": "Asp>Met",
            "mass": 16.013541999999987
        },
        {
            "name": "D>F",
            "fullName": "Asp>Phe",
            "mass": 32.04147099999999
        },
        {
            "name": "D>P",
            "fullName": "Asp>Pro",
            "mass": -17.974179000000007
        },
        {
            "name": "D>S",
            "fullName": "Asp>Ser",
            "mass": -27.994915000000006
        },
        {
            "name": "D>T",
            "fullName": "Asp>Thr",
            "mass": -13.979264
        },
        {
            "name": "D>W",
            "fullName": "Asp>Trp",
            "mass": 71.05237000000001
        },
        {
            "name": "D>Y",
            "fullName": "Asp>Tyr",
            "mass": 48.036377
        },
        {
            "name": "D>V",
            "fullName": "Asp>Val",
            "mass": -15.958528999999999
        },
        {
            "name": "C>A",
            "fullName": "Cys>Ala",
            "mass": -31.972071
        },
        {
            "name": "C>R",
            "fullName": "Cys>Arg",
            "mass": 53.091926
        },
        {
            "name": "C>N",
            "fullName": "Cys>Asn",
            "mass": 11.033742000000004
        },
        {
            "name": "C>D",
            "fullName": "Cys>Asp",
            "mass": 12.017758
        },
        {
            "name": "C>E",
            "fullName": "Cys>Glu",
            "mass": 26.03340800000001
        },
        {
            "name": "C>Q",
            "fullName": "Cys>Gln",
            "mass": 25.04939300000001
        },
        {
            "name": "C>G",
            "fullName": "Cys>Gly",
            "mass": -45.987721
        },
        {
            "name": "C>H",
            "fullName": "Cys>His",
            "mass": 34.04972699999999
        },
        {
            "name": "C>I",
            "fullName": "Cys>Ile",
            "mass": 10.074878999999996
        },
        {
            "name": "C>L",
            "fullName": "Cys>Leu",
            "mass": 10.074878999999996
        },
        {
            "name": "C>K",
            "fullName": "Cys>Lys",
            "mass": 25.085778000000005
        },
        {
            "name": "C>M",
            "fullName": "Cys>Met",
            "mass": 28.031299999999987
        },
        {
            "name": "C>F",
            "fullName": "Cys>Phe",
            "mass": 44.05922899999999
        },
        {
            "name": "C>P",
            "fullName": "Cys>Pro",
            "mass": -5.956421000000006
        },
        {
            "name": "C>S",
            "fullName": "Cys>Ser",
            "mass": -15.977157000000005
        },
        {
            "name": "C>T",
            "fullName": "Cys>Thr",
            "mass": -1.961506
        },
        {
            "name": "C>W",
            "fullName": "Cys>Trp",
            "mass": 83.07012800000001
        },
        {
            "name": "C>Y",
            "fullName": "Cys>Tyr",
            "mass": 60.054135
        },
        {
            "name": "C>V",
            "fullName": "Cys>Val",
            "mass": -3.940770999999998
        },
        {
            "name": "E>A",
            "fullName": "Glu>Ala",
            "mass": -58.00547900000001
        },
        {
            "name": "E>R",
            "fullName": "Glu>Arg",
            "mass": 27.058517999999992
        },
        {
            "name": "E>N",
            "fullName": "Glu>Asn",
            "mass": -14.999666000000005
        },
        {
            "name": "E>D",
            "fullName": "Glu>Asp",
            "mass": -14.015650000000008
        },
        {
            "name": "E>C",
            "fullName": "Glu>Cys",
            "mass": -26.03340800000001
        },
        {
            "name": "E>Q",
            "fullName": "Glu>Gln",
            "mass": -0.9840149999999994
        },
        {
            "name": "E>G",
            "fullName": "Glu>Gly",
            "mass": -72.021129
        },
        {
            "name": "E>H",
            "fullName": "Glu>His",
            "mass": 8.016318999999982
        },
        {
            "name": "E>I",
            "fullName": "Glu>Ile",
            "mass": -15.958529000000013
        },
        {
            "name": "E>L",
            "fullName": "Glu>Leu",
            "mass": -15.958529000000013
        },
        {
            "name": "E>K",
            "fullName": "Glu>Lys",
            "mass": -0.9476300000000037
        },
        {
            "name": "E>M",
            "fullName": "Glu>Met",
            "mass": 1.997891999999979
        },
        {
            "name": "E>F",
            "fullName": "Glu>Phe",
            "mass": 18.02582099999998
        },
        {
            "name": "E>P",
            "fullName": "Glu>Pro",
            "mass": -31.989829000000015
        },
        {
            "name": "E>S",
            "fullName": "Glu>Ser",
            "mass": -42.010565000000014
        },
        {
            "name": "E>T",
            "fullName": "Glu>Thr",
            "mass": -27.99491400000001
        },
        {
            "name": "E>W",
            "fullName": "Glu>Trp",
            "mass": 57.03672
        },
        {
            "name": "E>Y",
            "fullName": "Glu>Tyr",
            "mass": 34.020726999999994
        },
        {
            "name": "E>V",
            "fullName": "Glu>Val",
            "mass": -29.974179000000007
        },
        {
            "name": "Q>A",
            "fullName": "Gln>Ala",
            "mass": -57.02146400000001
        },
        {
            "name": "Q>R",
            "fullName": "Gln>Arg",
            "mass": 28.04253299999999
        },
        {
            "name": "Q>N",
            "fullName": "Gln>Asn",
            "mass": -14.015651000000005
        },
        {
            "name": "Q>D",
            "fullName": "Gln>Asp",
            "mass": -13.031635000000009
        },
        {
            "name": "Q>C",
            "fullName": "Gln>Cys",
            "mass": -25.04939300000001
        },
        {
            "name": "Q>E",
            "fullName": "Gln>Glu",
            "mass": 0.9840149999999994
        },
        {
            "name": "Q>G",
            "fullName": "Gln>Gly",
            "mass": -71.037114
        },
        {
            "name": "Q>H",
            "fullName": "Gln>His",
            "mass": 9.000333999999981
        },
        {
            "name": "Q>I",
            "fullName": "Gln>Ile",
            "mass": -14.974514000000013
        },
        {
            "name": "Q>L",
            "fullName": "Gln>Leu",
            "mass": -14.974514000000013
        },
        {
            "name": "Q>K",
            "fullName": "Gln>Lys",
            "mass": 0.03638499999999567
        },
        {
            "name": "Q>M",
            "fullName": "Gln>Met",
            "mass": 2.9819069999999783
        },
        {
            "name": "Q>F",
            "fullName": "Gln>Phe",
            "mass": 19.00983599999998
        },
        {
            "name": "Q>P",
            "fullName": "Gln>Pro",
            "mass": -31.005814000000015
        },
        {
            "name": "Q>S",
            "fullName": "Gln>Ser",
            "mass": -41.026550000000015
        },
        {
            "name": "Q>T",
            "fullName": "Gln>Thr",
            "mass": -27.01089900000001
        },
        {
            "name": "Q>W",
            "fullName": "Gln>Trp",
            "mass": 58.020735
        },
        {
            "name": "Q>Y",
            "fullName": "Gln>Tyr",
            "mass": 35.00474199999999
        },
        {
            "name": "Q>V",
            "fullName": "Gln>Val",
            "mass": -28.990164000000007
        },
        {
            "name": "G>A",
            "fullName": "Gly>Ala",
            "mass": 14.01565
        },
        {
            "name": "G>R",
            "fullName": "Gly>Arg",
            "mass": 99.079647
        },
        {
            "name": "G>N",
            "fullName": "Gly>Asn",
            "mass": 57.021463000000004
        },
        {
            "name": "G>D",
            "fullName": "Gly>Asp",
            "mass": 58.005479
        },
        {
            "name": "G>C",
            "fullName": "Gly>Cys",
            "mass": 45.987721
        },
        {
            "name": "G>E",
            "fullName": "Gly>Glu",
            "mass": 72.021129
        },
        {
            "name": "G>Q",
            "fullName": "Gly>Gln",
            "mass": 71.037114
        },
        {
            "name": "G>H",
            "fullName": "Gly>His",
            "mass": 80.03744799999998
        },
        {
            "name": "G>I",
            "fullName": "Gly>Ile",
            "mass": 56.062599999999996
        },
        {
            "name": "G>L",
            "fullName": "Gly>Leu",
            "mass": 56.062599999999996
        },
        {
            "name": "G>K",
            "fullName": "Gly>Lys",
            "mass": 71.073499
        },
        {
            "name": "G>M",
            "fullName": "Gly>Met",
            "mass": 74.01902099999998
        },
        {
            "name": "G>F",
            "fullName": "Gly>Phe",
            "mass": 90.04694999999998
        },
        {
            "name": "G>P",
            "fullName": "Gly>Pro",
            "mass": 40.031299999999995
        },
        {
            "name": "G>S",
            "fullName": "Gly>Ser",
            "mass": 30.010563999999995
        },
        {
            "name": "G>T",
            "fullName": "Gly>Thr",
            "mass": 44.026215
        },
        {
            "name": "G>W",
            "fullName": "Gly>Trp",
            "mass": 129.057849
        },
        {
            "name": "G>Y",
            "fullName": "Gly>Tyr",
            "mass": 106.041856
        },
        {
            "name": "G>V",
            "fullName": "Gly>Val",
            "mass": 42.04695
        },
        {
            "name": "H>A",
            "fullName": "His>Ala",
            "mass": -66.02179799999999
        },
        {
            "name": "H>R",
            "fullName": "His>Arg",
            "mass": 19.04219900000001
        },
        {
            "name": "H>N",
            "fullName": "His>Asn",
            "mass": -23.015984999999986
        },
        {
            "name": "H>D",
            "fullName": "His>Asp",
            "mass": -22.03196899999999
        },
        {
            "name": "H>C",
            "fullName": "His>Cys",
            "mass": -34.04972699999999
        },
        {
            "name": "H>E",
            "fullName": "His>Glu",
            "mass": -8.016318999999982
        },
        {
            "name": "H>Q",
            "fullName": "His>Gln",
            "mass": -9.000333999999981
        },
        {
            "name": "H>G",
            "fullName": "His>Gly",
            "mass": -80.03744799999998
        },
        {
            "name": "H>I",
            "fullName": "His>Ile",
            "mass": -23.974847999999994
        },
        {
            "name": "H>L",
            "fullName": "His>Leu",
            "mass": -23.974847999999994
        },
        {
            "name": "H>K",
            "fullName": "His>Lys",
            "mass": -8.963948999999985
        },
        {
            "name": "H>M",
            "fullName": "His>Met",
            "mass": -6.018427000000003
        },
        {
            "name": "H>F",
            "fullName": "His>Phe",
            "mass": 10.009501999999998
        },
        {
            "name": "H>P",
            "fullName": "His>Pro",
            "mass": -40.006147999999996
        },
        {
            "name": "H>S",
            "fullName": "His>Ser",
            "mass": -50.026883999999995
        },
        {
            "name": "H>T",
            "fullName": "His>Thr",
            "mass": -36.01123299999999
        },
        {
            "name": "H>W",
            "fullName": "His>Trp",
            "mass": 49.02040100000002
        },
        {
            "name": "H>Y",
            "fullName": "His>Tyr",
            "mass": 26.004408000000012
        },
        {
            "name": "H>V",
            "fullName": "His>Val",
            "mass": -37.99049799999999
        },
        {
            "name": "I>A",
            "fullName": "Ile>Ala",
            "mass": -42.046949999999995
        },
        {
            "name": "I>R",
            "fullName": "Ile>Arg",
            "mass": 43.017047000000005
        },
        {
            "name": "I>N",
            "fullName": "Ile>Asn",
            "mass": 0.958863000000008
        },
        {
            "name": "I>D",
            "fullName": "Ile>Asp",
            "mass": 1.942879000000005
        },
        {
            "name": "I>C",
            "fullName": "Ile>Cys",
            "mass": -10.074878999999996
        },
        {
            "name": "I>E",
            "fullName": "Ile>Glu",
            "mass": 15.958529000000013
        },
        {
            "name": "I>Q",
            "fullName": "Ile>Gln",
            "mass": 14.974514000000013
        },
        {
            "name": "I>G",
            "fullName": "Ile>Gly",
            "mass": -56.062599999999996
        },
        {
            "name": "I>H",
            "fullName": "Ile>His",
            "mass": 23.974847999999994
        },
        {
            "name": "I>L",
            "fullName": "Ile>Leu",
            "mass": 0
        },
        {
            "name": "I>K",
            "fullName": "Ile>Lys",
            "mass": 15.010899000000009
        },
        {
            "name": "I>M",
            "fullName": "Ile>Met",
            "mass": 17.95642099999999
        },
        {
            "name": "I>F",
            "fullName": "Ile>Phe",
            "mass": 33.98434999999999
        },
        {
            "name": "I>P",
            "fullName": "Ile>Pro",
            "mass": -16.0313
        },
        {
            "name": "I>S",
            "fullName": "Ile>Ser",
            "mass": -26.052036
        },
        {
            "name": "I>T",
            "fullName": "Ile>Thr",
            "mass": -12.036384999999996
        },
        {
            "name": "I>W",
            "fullName": "Ile>Trp",
            "mass": 72.99524900000002
        },
        {
            "name": "I>Y",
            "fullName": "Ile>Tyr",
            "mass": 49.97925600000001
        },
        {
            "name": "I>V",
            "fullName": "Ile>Val",
            "mass": -14.015649999999994
        },
        {
            "name": "L>A",
            "fullName": "Leu>Ala",
            "mass": -42.046949999999995
        },
        {
            "name": "L>R",
            "fullName": "Leu>Arg",
            "mass": 43.017047000000005
        },
        {
            "name": "L>N",
            "fullName": "Leu>Asn",
            "mass": 0.958863000000008
        },
        {
            "name": "L>D",
            "fullName": "Leu>Asp",
            "mass": 1.942879000000005
        },
        {
            "name": "L>C",
            "fullName": "Leu>Cys",
            "mass": -10.074878999999996
        },
        {
            "name": "L>E",
            "fullName": "Leu>Glu",
            "mass": 15.958529000000013
        },
        {
            "name": "L>Q",
            "fullName": "Leu>Gln",
            "mass": 14.974514000000013
        },
        {
            "name": "L>G",
            "fullName": "Leu>Gly",
            "mass": -56.062599999999996
        },
        {
            "name": "L>H",
            "fullName": "Leu>His",
            "mass": 23.974847999999994
        },
        {
            "name": "L>I",
            "fullName": "Leu>Ile",
            "mass": 0
        },
        {
            "name": "L>K",
            "fullName": "Leu>Lys",
            "mass": 15.010899000000009
        },
        {
            "name": "L>M",
            "fullName": "Leu>Met",
            "mass": 17.95642099999999
        },
        {
            "name": "L>F",
            "fullName": "Leu>Phe",
            "mass": 33.98434999999999
        },
        {
            "name": "L>P",
            "fullName": "Leu>Pro",
            "mass": -16.0313
        },
        {
            "name": "L>S",
            "fullName": "Leu>Ser",
            "mass": -26.052036
        },
        {
            "name": "L>T",
            "fullName": "Leu>Thr",
            "mass": -12.036384999999996
        },
        {
            "name": "L>W",
            "fullName": "Leu>Trp",
            "mass": 72.99524900000002
        },
        {
            "name": "L>Y",
            "fullName": "Leu>Tyr",
            "mass": 49.97925600000001
        },
        {
            "name": "L>V",
            "fullName": "Leu>Val",
            "mass": -14.015649999999994
        },
        {
            "name": "K>A",
            "fullName": "Lys>Ala",
            "mass": -57.057849000000004
        },
        {
            "name": "K>R",
            "fullName": "Lys>Arg",
            "mass": 28.006147999999996
        },
        {
            "name": "K>N",
            "fullName": "Lys>Asn",
            "mass": -14.052036000000001
        },
        {
            "name": "K>D",
            "fullName": "Lys>Asp",
            "mass": -13.068020000000004
        },
        {
            "name": "K>C",
            "fullName": "Lys>Cys",
            "mass": -25.085778000000005
        },
        {
            "name": "K>E",
            "fullName": "Lys>Glu",
            "mass": 0.9476300000000037
        },
        {
            "name": "K>Q",
            "fullName": "Lys>Gln",
            "mass": -0.03638499999999567
        },
        {
            "name": "K>G",
            "fullName": "Lys>Gly",
            "mass": -71.073499
        },
        {
            "name": "K>H",
            "fullName": "Lys>His",
            "mass": 8.963948999999985
        },
        {
            "name": "K>I",
            "fullName": "Lys>Ile",
            "mass": -15.010899000000009
        },
        {
            "name": "K>L",
            "fullName": "Lys>Leu",
            "mass": -15.010899000000009
        },
        {
            "name": "K>M",
            "fullName": "Lys>Met",
            "mass": 2.9455219999999827
        },
        {
            "name": "K>F",
            "fullName": "Lys>Phe",
            "mass": 18.973450999999983
        },
        {
            "name": "K>P",
            "fullName": "Lys>Pro",
            "mass": -31.04219900000001
        },
        {
            "name": "K>S",
            "fullName": "Lys>Ser",
            "mass": -41.06293500000001
        },
        {
            "name": "K>T",
            "fullName": "Lys>Thr",
            "mass": -27.047284000000005
        },
        {
            "name": "K>W",
            "fullName": "Lys>Trp",
            "mass": 57.984350000000006
        },
        {
            "name": "K>Y",
            "fullName": "Lys>Tyr",
            "mass": 34.968357
        },
        {
            "name": "K>V",
            "fullName": "Lys>Val",
            "mass": -29.026549000000003
        },
        {
            "name": "M>A",
            "fullName": "Met>Ala",
            "mass": -60.00337099999999
        },
        {
            "name": "M>R",
            "fullName": "Met>Arg",
            "mass": 25.060626000000013
        },
        {
            "name": "M>N",
            "fullName": "Met>Asn",
            "mass": -16.997557999999984
        },
        {
            "name": "M>D",
            "fullName": "Met>Asp",
            "mass": -16.013541999999987
        },
        {
            "name": "M>C",
            "fullName": "Met>Cys",
            "mass": -28.031299999999987
        },
        {
            "name": "M>E",
            "fullName": "Met>Glu",
            "mass": -1.997891999999979
        },
        {
            "name": "M>Q",
            "fullName": "Met>Gln",
            "mass": -2.9819069999999783
        },
        {
            "name": "M>G",
            "fullName": "Met>Gly",
            "mass": -74.01902099999998
        },
        {
            "name": "M>H",
            "fullName": "Met>His",
            "mass": 6.018427000000003
        },
        {
            "name": "M>I",
            "fullName": "Met>Ile",
            "mass": -17.95642099999999
        },
        {
            "name": "M>L",
            "fullName": "Met>Leu",
            "mass": -17.95642099999999
        },
        {
            "name": "M>K",
            "fullName": "Met>Lys",
            "mass": -2.9455219999999827
        },
        {
            "name": "M>F",
            "fullName": "Met>Phe",
            "mass": 16.027929
        },
        {
            "name": "M>P",
            "fullName": "Met>Pro",
            "mass": -33.98772099999999
        },
        {
            "name": "M>S",
            "fullName": "Met>Ser",
            "mass": -44.00845699999999
        },
        {
            "name": "M>T",
            "fullName": "Met>Thr",
            "mass": -29.992805999999987
        },
        {
            "name": "M>W",
            "fullName": "Met>Trp",
            "mass": 55.038828000000024
        },
        {
            "name": "M>Y",
            "fullName": "Met>Tyr",
            "mass": 32.022835000000015
        },
        {
            "name": "M>V",
            "fullName": "Met>Val",
            "mass": -31.972070999999985
        },
        {
            "name": "F>A",
            "fullName": "Phe>Ala",
            "mass": -76.03129999999999
        },
        {
            "name": "F>R",
            "fullName": "Phe>Arg",
            "mass": 9.032697000000013
        },
        {
            "name": "F>N",
            "fullName": "Phe>Asn",
            "mass": -33.025486999999984
        },
        {
            "name": "F>D",
            "fullName": "Phe>Asp",
            "mass": -32.04147099999999
        },
        {
            "name": "F>C",
            "fullName": "Phe>Cys",
            "mass": -44.05922899999999
        },
        {
            "name": "F>E",
            "fullName": "Phe>Glu",
            "mass": -18.02582099999998
        },
        {
            "name": "F>Q",
            "fullName": "Phe>Gln",
            "mass": -19.00983599999998
        },
        {
            "name": "F>G",
            "fullName": "Phe>Gly",
            "mass": -90.04694999999998
        },
        {
            "name": "F>H",
            "fullName": "Phe>His",
            "mass": -10.009501999999998
        },
        {
            "name": "F>I",
            "fullName": "Phe>Ile",
            "mass": -33.98434999999999
        },
        {
            "name": "F>L",
            "fullName": "Phe>Leu",
            "mass": -33.98434999999999
        },
        {
            "name": "F>K",
            "fullName": "Phe>Lys",
            "mass": -18.973450999999983
        },
        {
            "name": "F>M",
            "fullName": "Phe>Met",
            "mass": -16.027929
        },
        {
            "name": "F>P",
            "fullName": "Phe>Pro",
            "mass": -50.015649999999994
        },
        {
            "name": "F>S",
            "fullName": "Phe>Ser",
            "mass": -60.03638599999999
        },
        {
            "name": "F>T",
            "fullName": "Phe>Thr",
            "mass": -46.02073499999999
        },
        {
            "name": "F>W",
            "fullName": "Phe>Trp",
            "mass": 39.01089900000002
        },
        {
            "name": "F>Y",
            "fullName": "Phe>Tyr",
            "mass": 15.994906000000015
        },
        {
            "name": "F>V",
            "fullName": "Phe>Val",
            "mass": -47.999999999999986
        },
        {
            "name": "P>A",
            "fullName": "Pro>Ala",
            "mass": -26.015649999999994
        },
        {
            "name": "P>R",
            "fullName": "Pro>Arg",
            "mass": 59.04834700000001
        },
        {
            "name": "P>N",
            "fullName": "Pro>Asn",
            "mass": 16.99016300000001
        },
        {
            "name": "P>D",
            "fullName": "Pro>Asp",
            "mass": 17.974179000000007
        },
        {
            "name": "P>C",
            "fullName": "Pro>Cys",
            "mass": 5.956421000000006
        },
        {
            "name": "P>E",
            "fullName": "Pro>Glu",
            "mass": 31.989829000000015
        },
        {
            "name": "P>Q",
            "fullName": "Pro>Gln",
            "mass": 31.005814000000015
        },
        {
            "name": "P>G",
            "fullName": "Pro>Gly",
            "mass": -40.031299999999995
        },
        {
            "name": "P>H",
            "fullName": "Pro>His",
            "mass": 40.006147999999996
        },
        {
            "name": "P>I",
            "fullName": "Pro>Ile",
            "mass": 16.0313
        },
        {
            "name": "P>L",
            "fullName": "Pro>Leu",
            "mass": 16.0313
        },
        {
            "name": "P>K",
            "fullName": "Pro>Lys",
            "mass": 31.04219900000001
        },
        {
            "name": "P>M",
            "fullName": "Pro>Met",
            "mass": 33.98772099999999
        },
        {
            "name": "P>F",
            "fullName": "Pro>Phe",
            "mass": 50.015649999999994
        },
        {
            "name": "P>S",
            "fullName": "Pro>Ser",
            "mass": -10.020736
        },
        {
            "name": "P>T",
            "fullName": "Pro>Thr",
            "mass": 3.994915000000006
        },
        {
            "name": "P>W",
            "fullName": "Pro>Trp",
            "mass": 89.02654900000002
        },
        {
            "name": "P>Y",
            "fullName": "Pro>Tyr",
            "mass": 66.01055600000001
        },
        {
            "name": "P>V",
            "fullName": "Pro>Val",
            "mass": 2.015650000000008
        },
        {
            "name": "S>A",
            "fullName": "Ser>Ala",
            "mass": -15.994913999999994
        },
        {
            "name": "S>R",
            "fullName": "Ser>Arg",
            "mass": 69.069083
        },
        {
            "name": "S>N",
            "fullName": "Ser>Asn",
            "mass": 27.01089900000001
        },
        {
            "name": "S>D",
            "fullName": "Ser>Asp",
            "mass": 27.994915000000006
        },
        {
            "name": "S>C",
            "fullName": "Ser>Cys",
            "mass": 15.977157000000005
        },
        {
            "name": "S>E",
            "fullName": "Ser>Glu",
            "mass": 42.010565000000014
        },
        {
            "name": "S>Q",
            "fullName": "Ser>Gln",
            "mass": 41.026550000000015
        },
        {
            "name": "S>G",
            "fullName": "Ser>Gly",
            "mass": -30.010563999999995
        },
        {
            "name": "S>H",
            "fullName": "Ser>His",
            "mass": 50.026883999999995
        },
        {
            "name": "S>I",
            "fullName": "Ser>Ile",
            "mass": 26.052036
        },
        {
            "name": "S>L",
            "fullName": "Ser>Leu",
            "mass": 26.052036
        },
        {
            "name": "S>K",
            "fullName": "Ser>Lys",
            "mass": 41.06293500000001
        },
        {
            "name": "S>M",
            "fullName": "Ser>Met",
            "mass": 44.00845699999999
        },
        {
            "name": "S>F",
            "fullName": "Ser>Phe",
            "mass": 60.03638599999999
        },
        {
            "name": "S>P",
            "fullName": "Ser>Pro",
            "mass": 10.020736
        },
        {
            "name": "S>T",
            "fullName": "Ser>Thr",
            "mass": 14.015651000000005
        },
        {
            "name": "S>W",
            "fullName": "Ser>Trp",
            "mass": 99.04728500000002
        },
        {
            "name": "S>Y",
            "fullName": "Ser>Tyr",
            "mass": 76.03129200000001
        },
        {
            "name": "S>V",
            "fullName": "Ser>Val",
            "mass": 12.036386000000007
        },
        {
            "name": "T>A",
            "fullName": "Thr>Ala",
            "mass": -30.010565
        },
        {
            "name": "T>R",
            "fullName": "Thr>Arg",
            "mass": 55.053432
        },
        {
            "name": "T>N",
            "fullName": "Thr>Asn",
            "mass": 12.995248000000004
        },
        {
            "name": "T>D",
            "fullName": "Thr>Asp",
            "mass": 13.979264
        },
        {
            "name": "T>C",
            "fullName": "Thr>Cys",
            "mass": 1.961506
        },
        {
            "name": "T>E",
            "fullName": "Thr>Glu",
            "mass": 27.99491400000001
        },
        {
            "name": "T>Q",
            "fullName": "Thr>Gln",
            "mass": 27.01089900000001
        },
        {
            "name": "T>G",
            "fullName": "Thr>Gly",
            "mass": -44.026215
        },
        {
            "name": "T>H",
            "fullName": "Thr>His",
            "mass": 36.01123299999999
        },
        {
            "name": "T>I",
            "fullName": "Thr>Ile",
            "mass": 12.036384999999996
        },
        {
            "name": "T>L",
            "fullName": "Thr>Leu",
            "mass": 12.036384999999996
        },
        {
            "name": "T>K",
            "fullName": "Thr>Lys",
            "mass": 27.047284000000005
        },
        {
            "name": "T>M",
            "fullName": "Thr>Met",
            "mass": 29.992805999999987
        },
        {
            "name": "T>F",
            "fullName": "Thr>Phe",
            "mass": 46.02073499999999
        },
        {
            "name": "T>P",
            "fullName": "Thr>Pro",
            "mass": -3.994915000000006
        },
        {
            "name": "T>S",
            "fullName": "Thr>Ser",
            "mass": -14.015651000000005
        },
        {
            "name": "T>W",
            "fullName": "Thr>Trp",
            "mass": 85.03163400000001
        },
        {
            "name": "T>Y",
            "fullName": "Thr>Tyr",
            "mass": 62.015641
        },
        {
            "name": "T>V",
            "fullName": "Thr>Val",
            "mass": -1.979264999999998
        },
        {
            "name": "W>A",
            "fullName": "Trp>Ala",
            "mass": -115.04219900000001
        },
        {
            "name": "W>R",
            "fullName": "Trp>Arg",
            "mass": -29.97820200000001
        },
        {
            "name": "W>N",
            "fullName": "Trp>Asn",
            "mass": -72.03638600000001
        },
        {
            "name": "W>D",
            "fullName": "Trp>Asp",
            "mass": -71.05237000000001
        },
        {
            "name": "W>C",
            "fullName": "Trp>Cys",
            "mass": -83.07012800000001
        },
        {
            "name": "W>E",
            "fullName": "Trp>Glu",
            "mass": -57.03672
        },
        {
            "name": "W>Q",
            "fullName": "Trp>Gln",
            "mass": -58.020735
        },
        {
            "name": "W>G",
            "fullName": "Trp>Gly",
            "mass": -129.057849
        },
        {
            "name": "W>H",
            "fullName": "Trp>His",
            "mass": -49.02040100000002
        },
        {
            "name": "W>I",
            "fullName": "Trp>Ile",
            "mass": -72.99524900000002
        },
        {
            "name": "W>L",
            "fullName": "Trp>Leu",
            "mass": -72.99524900000002
        },
        {
            "name": "W>K",
            "fullName": "Trp>Lys",
            "mass": -57.984350000000006
        },
        {
            "name": "W>M",
            "fullName": "Trp>Met",
            "mass": -55.038828000000024
        },
        {
            "name": "W>F",
            "fullName": "Trp>Phe",
            "mass": -39.01089900000002
        },
        {
            "name": "W>P",
            "fullName": "Trp>Pro",
            "mass": -89.02654900000002
        },
        {
            "name": "W>S",
            "fullName": "Trp>Ser",
            "mass": -99.04728500000002
        },
        {
            "name": "W>T",
            "fullName": "Trp>Thr",
            "mass": -85.03163400000001
        },
        {
            "name": "W>Y",
            "fullName": "Trp>Tyr",
            "mass": -23.01599300000001
        },
        {
            "name": "W>V",
            "fullName": "Trp>Val",
            "mass": -87.01089900000001
        },
        {
            "name": "Y>A",
            "fullName": "Tyr>Ala",
            "mass": -92.026206
        },
        {
            "name": "Y>R",
            "fullName": "Tyr>Arg",
            "mass": -6.962209000000001
        },
        {
            "name": "Y>N",
            "fullName": "Tyr>Asn",
            "mass": -49.020393
        },
        {
            "name": "Y>D",
            "fullName": "Tyr>Asp",
            "mass": -48.036377
        },
        {
            "name": "Y>C",
            "fullName": "Tyr>Cys",
            "mass": -60.054135
        },
        {
            "name": "Y>E",
            "fullName": "Tyr>Glu",
            "mass": -34.020726999999994
        },
        {
            "name": "Y>Q",
            "fullName": "Tyr>Gln",
            "mass": -35.00474199999999
        },
        {
            "name": "Y>G",
            "fullName": "Tyr>Gly",
            "mass": -106.041856
        },
        {
            "name": "Y>H",
            "fullName": "Tyr>His",
            "mass": -26.004408000000012
        },
        {
            "name": "Y>I",
            "fullName": "Tyr>Ile",
            "mass": -49.97925600000001
        },
        {
            "name": "Y>L",
            "fullName": "Tyr>Leu",
            "mass": -49.97925600000001
        },
        {
            "name": "Y>K",
            "fullName": "Tyr>Lys",
            "mass": -34.968357
        },
        {
            "name": "Y>M",
            "fullName": "Tyr>Met",
            "mass": -32.022835000000015
        },
        {
            "name": "Y>F",
            "fullName": "Tyr>Phe",
            "mass": -15.994906000000015
        },
        {
            "name": "Y>P",
            "fullName": "Tyr>Pro",
            "mass": -66.01055600000001
        },
        {
            "name": "Y>S",
            "fullName": "Tyr>Ser",
            "mass": -76.03129200000001
        },
        {
            "name": "Y>T",
            "fullName": "Tyr>Thr",
            "mass": -62.015641
        },
        {
            "name": "Y>W",
            "fullName": "Tyr>Trp",
            "mass": 23.01599300000001
        },
        {
            "name": "Y>V",
            "fullName": "Tyr>Val",
            "mass": -63.994906
        },
        {
            "name": "V>A",
            "fullName": "Val>Ala",
            "mass": -28.0313
        },
        {
            "name": "V>R",
            "fullName": "Val>Arg",
            "mass": 57.032697
        },
        {
            "name": "V>N",
            "fullName": "Val>Asn",
            "mass": 14.974513000000002
        },
        {
            "name": "V>D",
            "fullName": "Val>Asp",
            "mass": 15.958528999999999
        },
        {
            "name": "V>C",
            "fullName": "Val>Cys",
            "mass": 3.940770999999998
        },
        {
            "name": "V>E",
            "fullName": "Val>Glu",
            "mass": 29.974179000000007
        },
        {
            "name": "V>Q",
            "fullName": "Val>Gln",
            "mass": 28.990164000000007
        },
        {
            "name": "V>G",
            "fullName": "Val>Gly",
            "mass": -42.04695
        },
        {
            "name": "V>H",
            "fullName": "Val>His",
            "mass": 37.99049799999999
        },
        {
            "name": "V>I",
            "fullName": "Val>Ile",
            "mass": 14.015649999999994
        },
        {
            "name": "V>L",
            "fullName": "Val>Leu",
            "mass": 14.015649999999994
        },
        {
            "name": "V>K",
            "fullName": "Val>Lys",
            "mass": 29.026549000000003
        },
        {
            "name": "V>M",
            "fullName": "Val>Met",
            "mass": 31.972070999999985
        },
        {
            "name": "V>F",
            "fullName": "Val>Phe",
            "mass": 47.999999999999986
        },
        {
            "name": "V>P",
            "fullName": "Val>Pro",
            "mass": -2.015650000000008
        },
        {
            "name": "V>S",
            "fullName": "Val>Ser",
            "mass": -12.036386000000007
        },
        {
            "name": "V>T",
            "fullName": "Val>Thr",
            "mass": 1.979264999999998
        },
        {
            "name": "V>W",
            "fullName": "Val>Trp",
            "mass": 87.01089900000001
        },
        {
            "name": "V>Y",
            "fullName": "Val>Tyr",
            "mass": 63.994906
        }
    ]
});
