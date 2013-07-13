module.exports = Throttle;
function Throttle(resources) {
    if (!(this instanceof Throttle)) {
        return new Throttle(resources);
    }

    resources = resources || 1;
    var queue = [],
        self = this;
    function flush() {
        while(queue.length && resources) {
            resources -= 1;
            var next = queue.shift();
            process.nextTick(next);
        }
    }
    this.queue = function(fn) {
        queue.push(fn);
        flush();
    };
    this.queueWith = function(fn,context,arg1,arg2,argN) {
        var args = Array.prototype.slice.call(arguments,2);
        self.queue(function() {
            fn.apply(context,args);
        });
    };
    this.release = function() {
        resources += 1;
        flush();
    };
}
