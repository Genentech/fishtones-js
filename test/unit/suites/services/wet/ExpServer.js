/**
 * singleton class that will server for unit/integration testing, to server experiemental data
 */

define(['jquery', 'underscore', 'Backbone', 'sinon', 'mock/list-ms1scans-HCD', 'mock/list-msmsspectra-HCD', 'mock/list-instrumentParams', 'mock/list-injections', 'mock/list-experiments', 'mock/resp_chromatos_tkqtar', 'mock/resp_chromatos_tkqtar_heavy', 'mock/msmsrun-8', 'mock/list-run-headers', 'mock/prot-graphes'], function($, _, Backbone, sinon, l_ms1, l_msms, l_instrumentParams, l_injections, l_experiments, resp_chromatos_tkqtar, resp_chromatos_tkqtar_heavy, msmsrun_8, l_runHeaders, protGraphes) {

    ExpServer = Backbone.Model.extend({
        initialize : function() {

            //transoform the list of element (with id) into maps pointed by id
            var data = {
                msmsspectrum : l_msms,
                ms1scan : l_ms1,
                instrumentparams : l_instrumentParams,
                injection : l_injections,
                experiment : l_experiments,
            };
            data.msmsrun = [msmsrun_8]

            for (k in data) {
                var l = data[k];
                data[k] = {};
                _.each(l, function(e) {
                    data[k][e.id] = e;
                });
            }

            //add all msmsSPectra from msmsrun in msmsspectrum
            _.chain(data.msmsrun).values().pluck('msmsSpectra').flatten().each(function(sp) {
                data.msmsspectrum[sp.id] = sp
            });

            var chromatos = {}
            _.each([resp_chromatos_tkqtar, resp_chromatos_tkqtar_heavy], function(hd) {
                for (injId in hd) {
                    var l = hd[injId];
                    if (chromatos[injId] == undefined) {
                        chromatos[injId] = {}
                    }
                    _.each(l, function(xic) {
                        chromatos[injId][xic.mass] = xic;
                    })
                }
            });

            var server = sinon.fakeServer.create();

            //fake url answer
            server.respondWith('GET', '/sinon/ping', [200, {
                'Content-Type' : 'text/plain'
            }, 'pong'])

            //fake the fields=precursorOnly by removing the peaks data array
            server.respondWith(/\/(?:sinon|fishtones\/backend\/wet\-access)\/(msmsspectrum)\/(\w+)\?fields=precursorOnly/, function(xhr, type, id) {
                //console.log('respondWith ', xhr.url)
                var sp = $.extend({}, data[type][id]);
                delete sp.mozs;
                delete sp.intensities;
                delete sp.intensityRanks;
                delete sp.linkedTo;
                xhr.respond(200, {
                    "Content-Type" : "application/json"
                }, JSON.stringify(sp));
            });

            //get methods
            server.respondWith('GET', /\/(?:sinon|fishtones\/backend\/wet\-access)\/(ms1scan|msmsspectrum|instrumentparams|injection|experiment)\/(\w+)$/, function(xhr, type, id) {
                xhr.respond(200, {
                    "Content-Type" : "application/json"
                }, JSON.stringify(data[type][id]));
            });
            //update
            server.respondWith('PUT', /\/(?:sinon|fishtones\/backend\/wet\-access)\/(ms1scan|msmsspectrum|instrumentparasms|injection|experiment)\/(\w+)$/, function(xhr, type, id) {
                var params = eval('(' + xhr.requestBody + ')');
                $.extend(data[type][id], params);
                xhr.respond(200, {
                    "Content-Type" : "application/json"
                }, JSON.stringify(data[type][id]));
            });
            //list metho
            server.respondWith('GET', /\/(?:sinon|fishtones\/backend\/wet\-access)\/(ms1scan|msmsspectrum|instrumentparams|injection|experiment)$/, function(xhr, type, id) {
                //console.log('respondWith ', xhr.url, xhr)
                xhr.respond(200, {
                    "Content-Type" : "application/json"
                }, JSON.stringify(_.values(data[type])));
            });
            // new experiment
            server.respondWith('POST', '/sinon/experiment', function(xhr) {
                var body = JSON.parse(xhr.requestBody)
                var id = 1000 + _.size(data.experiment)
                data.experiment[id] = {
                    id : id,
                    name : body.name,
                    injections : []
                }

                xhr.respond(200, {
                    "Content-Type" : "application/json"
                }, JSON.stringify(data.experiment[id]));
            });

            // new injection
            server.respondWith('POST', '/sinon/injection', function(xhr) {
                var params = {}
                _.each(xhr.requestBody.split('&'), function(qe) {
                    var t = qe.split('=', 2)
                    params[t[0]] = t[1]
                })
                var id = 2000 + _.size(data.injection)

                data.injection[id] = {
                    id : id,
                    name : params.name,
                    "instrumentParams" : {
                        "id" : id + 500,
                        "fragmentTol" : params.fragmentTol,
                        "precursorTol" : params.precursorTol
                    }
                }

                xhr.respond(200, {
                    "Content-Type" : "application/json"
                }, JSON.stringify(data.injection[id]));
            });

            // add/delete injections to experiements
            server.respondWith('PUT', /\/(?:sinon|fishtones\/backend\/wet\-access)\/experiment\/(\w+)\/injections\/(\w+)$/, function(xhr, expId, injId) {
                data.experiment[expId].injections.push(data.injection[injId])
                xhr.respond(200, {
                    "Content-Type" : "application/json"
                }, JSON.stringify(_.values(data.experiment[expId])));
            });
            // upload a run - we don't actually do anything with the data...
            server.respondWith('POST', /\/(?:sinon|fishtones\/backend\/wet\-access)\/backend\/wet\-access\/injection\/(\w+)\/run$/, function(xhr, id) {
                data.injection[id].runInfo = {
                    "id" : id + 1000,
                    name : 'run, ' + data.injection[id].name + ' johnny'
                };
                xhr.respond(200, {
                    "Content-Type" : "application/json"
                }, JSON.stringify(data.injection[id]));
            });

            server.respondWith(/\/(?:sinon|fishtones\/backend\/wet\-access)\/chromato\/xic\/(\w+)\?m=([\d\.]+)&msms=true/, function(xhr, injId, mass) {
                if (chromatos[injId] == undefined) {
                    throw {
                        name : 'SINONUrlException',
                        message : 'no chromato for injection ' + id
                    }
                }
                var xic = chromatos[injId][mass]
                xhr.respond(200, {
                    "Content-Type" : "application/json"
                }, JSON.stringify(xic));
            });

            /**
             * msmsrun is one kind of species, even just for get, has extra parameter will decide on how much is populated...
             */
            server.respondWith('GET', '/sinon/msmsrun/8', function(xhr) {
                var ret = {
                    id : '8',
                    name : data.msmsrun['8'].name
                }
                xhr.respond(200, {
                    "Content-Type" : "application/json"
                }, JSON.stringify(ret));
            })
            server.respondWith('GET', /\/(?:sinon|fishtones\/backend\/wet\-access)\/msmsrun\/8\?msms=true$/, function(xhr) {
                var ret = data.msmsrun['8']
                xhr.respond(200, {
                    "Content-Type" : "application/json"
                }, JSON.stringify(ret));
            })
            server.respondWith('GET', /\/(?:sinon|fishtones\/backend\/wet\-access)\/msmsrun\/8\?msms=true&noPeaks=true$/, function(xhr) {
                var ret = {
                    id : '8',
                    name : data.msmsrun['8'].name,
                }
                ret.msmsSpectra = _.collect(data.msmsrun['8'].msmsSpectra, function(sp) {
                    var r = {}
                    for (k in sp) {
                        var v = sp[k];
                        if ( v instanceof Array) {
                            continue;
                        }
                        r[k] = v
                    }
                    return r;
                });
                xhr.respond(200, {
                    "Content-Type" : "application/json"
                }, JSON.stringify(ret));
            })
            server.respondWith('GET', /\/(?:sinon|fishtones\/backend\/wet\-access)\/msmsrun\/8\/msmsfromscans\/(.*)$/, function(xhr, lScans) {
                var ret = {
                    id : '8',
                    name : data.msmsrun['8'].name,
                }
                var h = {}
                _.each(lScans.split(','), function(s) {
                    h[s] = true
                });
                ret = _.filter(data.msmsrun['8'].msmsSpectra, function(sp) {
                    return h[sp.scanNumber]
                });
                xhr.respond(200, {
                    "Content-Type" : "application/json"
                }, JSON.stringify(ret));
            })
            //fake the fields=precursorOnly by removing the peaks data array
            server.respondWith(/\/(?:sinon|fishtones\/backend\/wet\-access)\/msmsrun\/autocomplete\/name\/(.+)/, function(xhr, str) {
                //console.log('respondWith ', xhr.url)
                str = str.toLowerCase()
                xhr.respond(200, {
                    "Content-Type" : "application/json"
                }, JSON.stringify(_.filter(l_runHeaders, function(h) {
                    return h.name.toLowerCase().indexOf(str) >= 0
                })));
            });
            server.respondWith('POST', /\/fishtones\/backend\/ms\/store\/psm\/setFavorite\/(.+)/, function(xhr, id){
                console.log('sinon: post setFavorite', id)
            })
           server.respondWith('GET',   /\/fishtones\/backend\/ms\/protein\/graph\?sequence=(.*)$/, function(xhr, sequence) {
                xhr.respond(200, {
                    "Content-Type" : "application/json"
                }, JSON.stringify(protGraphes[sequence]));
            })
  
            server.autoRespond = true;
            this.set('server', server);
        },
        respond : function() {
            this.get('server').respond();
        }
    });

    return new ExpServer();
});
