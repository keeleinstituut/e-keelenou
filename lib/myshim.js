// ----------------------------------------------------------
// A short snippet for detecting versions of IE in JavaScript
// without resorting to user-agent sniffing
// ----------------------------------------------------------
// If you're not in IE (or IE version is less than 5) then:
// ie === undefined
// If you're in IE (>=5) then you can determine which version:
// ie === 7; // IE7
// Thus, to detect IE:
// if (ie) {}
// And to detect the version:
// ie === 6 // IE6
// ie > 7 // IE8, IE9 ...
// ie < 9 // Anything less than IE9
// ----------------------------------------------------------

// UPDATE: Now using Live NodeList idea from @jdalton

var ie = (function(){

    var undef,
        v = 3,
        div = document.createElement('div'),
        all = div.getElementsByTagName('i');

    while (
        div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
            all[0]
        );

    return v > 4 ? v : undef;

}());
if (ie === undefined) {
    /*@cc_on
     if (/^10/.test(@_jscript_version)) {
     ie = 10;
     }
     @*/

}
//if (navigator.appVersion.indexOf("MSIE 10") !== -1) {ie10}
if (ie === undefined) {
    (function(){
        var UAString = navigator.userAgent;
        if (UAString.indexOf("Trident") !== -1 && UAString.indexOf("rv:11") !== -1)
        {
            ie = 11;
        }
    }());
}

if ( ! window.console ) {

    (function() {
      var names = ["log", "debug", "info", "warn", "error",
          "assert", "dir", "dirxml", "group", "groupEnd", "time",
          "timeEnd", "count", "trace", "profile", "profileEnd"],
          i, l = names.length;

      window.console = {};

      for ( i = 0; i < l; i++ ) {
        window.console[ names[i] ] = function() {};
      }
    }());

}

if (typeof Array.prototype.indexOf != "function") {

    Array.prototype.indexOf = function (array, item) { //IE8 n2itab iga kasti l6pus

            for (var i = 0, j = array.length; i < j; i++) {
                if (array[i] === item) {
                    return i;
                }
            }
            return -1;
    }
}

if (!Object.create) {
    Object.create = (function(){
        function F(){}

        return function(o){
            if (arguments.length != 1) {
                throw new Error('Object.create implementation only accepts one parameter.');
            }
            F.prototype = o;
            return new F()
        }
    })()
}

if (ie) {
    function dbg() {
        /*
         var args = Array.prototype.slice.call(arguments, 0);
         //var s = args.join(', '); //IE10: SCRIPT5005: String expected
         var s = '';
         for (var i = 0; i < args.length; i++) {
         //console.log(args[i]); //SCRIPT5005: String expected
         //s = s + args[i]; //SCRIPT438: Object doesn't support this property or method
         }
         //console.log(s);
         */
    }
} else {
    //var log = Function.prototype.bind.call(console.log, console);
    dbg = new Function('console.log.apply(console, arguments);');
    /*
     function dbg() {
     //console.log(s1);
     console.log.apply(console, arguments);
     //log.apply(console, arguments)
     }
     */
}


