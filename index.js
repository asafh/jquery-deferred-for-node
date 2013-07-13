//require( "plus" );

var fs = require( "fs" ),
	path = require( "path" ),
    url = require( "url" ),
	exec = require('child_process').exec,
	versions = require( "./versions" ),
    unzip = require("unzip"),
    request = require("request"),
    http = require("http"),
    sylar = require("sylar"),
    Deferred = require( "JQDeferred"),
    _ = require("lodash"),
    Throttle = require("./throttle");

var httpThrottle = new Throttle(1);

RegExp.escape = RegExp.escape || function(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
};


function chain( fns ) {
    return fns.length === 1 ? fns[ 0 ] : function( input ) {
        fns.forEach(function( fn ) {
            input = fn( input );
        });
        return input;
    };
}

/**
 * @param tag {String} jQuery source tag to retreive, e.g. "1.9.1"
 * @return Deferred a deferred that will be resolved with the path of the directory
 *      containing the jQuery source for the tag requested
 */
function getJQuery(tag) {
    var rootPath = "./jquery/";
    var jqPath = path.join(rootPath, "jquery-"+tag);
    var downloaded = new Deferred();

    fs.exists(jqPath, function(exists) {
        if(exists) {
            process.nextTick(function(){
                downloaded.resolve();
            }); //No re-entry.
        }
        else {
//          var jqURL = url.resolve("http://github.com/jquery/jquery/archive/", tag+".zip");
            var jqURL = url.resolve("https://codeload.github.com/jquery/jquery/zip/", tag);

            var doUnzip = unzip.Extract({path: rootPath});
            doUnzip.on("finish", function(){
                httpThrottle.release();
                downloaded.resolve();
            });

            httpThrottle.queue(function(){
                console.log("Getting",jqURL);
                request(jqURL).pipe(doUnzip);
            });
        }
    });

    return downloaded.then(function() {return jqPath;}); //Return a promise which always resolve with the path
    //Alternative: Deferred.when(jqPath, downloaded);
}

var filters = {
    node: {
        src: [require("./import/src")],
        unit: [require("./import/src"), require("./import/unit")]
    },
    browser: {

    }
};

function buildVersion(version, options) {
    console.log(version, options);
    var targetDir = path.join("./dist", version);
    getJQuery(version)
        .then(function(val){
            return sylar.data(val);
        }) //Reading the source
        .done(function(jqSource) {
            var data = {
                jquery: jqSource,
                version: version,
                options: options,
                imports: {
                    getFilter: function (type,id) {
                        var filter = filters.node[type];
                        try {
                            filter = [ require("./import/" + type + "_" + id) ].concat(filter);
                        } catch (e) {
                        }
                        return chain(filter);
                    }
                }
            };

            sylar.template({
                src: "./template",
                dest: targetDir,
                data: data
            }).done(function() {
                //TODO: run tests
                /* Old test function, for reference...
                 function test() {
                 var nodeunit = "node_modules/nodeunit/bin/nodeunit " + packageDir + "test";
                 console.log( "\n" + nodeunit + "\n" );
                 exec( nodeunit, function( error, stdout, stderr ) {
                 if ( error ) {
                 throw stderr;
                 }
                 console.log( stdout );
                 next();
                 });
                 }
                 */
            });
        });
}

function reverseArgs(fn,limit) {
    return function() {
        var args = _.toArray(arguments);
        if(limit) {
            args = _.first(args,limit);
        }
        return fn.apply(this, args.reverse());
    };
}

//"main":
_.forOwn(versions, reverseArgs(buildVersion,2));