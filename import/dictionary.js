var def = {
    "jQuery.Callbacks": "Deferred.Callbacks",
    "jQuery.Deferred": "Deferred",
    "jQuery._Deferred": "Deferred._Deferred",
    "jQuery.isFunction": "\"function\" === jQuery.type",
    "jQuery.when": "Deferred.when"
};
module.exports.node = Object.create(def, {
    "document": "global", // <= crazy right?
    "window": "global"
});
module.exports.browser = Object.create(def, { //TODO Just remove these?
    "document": "document",
    "window": "window"
});
