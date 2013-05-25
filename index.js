require( "plus" );

var fs = require( "fs" ),
	path = require( "path" ),
	exec = require('child_process').exec,
	imports = require( "./import/main" ),
	versions = require( "./versions" ),
    unzip = require("unzip"),
    http = require("http"),
    sylar = require("sylar"),
    _ = require("lodash");

/**
 * @param tag {String} jQuery source tag to retreive, e.g. "1.9.1"
 * @param callback {function(path)} callback with the path of the directory
 *      containing the jQuery source for the tag requested.
 */
function getJQuery(tag, callback) {
    var path = path.join("./jquery/",tag);
    var done = function() {
        callback(path);
    };
    fs.exists(path, function(exists) {
        if(exists) {
            done();
        }
        else {
            http.get("https://github.com/jquery/jquery/archive/"+version+".zip", function(res) {
                var doUnzip = unzip.Extract({path: path});
                res.pipe(doUnzip);
                doUnzip.on("finish", function() {
                    done();
                });
            });
        }
    });
}

versions.forEach(function(options, version) {
    var targetDir = path.join("./dist", version);

    getJQuery(version, function(jquery) {
        sylar.data(jquery).done(function(jqSource) {
            var data = {
                jquery: jqSource,
                version: version,
                options: options
            };

            //TODO: Add preprocess jquery source that will only affect node package
            //TODO: Probably expose the filters in the data object and
            // implement that transformation in the templates

            var sylarData = { //TODO: Look at the shorthand sylar.template, might fit here
                src: "./template",
                dest: targetDir,
                filter: {
                    "*": function(content) {
                        return _.template(content, data);
                    }
                }
            };

            sylar(sylarData).done(function() {
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
                console.log(arguments);
            });
        });
    });
});
