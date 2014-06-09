#pViz.js: a JavaScript toolkit to bring LC-MS/MS data to your browser

##Visit the [how-to web site](http://research-pub/fishtones-js/howto) to get documentation, code snippets and running examples

##What is fishTones.js?
fishTones.js is a JavaScript library to visualize Liquid Chromatography Tandem Mass Spectrometry data in modern web browsers.
From theoretical computations on complex peptides, to spectral alignment and rich XIC exploration, fishTones.js offers both
computational features and a large variety of visualization widgets.
More than a single end user software, fishTones.js is a toolkit to build such applications.


###Third parties dependencies
fishTones.js library uses [D3](http://d3js.org) for SVG generation, [backbone.js](http://backbonejs.org) framework for the model/view framework,
[Twitter Bootstrap](http://getbootstrap.com/) for the css and JavaScript,
[underscore.js](http://underscorejs.org) library for convenient utilities
 and [require.js](http://requirejs.org) for dependency management.

But do not worry, including the [packaged distribution](dist/fishtones-bundle-min.js) bundles all of them for you.

##And more
### install dependencies

    npm install
    bower install

### deploy the how-to web site

    ant build-examples
    rsync --recursive howto host:/your/path/

###A few comments on the code
The JavaScript library relies on some "modern" language components. It is not aimed at running on IE 7.
That said, you can either use the bundled library (with all dependencies) or created you own application using require.js and checked out source code.

####Unit testing
Via jasmine, either in the browser ([test/unit/index.html](test/unit/index.html)) or command line with phantom.js

####Continuous integration
test, distribution etc. can be launched in a CI environment via grunt tasks <code>ant unit-test, build...</code>

###Authors
This library was initiated by Alexandre Masselot (masselot.alexandre@gene.com)  within Genentech Bioinformatics & Computational Biology Department.

###License
The library is distributed under a BSD license. Full description can be found in [LICENSE.txt](LICENSE.txt)

