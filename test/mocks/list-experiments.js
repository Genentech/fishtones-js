define([], function() {
    return [{
        "id" : 8,
        "name" : "exp #1",
        "rtRange" : {
            "min" : 0.1876,
            "max" : 5400.68
        },
        "injections" : [{
            "id" : 8,
            "instrumentParams" : {
                "id" : 27,
                "fragmentTol" : 300,
                "precursorTol" : 12
            },
            "name" : "x-A",
            "runInfo" : {
                "id" : 18963399999999999999,
                "name" : "file://a/b/c/xyz1.raw"
            }
        }, {
            "id" : 31,
            "instrumentParams" : {
                "id" : 26,
                "fragmentTol" : 300,
                "precursorTol" : 12
            },
            "name" : "x-B",
            "runInfo" : {
                "id" : 189633,
                "name" : "file://a/b/c/xyz2.raw"
            }
        }]
    },
    {
        
        "id" : 12,
        "name" : "exp #2",
        "rtRange" : {
            "min" : 0,
            "max" : 100,
        },
        "injections" : [{
            "id" : 8,
            "instrumentParams" : {
                "id" : 27,
                "fragmentTol" : 300,
                "precursorTol" : 12
            },
            "name" : "x-A",
            "runInfo" : {
                "id" : 18963399999999999999,
                "name" : "file://a/b/c/xyz3.raw"
            }
        }
        ]
    }]
})
