/*
$.queue = {
    _timer: null,
    _queue: [],
    add: function (fn, context, time) {
        var setTimer = function (time) {
            $.queue._timer = setTimeout(function () {
                time = $.queue.add();
                if ($.queue._queue.length) {
                    setTimer(time);
                }
            }, time || 2);
        }

        if (fn) {
            $.queue._queue.push([fn, context, time]);
            if ($.queue._queue.length == 1) {
                setTimer(time);
            }
            return;
        }

        var next = $.queue._queue.shift();
        if (!next) {
            return 0;
        }
        next[0].call(next[1] || window);
        return next[2];
    },
    clear: function () {
        clearTimeout($.queue._timer);
        $.queue._queue = [];
    }
};

$(document).ready(function() {
    // a lot of li's, lets say 500
    $('li').each(function() {
        var self = this;
        var doBind = function() {
            $(self).bind('click', function() {
                alert('Yeah you clicked me');
            });
        };
        $.queue.add(doBind, this);
    });
});

*/

// Kontrolli et for (prop in o) -ga ei k2ida l2bi Arrayd
console.log('ie=', ie);
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

/** A simple StopWatch
 * 
 * @class SW
 * @constructor
 */
function SW() { //StopWatch
    this.start = new Date().getTime();
    
    /**
     * Returns milliseconds since the StopWatch started
     * @method get
     * @return {number} 
     */
    this.get = function() {
        var end = new Date().getTime();
        return end - this.start;
    };
}

/**
 * O creates plain empty Objects inheriting null, that is
 * hash arrays
 * 
 * @class O
 * @constructor
 */
var O = {
	/**
	 * Returns a plain empty Object inheriting null
	 * 
	 * @method plain
	 * @return Object.create(null)
	 */
    plain: function() {
        return Object.create(null);
    }
}

/**
 * Provides the e-keelenõu application
 * 
 * @module App
 * @constructor
 */
var App = (function() {
    var app = this;

    /**
     * @class Source
     * @deprecated
     */
    //ei kasuta
    var Source = function(url, params) {
        var pars = params || {};
        this.query = function(query_str, params) {
            //return $.Deferred();
        };
    };

    //universaalne vastuse obj
    /*
    var Response = function(rid) {
        this.rid = rid;
        this.data =
    }
    */

    /**
     * API to the site's general logging facility
     * 
     * @class StlAPI
     * @param rid
     */
    var StlAPI = function(rid) {
        this.id = rid;
        var pars = {R: rid };

        /**
         * Make a query (actually it saves the query in the log)
         * 
         * @method query
         * @param query_str
         * @param params
         * @return {promise}
         */
        this.query = function(query_str, params) {
            $.extend(pars, {u: app.uid});
            $.extend(pars, params || {});
            $.extend(pars, {Q: query_str});
            return $.getJSON("http://kn.eki.ee/stl.php", pars); //return promise
        };
    };

    /**
     * API to the Estonian WordNet
     * 
     * @class SourceThesAPI
     * @param rid
     */
    var SourceThesAPI = function(rid) {
        this.id = rid;
        var pars = {R: rid};
        var res;
        /**
         * Make a query
         * 
         * @method query
         * @param query_str
         * @param params
         * @return {promise}
         */
        this.query = function(query_str, params) {
            $.extend(pars, params || {});
            $.extend(pars, {sone: query_str});
            return $.getJSON("http://eki.ee/elgar/ekeel/related.cgi", pars); //return promise
        };
    };

    /**
     * API to the EKI Keeleabi
     * 
     * @class SourceEknAPI
     * @param rid
     */
    var SourceEknAPI = function(rid) {
        this.id = rid;
        var pars = {R: rid};
        var res;
        
        /**
         * Initialises the API
         * 
         * @method init
         * @return 
         */
        this.init = function() {
            res = $.getJSON("http://www.eki.ee/ekeeleabi/api.cgi", pars);
        };
        
        /**
         * Make a query
         * 
         * @method query
         * @param query_str
         * @param params
         * @return 
         */
        this.query = function(query_str, params) {
            $.extend(pars, params || {});
            $.extend(pars, {Q: query_str});
            return $.getJSON("http://www.eki.ee/ekeeleabi/api.cgi", pars); //return promise
        };
    };
    
    /**
     * Some kind of test API
     * 
     * @class SourceOTest
     * @param rid
     */
    var SourceOTest = function(rid) {
        this.id = rid;
        var pars = {R: rid};
        
        /**
         * Make a query
         * @method query
         * @param query_str
         * @param params
         * @return data
         */
        this.query = function(query_str, params) {
            $.extend(pars, params || {});
            $.extend(pars, {Q: query_str});
            //return $.getJSON("http://www.eki.ee/ekeeleabi/o_test.cgi", pars); //return promise
            var p = $.getJSON("http://www.eki.ee/ekeeleabi/o_test.cgi", pars);
            //return p;
            return p.then(function done(data) {
                //dbg('---Check', rid, 'L', data.lyhivaade.length, 'T', data.taisvaade.length);
                if (data['lyhivaade'].length === 1 && data['lyhivaade'][0] === 'Ei leidnud') {
                    //dbg('check:', rid, 'Ei leidnud');
                    data.lyhivaade = [];
                    data.taisvaade = [];
                }
                //dbg('.')
                return data;
            })
        };
    };
    
    /**
     * API facade for querying the Estonian Wikipedia
     * 
     * @class SourceWikiEstAPI
     * @param rid
     */
    var SourceWikiEstAPI = function(rid) {
    	this.id = rid;
    	
    	/**
    	 * Make a query to the open MediaWiki API
    	 * See https://et.wikipedia.org/w/api.php for descriptions
    	 * and also http://www.mediawiki.org/wiki/Manual:CORS 
    	 * 
    	 * @method query
    	 * @param query_str
    	 * @param [params]
    	 * @return promise
    	 */
    	this.query = function(query_str, params) {
    		var url = 'https://et.wikipedia.org/w/api.php';
    		var promise;
    		
    		// define default parameters
    		if (typeof params === 'undefined') {
    			params = {};
    			params['action']       = 'query'; // make a query
    			params['prop']         = 'extracts'; // get page content extract
    			params['prop']        += '|categories'; // and page's categories
    			params['exintro']      = null; // specify extract as only the first paragraph
    			params['redirects']    = null; // handle redirects automatically
    			params['format']       = 'json';
    			//params['origin']       = location.origin; // needed for Cross-Origin Requests
    			params['cllimit']      = 10; // maximum 10 categories
    			params['exlimit']      = 10; // maximum 10 extracts  
    			params['indexpageids'] = null; // get a list of pageIds separately
    			params['maxlag']       = 10; // don't request if there is a 10 sec lag
    		}
    		
    		params['titles'] = query_str; // append the query string
    		
    		// ajutine arendaja lihtne valimine $.ajax ja $.getJSON meetodite vahel 
    		if (true) { // kas kasutame $.ajax meetodit (soovitatud)
    		promise = $.ajax({
    			url: url,
    			dataType: 'jsonp', // needed for Cross-Origin Requests
    			cache: true, // needed because dataType is 'jsonp'
    			data: params,
    			success: function(data, status, jqxhr) { return JSON.parse(data); }, // @todo: needed for jsonp??
    			xhrFields: {
    				'withCredentials': true, // needed for Cross-Origin Requests
    				'User-Agent': 'EKIbot/0.9 (+http://kn.eki.ee/)' // API bot best practices 
    			}
    		});
    		} else { // või kasutame $.getJSON meetodit
    		promise = $.getJSON(
    		    'https://et.wikipedia.org/w/api.php',
    		    'action=query'  + // make a query
    		    '&prop=extracts' + // get page content extract
    		    '|categories'    + // and page's categories
    		    '&exintro'       + // specify extract as only the first paragraph
    		    '&redirects'     + // handle redirects automatically
    		    '&format=json'   +
    		    //'&origin=' + location.origin + // needed for Cross-Origin Requests
    		    '&cllimit=10'    + // maximum 10 categories
    		    '&exlimit=10'    + // maximum 10 extracts  
    		    '&indexpageids'  + // get a list of pageIds separately
    		    '&maxlag=10'     + // don't request if there is a 10 sec lag
    		    '&callback=?'    + // needed for Cross-Origin Requests
    		    '&titles=' + query_str // append the query string
    		    , function(data) { // define the callback (e.g success)
    		    	return $.parseJSON(data);
    		    	}
    		    );
    		}
    		
    		return promise.then(function done(data) {
    			return $.parseJSON(data);
            });
    	};
    };
    
    /**
     * LayoutManager
     * 
     * @class LayoutManager
     */
    var LayoutManager = function() {
        var t = this;
        
        t.bigword = {
            text: ko.observable(''),
            displayed: ko.observable(false)
        }

        t.col1 = ko.observableArray(new Harray('id'));
        t.col2 = ko.observableArray(new Harray('id'));

        /**
         * Adds something to the LayoutManager
         * @method add
         * @param o
         */
        t.add = function(o) {
            if (o.col == 1) {
                t.col1.push(o);
            }
            else {
                t.col2.push(o);
            }

        }

        /**
         * Returns a column from the LayoutManager
         * 
         * @method getCol
         * @param nr
         * @return ko.observableArray
         */
        t.getCol = function(nr) {
            var c = [];
            for (var i in qm.views) {
                alert(qm.views.name)
                var v = qm.views[i];
                if (v.col == nr) {
                    c.push(v);
                }
            }
            alert('getCol:' + c.length)
            return ko.observableArray(c);
        }

    }
    app.lm = new LayoutManager();

    /**
     * QueryManager is some kind of mediator? between sources, processers and views?
     * 
     * @class QueryManager
     */
    var QueryManager = function() {
        var t = this;

        //this.queryText = ko.observable();

        //this.src_ids = [];
        this.srcs = new Harray('id');
        //this.view_ids = [];
        this.procs = new Harray('id');

        this.views = ko.observableArray(new Harray('id')); //miks obs?
        
        /**
         * Adds a Source (as an observer pattern?)
         * 
         * @method addSrc
         * @param src_id
         * @param src_o
         */
        this.addSrc = function(src_id, src_o) {
            //t.src_ids.push(src_id);
            t.srcs.push(src_o);
        };

        /**
         * Adds a proc (as an observer pattern?)
         * 
         * @method addProc
         * @param cid
         * @param proc_o
         */
        this.addProc = function(cid, proc_o) {
            t.procs.push(proc_o);
        };
        
        /**
         * Adds a view (as an observer pattern?)
         * 
         * @method addView
         * @param cid
         * @param view_o
         */
        this.addView = function(cid, view_o) {
            //t.view_ids.push(cid);
            t.views.push(view_o);

            app.lm.add(view_o);
            //t.views[view_id] = view_o;
            //console.log('qm.addView: '+ view_id);
        };
        
        /**
         * Make a query to all registered Source APIs
         * 
         * @method queryAll
         * @param query_str
         * @param params
         * @return resultArr
         */
        //testing
        this.queryAll = function(query_str, params) {
            var resultArr = [];
            for (var i = 0; i < t.srcs.length; i++) {
                resultArr.push( t.srcs[i].query(query_str, params) );
            }
            return resultArr;
        };
        
        /**
         * Make a search on all registered Source APIs
         * 
         * @method searchAll
         * @param query_str
         * @param params
         * @return promises
         */
        this.searchAll = function(query_str, params) {
            var responses = O.plain(); //{};
            var promises = [];

            //kas teeks teistmoodi?:
            // 1. k2ime l2bi k6ik RG-d, mis antud kasutaja konfi puhul midgi otsida tahavad
            // 1.1 kogume neilt kokku k6ik src-id
            // 2. teeme p2ringud
            // 3. jagame vastused RG-dele.
            //----------------------

            //tee k6ik p2ringud
            for (var i = 0; i < t.srcs.length; i++) {
                var s = t.srcs[i];
                responses[s.id] = s.query(query_str, params); //promise
            }

            //jaga vastused proc-idele:
            for (var i = 0; i < t.procs.length; i++) {
                var pr = t.procs[i];
                var prResponses = O.plain(); //{}; //miks hash?
                for (var sk in pr.srcs) { //pr.srcs on {}
                    prResponses[sk] = responses[sk];
                }
                var p = pr.setResponses(query_str, prResponses);
                promises.push(p);
            }

            //jaga vastused cat-idele: iga view saab temale vajalikud vastused
            for (var i = 0; i < t.views().length; i++) {
                var cat = t.views()[i];

                for (var si = 0; si < cat.rsltGrps().length; si++) {
                    var rg = cat.rsltGrps()[si];
                    var vResponses = O.plain(); //{};
                    for (var sk in rg.srcs) { //v.srcs on {}
                        vResponses[sk] = responses[sk];
                    }
                    var p = rg.setResponses(query_str, vResponses);
                    promises.push(p);
                }

            };
            
            return $.when.apply($, promises );
        };
        
    };

    /**
     * Responce processer for promises
     * 
     * @class ResProcessor
     * @param id
     */
    var ResProcessor = function(id) {
        this.id = id;
        var t = this;

        t.srcs = O.plain(); //{}; //public
        t.src_ids = '';

        /**
         * Add a source (as an observer pattern?)
         * @method addSrc
         * @param src_id
         * @param src_o
         */
        t.addSrc = function(src_id, src_o) {
            t.srcs[src_id] = src_o;
            t.src_ids = (t.src_ids.length) ? (t.src_ids +' '+ src_id) : src_id;
        };

        //resultide kokku kogumiseks eri responsidest.
        t.rslts = []; //taisvaade
        t.rsltsComp = []; //lyhivaade

        /**
         * Resets the result lists
         * 
         * @method reset
         */
        t.reset = function() {
            t.rslts = [];
            t.rsltsComp = [];
        };

        /**
         * Initialises a query by setting a stopwath (SW) for
         * timing the response time
         * 
         * @method initQuery
         */
        t.initQuery = function(qrystr) {
            t.qtime = new SW();
        };

        /**
         * Processes all promises that have responded (e.g been received)
         * Returns the processed results?
         * 
         * @method setResponses
         * @param qrystr
         * @param responses
         * @return 
         */
        //uus p2ring - antakse k6ik responsid promisitena
        t.setResponses = function(qrystr, responses) {
            dbg('ResProcessor setResponses', responses)
            //var qtime = new SW();
            t.reset(); //t.rslts = [];
            t.initQuery(qrystr);

            var ready = []; //kogutakse kohale j6udnud ja 2rat88deldud responside promisid

            //$.each()

            dbg(t.id+ ' setResponses:', responses)
            for (var sk in responses) { //responses on {}
                var r = responses[sk]; //r on Promise


                r.id = sk; //l2heb jqXHR kylge (va kui SourceOTest .then ei lase jqXHR-i edasi, siis on r lihtsalt Promise)

                var p = r.then(
                    function( data, textStatus, jqXHR ) {
                        //
                        var sid = sk;
                        //t.procResponse(jqXHR.id, data);
                        t.procResponse(sid, data);
                    },
                    function( x1, x2, x3 ) {
                        dbg(sk +' query failed: ')
                        dbg('x1', (typeof x1), x1);
                        dbg('x2', (typeof x2), x2);
                        dbg('x3', (typeof x3), x3);


                    }
                );
                p.id = sk;
                ready.push(p);
            }
            //dbg('ready: ', ready);

            var p = $.when.apply($, ready ).then(function() { //k6ik responsid on tulnud
                var arr = $.makeArray( arguments );
                //dbg('when responses arrived:', arr); // [undefined, undefined] ?

                t.responsesArrived(arr, p);
            });

            return p;
        };

        /**
         * Applies the registered process to the corresponding source's response
         * 
         * @method procResponse
         * @param sid
         * @param data
         */
        //overwriteb ainult ProcKeyw
        //k2ivitatakse nii mitu korda kui on src-id
        t.procResponse = function(sid, data) { //process one response
            //$.extend(t.items(), data.taisvaade);

            //dbg('ResProcessor procResponse', sid, data);
            //var o = {full: data.taisvaade, comp: data.lyhivaade};
            //dbg('o', o)
            t.rslts.push.apply(t.rslts, data.taisvaade );
            t.rsltsComp.push.apply(t.rsltsComp, data.lyhivaade );
            //console.log(t.rslts.length);
        };

        /**
         * Processes all the results
         * This is triggered when all responses has arrived
         * 
         * @method responsesArrived
         * @param resps
         * @param prom
         */
        //k6ik andmed on saabunud
        //overwrite?
        t.responsesArrived = function(resps, prom) {
            t.procResults(t.rslts);
        };

        //overwrite
        t.procResults = function(rslts) { //process all results

        };

        /**
         * Delays invoking the passed function with two milliseconds
         * 
         * @method delay
         * @param fn the callback function
         */
        t.delay = function(fn) {
            setTimeout(fn, 2);
        };

    };

    /**
     * Description
     * 
     * @class CategoryView
     * @param id
     */
    var CategoryView = function(id) {
        //ResProcessor.apply(this, arguments);
        this.id = id;
        var t = this;

        t.qry_time = ko.observable(0);
        t.qry_str = ko.observable('');

        t.rsltGrps = ko.observableArray(new Harray('id'));

        /**
         * Returns true if results are still loading, false if finished
         * 
         * @method loading
         * @return {Bool}
         */
        t.loading = ko.computed(function(){
            for (var i = 0; i < t.rsltGrps().length; i++) {
                if (t.rsltGrps()[i].loading()) {
                    return true;
                }
            }
            return false;
        });

        /**
         * Returns the summed amount of results found from
         * different sources (global across the site's search)
         * 
         * @method reslen
         * @return {Number} sum of results found
         */
        t.reslen = ko.computed(function() {
            var sum = 0;
            for (var i = 0; i < t.rsltGrps().length; i++) {
                sum += t.rsltGrps()[i].reslen();
            }
            return sum;
        });

        t.addRGrp = function(grp_id, grp_o) {

            t.rsltGrps.push(grp_o);
            dbg('addRGrp:', grp_id, grp_o);
        };

    };


    /**
     * General view component for RGs (resource groups?)
     * This handles the viewing of the results and also invokes
     * all the corresponding processing required to show the results
     * 
     * @class RGView
     * @uses ResProcessor
     * @param id
     */
    var RGView = function(id) {
        ResProcessor.apply(this, arguments);
        //this.id = id;
        var t = this;
        
        t.qry_time = ko.observable(0);
        t.qry_str = ko.observable('');
        t.loading = ko.observable(false);
        t.src_url_static_part = ko.observable('http://eki.ee/dict/qs/index.cgi?Q='); //default
        t.src_url = ko.computed(function() {
            return t.src_url_static_part() + URI.encode(t.qry_str());
        });

        t.viewComp = ko.observable(false); //view mode: comp vs full
        t.toggleView = function(char) {
            if (char === 'v') {
                t.viewComp(!t.viewComp());
            }
            return false; //ei reageeri lingile
        };
        
        // This binds the items datamodels with their HTML views as KO observers
        t.compItems = ko.observableArray(new Harray('id')); //kuvatavad objektid
        t.items = ko.observableArray(new Harray('id')); //kuvatavad objektid
        t.reslen = ko.computed(function() {
            return t.items().length;
        });

        /**
         * Initialises the inserted query on the view, by:
         * * setting a stopwatch to time the passage of time
         * * setting the views loading parameter to true
         * * setting the query string
         * 
         * @method initQuery
         * @param {String} qrystr the query string
         */
        t.initQuery = function(qrystr) {
            t.qtime = new SW();
            t.loading(true);
            t.qry_str( qrystr );
        };

        /**
         * @method showThoseItems
         * @param rslts
         * @return itemList
         * @deprecated ???
         */
        t.showThoseItems = function(rslts) {
            var itemList = [];

            for (var i = 0; i < rslts.length; i++) {
                var vi = new Result('', rslts[i]);
                itemList.push( vi );
            }

            return(itemList); //n2itame uut arrayd

        };

        /**
         * @method showItems
         */
        t.showItems = function() {
            var itemList = [];
            for (var i = 0; i < t.rslts.length; i++) {
            //for (var i in t.rslts) {

                //var o = t.rslts[i];
                //dbg('t.rslts[i]', i, o);
                var vi = new Result('', t.rslts[i]);
                //var vi = new ExpandableDataItem('', '', '', '', t.rslts[i]);
                itemList.push( vi );
            }
            t.items(itemList); //n2itame uut arrayd
        };

        /**
         * @method responsesArrived
         * @param resps
         * @param prom
         */
        t.responsesArrived = function(resps, prom) { //resps [undefined]
            t.procResults(t.rslts);
            t.showItems();
            t.loading(false);
            var time = t.qtime.get();
            console.log(t.id, time);
            t.qry_time(time);
            t.viewReady();
            //t.onViewReady();
        };

        t.tasksOnViewReady = [];
        /**
         * Mediator for running tasks when view is finished loading
         * 
         * @method onViewReady
         * @param {Function} fn the function to be invoked when ready
         */
        t.onViewReady = function(fn) {
            t.tasksOnViewReady.push(fn);
        };

        /**
         * Triggers the tasks to be run when the view is ready. For not
         * blocking the browser, there is a short delay (2 ms) between
         * the triggers.
         * 
         * @method viewReady
         */
        t.viewReady = function() {
            //k2ita
            $.each(t.tasksOnViewReady, function(k, v){
                t.delay(v);
            });
        };
    };

    /**
     * View for Resource Group of
     * 
     *  @class RG_Ekn
     *  @uses RGView
     *  @param id
     */
    var RG_Ekn = function(id) {
        RGView.apply(this, arguments);

        var t = this;

        t.sarnased = [];
        t.reset = function() {
            t.rslts = [];
            t.sarnased = [];
        };

        /**
         * Process the response by:
         * 1. gather the near-synonyms
         * 2. gather their ?
         */
        t.procResponse = function(sid, data) { //process one response
            //$.extend(t.items(), data.taisvaade);

            //dbg('RG_Ekn procResponse', sid, data);
            //dbg('RG_Ekn procResponse', t.rslts)

            for (var i=0; i < data.sarnased.length; i++) {
                var r = data.sarnased[i];
                t.sarnased.push( r );
            }

            for (var i=0; i < data.vaade.length; i++) {
                var r = data.vaade[i];
                t.rslts.push( r );
                //dbg('vaade:', r)
            }

            //var o = {full: data.taisvaade, comp: data.lyhivaade};
            //dbg('o', o)
            //t.rslts.push.apply(t.rslts, data );

            //console.log(t.rslts.length);
        };
        
        /**
         * Show the collected near-synonyms
         */
        t.showItems = function() {
            var itemList = [];
            for (var i = 0; i < t.rslts.length; i++) {
                //for (var i in t.rslts) {

                var o = t.rslts[i];
                //dbg('t.rslts[i]', i, o);
                var vi = new Result('', o.t, o.l);
                //var vi = new ExpandableDataItem('', '', '', '', t.rslts[i]);
                itemList.push( vi );
            }
            t.items(itemList); //n2itame uut arrayd
        };
    };
    
    /**
     * Links the View and content processing for 
     * 
     * @class RG_Ekn_Linker
     * @uses RG_Ekn
     * @param id
     */
    var RG_Ekn_Linker = function(id) {
        RG_Ekn.apply(this, arguments);

        var t = this;

        CMLinker(t, id);

        t.onViewReady(function(){
            t.procLinks();
        });
    };
    
    /**
     * View for Estonian Wordnet Resource Group
     * 
     * @class RGThes
     * @uses RGView
     * @param id
     */
    //Eesti Wordnet
    var RGThes = function(id) {
        RGView.apply(this, arguments);
        var t = this;

        t.relType = {
            hypernym: "Ülemmõisted",
            hyperonym: "Ülemmõisted",
            synonym: "Sarnased",
            antonym: "Vastandid",
            hyponym: "Alammõisted"
        };
        
        /**
         * Process the results
         */
        t.procResponse = function(sid, data) { //process one response

            //dbg('RGThes procResponse', t.rslts)

            for (var i=0; i < data.length; i++) {
                var o = data[i];
                t.rslts.push( o );
            }

        };

        t.word_cnt = 0;
        t.reslen = ko.computed(function() {
            if (t.items().length) {
                return t.word_cnt;
            }
            return 0;
        });

        t.showItems = function() {
            var itemList = [];
            t.word_cnt = 0;
            for (var i = 0; i < t.rslts.length; i++) {
                //for (var i in t.rslts) {

                var o = t.rslts[i];
                t.word_cnt += o.words.length;

                o.ekRelType = t.relType[o.relationshipType];

                //dbg('t.rslts[i]', i, o);
                //var vi = new Result('', o);
                itemList.push( o );
            }
            t.items(itemList); //n2itame uut arrayd
        };

    };

    /**
     * View for the Estonina Wikipedia
     * 
     * @class RGWikiEst
     * @uses RGView
     * @param id
     */
    var RGWikiEst = function(id) {
        RGView.apply(this, arguments);
        var self = this;
        
        /**
         * Processes the data coming from the API
         * Steps:
         * 1.
         * 2.
         */
        self.procResponse = function(sid, data) {
        	// only query part is needed
        	data = data['query'];
        	
        	// if the article redirects, it should be reflected in the title header
        	if ('redirects' in data) {
        		// headerValue = data['redirects']['from'] + " → " + data['redirects']['to'];
        	} else {
        		// headerValue = query_str; //??
        	}
        	
        	// add the found pages to the view's list
        	for (page in data['pages']) {
        		item = {};
        		item['title'] = page['title'];
        		item['content'] = page['extract'];
        		
        		// add the associated categories
        		item['categories'] = [];
        		for (category in page['categories']) {
        			item['categories'].push(category['title']);
        		}
        		self.rslts.push(item);
        	}
        };
        self.word_cnt = 0; //data['indexpageids'].length;
        self.reslen = ko.computed(function () {
        	var sum = 0;
        	return sum;
        });
        self.showItems = function() {
        	//var itemList = [];
        	// proovida lihtsalt paar staatilist ?ResultItem? lisada ja püüda tekitada GUIs
        	//self.items(itemList);
        	self.items(self.rslts);
        };
    }
    
    /**
     *
     * @param res_id
     * @param fragm_id - Ex: #mt12
     * @returns {*}
     */
    app.getTyyp = function(res_id, fragm_id) {
        //var f = function() {}
        var d = $.Deferred();

        var $div = $("<div></div>");
        var url = 'res/tyypsonad_'+ res_id + '.html '+ fragm_id +'';
        //console.log('getTyyp: url: ', url);

        $div.load(
            url,
            //'res/tyypsonad_'+ res_id + '.html a#'+ tyyp_id +' + table',
            //'res/tyypsonad_'+ res_id + '.html tr:has(a[id="tp'+ tyyp_id +'"])',
            function(responseText, textStatus, xhr) {
                //console.log('$d.load: res_id:', res_id,' textStatus:', textStatus, 'responseText:', responseText);
                //responseText sisaldab kogu faili, $d ainult otsitud div-i
                d.resolve($div, responseText, textStatus, xhr);
            }
        );
        return d;
    };
    app.initTyypLink = function() {}; //($a, html, res) //, tyyp);
    app.onTyypLink = function(cb) {
        app.initTyypLink = cb;
    };
    app.doTyypTip = function($a, res, fragm_id) {

        var d = app.getTyyp(res, fragm_id); //laetakse tyybi html..
        d.done(function($div, responseText, textStatus, xhr) { //kui laetud

            var $tp_info = $div;
            var html = $tp_info.html();
            app.initTyypLink($a, html, res); //mulli ehitama
        });

    };


    /**
     * RGTyyp description
     * 
     * @class RGTyyp
     * @param id
     * @uses RGLinker
     */
    var RGTyyp = function(id) {
        RGLinker.apply(this, arguments);

        var t = this;


        t.prepTyyp = function() { //leiab ressursi / kasti k6ik tyybi-lingid ja ehitab neile infomulli kylge.

            var res = t.id; //kontseptuaalselt vale - t.id on cat.id mitte res_id
            //console.log('res:', res)
            var $a_s;

            if (res == 'qs13') {
                $a_s = $('#' + res + ' span.grg a, #' + res + ' span.mt_kno a '); //QSi puhul
                //$a = $('#' + res + ' span.mt a'); //QSi puhul
                //dbg('yks')
            } else {
                //$a = $('#' + res + ' span.etvw_mt a'); //seletava puhul
                $a_s = $('#' + res + ' span.mt a'); //seletava puhul
                //dbg('kahest')
            }
            //dbg('$a:', $a)

            $a_s.each(function(){ //iga tyybi lingi puhul:
                //dbg('$a.each', this)

                //var prev = $(this).attr('title');
                //if (!prev) prev = '1';
                var $a = $(this);
                var tyyp_nr = $a.text();
                $a.attr('href', 'javascript: console.log("'+ res +'","'+ tyyp_nr +'")');
                //$t.attr('data-url', 'res/tyypsonad_'+ res + '.html');
                //$t.attr('data-sel', 'res/tyypsonad_'+ res + '.html #'+ $t.text() + ' + table');
                $a.attr('data-res', res);
                $a.attr('data-tyyp', tyyp_nr);


                app.doTyypTip($a, res, '#mt'+ tyyp_nr);


            });

        };

        /*
        t.doTyypTip = function($a, res, fragm_id, tyyp_nr) {

            var d = app.getTyyp(res, fragm_id); //laetakse tyybi html..
            d.done(function($div, responseText, textStatus, xhr) { //kui laetud

                var $tp_info = $div;
                var html = $tp_info.html();
                //console.log('d.done: res:',res ,' html:', html);

                //api.set('content.text', html);
                app.initTyypLink($a, html, res, tyyp_nr); //mulli ehitama
            });

        }
        */

        t.onViewReady(function(){
            t.prepTyyp();
        }) ;

    };

    /**
     * Constructor Module
     * 
     * @class CMLinker
     * @param t
     * @param id
     */
    var CMLinker = function(t, id) { //Constructor Module

        t.procLinks = function() {

            var $a = $('#'+ id +' .tervikart a');
            $a.each(function() {
                var $t = $(this);
                var linkText = $t.text();
                var href = $t.attr('href');
                //dbg('____procLinks: ', href, href.slice(0,10))
                if (href.slice(0,9) == 'index.cgi') {
                    $t.attr('href', href.substr(9));
                }
            });

            var $span = $('#'+ id +' .result span.sarnane');
            //dbg('span:', $span);
            $span.each(function() {
                var $t = $(this);
                var linkText = $t.text();
                $t.replaceWith(' <a class="vt_sarnane" href="?Q='+ linkText +'">'+ linkText +'</a> ');
            });
        }

    };

    /**
     * RGLinker
     * 
     * @class RGLinker
     * @uses RGView
     * @param id
     */
    var RGLinker = function(id) {
        RGView.apply(this, arguments);

        var t = this;

        CMLinker(t, id);

        t.onViewReady(function(){
            //linkide t88tlus
            t.procLinks();
        });

    };

    /**
     * Resource Group for 
     * 
     * @class RGVakk
     * @uses RGView
     * @param id
     */
    var RGVakk = function(id) {
        RGView.apply(this, arguments);

        var t = this;

        //http://stackoverflow.com/questions/298750/how-do-i-select-text-nodes-with-jquery
        t.getTextNodesIn = function (node, includeWhitespaceNodes) {
            var textNodes = [], nonWhitespaceMatcher = /\S/;

            function getTextNodes(node) {
                if (node.nodeType == 3) {
                    if (includeWhitespaceNodes || !nonWhitespaceMatcher.test(node.nodeValue)) {
                        textNodes.push(node);
                    }
                } else {
                    for (var i = 0, len = node.childNodes.length; i < len; ++i) {
                        getTextNodes(node.childNodes[i]);
                    }
                }
            }

            getTextNodes(node);
            return textNodes;
        };



        t.procLinks = function() {
            //dbg(id+ ' procLinks:')

            var $rs = $('#'+ id +' .result');


            $rs.each(function() {
                var myTextEl = this;

                t.delay(function() {
                    myTextEl.innerHTML = Autolinker.link( myTextEl.innerHTML );
                });

            });


        };


        t.onViewReady(function(){
            //dbg(id+ ' onViewReady')
            //linkide t88tlus
            t.procLinks();
        });


    };

    /**
     * Resource Group for the Handbook of Estonian Language
     * 
     * @class RG_EKKR
     * @uses RGView
     * @param id
     */
    var RG_EKKR = function(id) {
        RGView.apply(this, arguments);

        var t = this;


        t.trim = (function () {
            "use strict";

            function escapeRegex(string) {
                return string.replace(/[\[\](){}?*+\^$\\.|\-]/g, "\\$&");
            }

            return function trim(str, characters, flags) {
                flags = flags || "g";
                if (typeof str !== "string" || typeof characters !== "string" || typeof flags !== "string") {
                    throw new TypeError("argument must be string");
                }

                if (!/^[gi]*$/.test(flags)) {
                    throw new TypeError("Invalid flags supplied '" + flags.match(new RegExp("[^gi]*")) + "'");
                }

                characters = escapeRegex(characters);

                return str.replace(new RegExp("^[" + characters + "]+|[" + characters + "]+$", flags), '');
            };
        }());
        /*jslint devel: true */
        dbg(t.trim(" - hello* trim test* +", "+*- "));



        t.validURI = function(s) {
            //var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

            var re_weburl = new RegExp(
                "^" +
                    // protocol identifier
                    "(?:(?:https?|ftp)://)" +
                    // user:pass authentication
                    "(?:\\S+(?::\\S*)?@)?" +
                    "(?:" +
                    // IP address exclusion
                    // private & local networks
                    "(?!(?:10|127)(?:\\.\\d{1,3}){3})" +
                    "(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})" +
                    "(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})" +
                    // IP address dotted notation octets
                    // excludes loopback network 0.0.0.0
                    // excludes reserved space >= 224.0.0.0
                    // excludes network & broacast addresses
                    // (first & last IP address of each class)
                    "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" +
                    "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" +
                    "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" +
                    "|" +
                    // host name
                    "(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)" +
                    // domain name
                    "(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*" +
                    // TLD identifier
                    "(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))" +
                    ")" +
                    // port number
                    "(?::\\d{2,5})?" +
                    // resource path
                    "(?:/[^\\s]*)?" +
                    "$", "i"
            );

            return re_weburl.test(s);
        };


        t.onViewReady(function(){
            //linkide t88tlus
            t.procLinks();
            t.procPics();
        });

        t.procLinks = function() {

            var $a = $('#'+ id +' a');
            $a.each(function() {
                var $t = $(this);
                var linkText = $t.text();
                var href = $t.attr('href');
                //dbg(href, href.slice(0,10))
                if (href === undefined) {
                    return true;
                }

                if (href.slice(0, 15) == 'index.php?link=') {
                    $t.attr('href', "http://www.eki.ee/books/ekk09/" + href);
                    $t.attr('target', 'ekkr3456');
                } else {
                    //korrasta jutumärkides täislingid?

                    if (t.validURI(href)) {

                    } else {
                        if (t.validURI(linkText)) {
                            $t.attr('href', linkText);
                            $t.attr('target', '_blank');
                        }
                    }

                    //var result = URI.parse(href);
                    //dbg('URI.parse: ['+ href + ']', result)
                    /*
                    var fulluri = URI(href).normalize();
                    dbg('URI.normalize:', href, fulluri);
                    $t.attr('href', fulluri);
                    $t.attr('target', '_blank');
                    */
                    //kas mingeid variante on veel?
                }

                //dbg(id+ ' procLinks:', this)
            });

        };

        t.procPics = function () {

            var $img = $('#' + id + ' img');
            $img.each(function () {
                var $t = $(this);
                var src = $t.attr('src');
                //dbg(href, href.slice(0,10))

                if (src.slice(0, 7) == 'pildid/') {
                    $t.attr('src', "http://www.eki.ee/books/ekk09/" + src);
                    $t.attr('width', '100%');
                }

                //dbg(id + ' procPics:', this);
            });
        };

    };

    var ProcKeyw = function(id) {
        ResProcessor.apply(this, arguments);
        var t = this;

        t.reset();

        // ResProcessor.setResponses() kutsub v2lja:
        t.reset = function() {
            t.dstnctList = new ExpandableList();
            t.uniqueList = new UniqueList();
            t.foundMatch = false;
        };

        t.qry_str = '';

        t.initQuery = function(qrystr) {
            t.qtime = new SW();
            t.qry_str = qrystr;
        };

        t.getDom = function(html) {
            var wr_str_html = '<div>'+ html +'</div>';
            return $.parseHTML(wr_str_html);
        };

        t.removePunctuation = function(s) {
            //var s = "This., -/ is #! an $ % ^ & * example ;: {} of a = -_ string with `~)() punctuation";
            //var punctuationless = s.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g,"");
            var punctuationless = s.replace(/[.'´+|\[\]]/g,"");
            var finalString = punctuationless.replace(/\s{2,}/g," ");

            //myTxt = myTxt.replace(/[^a-zA-Z0-9 ]+/g, '').replace('/ {2,}/',' ');
            //myTxt = myTxt.replace(/['";:,.\/?\\-]/g, '');

            return finalString;
        };

        t.getKeywObj = function(html) {
            var d = t.getDom( html );
            var $d = $(d);
            var $span = $d.find('span.leitud_id');
            var id = $span.attr('id');
            var raw_keyw = $span.text();
            var plain_keyw = t.removePunctuation(raw_keyw);
            //dbg(id +' - '+ raw_keyw+ ' - '+ plain_keyw);
            return {
                id: id,
                keyw: plain_keyw,
                raw: raw_keyw,
                d: $d,
                html: html
            };
        };

        t.procResponse = function(sid, data) { //process one response
            //alert('procResponse')
            //$.extend(t.items(), data.taisvaade);

            //t.rslts.push.apply(t.rslts, data.taisvaade);

            //viime kokku lyhivaate ja t2isvaate
            for (var i in data.taisvaade) {
                var o = t.getKeywObj( data.taisvaade[i] );
                t.dstnctList.add(sid, o.id, o.keyw, null, o.html)
            }
            for (var i in data.lyhivaade) {
                var o = t.getKeywObj( data.lyhivaade[i] );
                t.dstnctList.add(sid, o.id, o.keyw, o.html)
            }

        };

        t.procResults = function(rslts) { //process all results

            var q_s = t.qry_str;

            var foundMatch = false;
            for (var i in t.dstnctList) {
                var edi = t.dstnctList[i];
                t.uniqueList.add(edi.keyw, edi);
                //console.log("edi: "+edi.keyw);
                if (q_s == edi.keyw) {
                    t.foundMatch = true;
                }

            }
            if (t.foundMatch) {
                //console.log("t2pne vaste");
                // kas see on vajalik?:
                // $(".info, .social-buttons").fadeOut("slow", function(){$("#page_content").fadeIn("slow");});
                app.lm.bigword.displayed(true);
                app.lm.bigword.text(q_s);
            } else {
                //console.log('pole t2pset')
                app.lm.bigword.displayed(false);
                app.lm.bigword.text('');
            }
        };


    };


    //Allikate (nimede) defineerimine:
    /**
     * Add description of sources attributes
     * @todo
     */
    var ekiSources = {
        qs: {id: 'qs', cls: SourceOTest, abbr: 'ÕS', name: 'Eesti õigekeelsussõnaraamat'},
        ekss: {id: 'ekss', abbr: 'EKSS', name: 'Eesti keele seletav sõnaraamat'},
        vakk: {id: 'vakk', abbr: 'KNV', name: 'Keelenõuvakk'},
        ekkr: {id: 'ekkr', abbr: 'EKKR', name: 'Eesti Keele Käsiraamat'},
        ies: {id: 'ies', abbr: 'IES', name: 'Inglise-eesti masintõlkesõnastik'},
        evs: {id: 'evs', abbr: 'EVS', name: 'Eesti-vene sõnaraamat'},
        knabee: {id: 'knabee', abbr: 'KNAB', name: 'Eesti kohanimed'},
        knabmm: {id: 'knabmm', abbr: 'KNAB', name: 'Maailma kohanimed'},
        syn: {id: 'syn', abbr: 'SÜN', name: 'Sünonüümisõnastik'}
    };
    app.sources = $.extend(ekiSources, {
        thes: {id: 'thes', cls: SourceThesAPI, abbr: 'EWN', name: 'Eesti Wordnet'},
        ass: {id: 'ass', cls: SourceEknAPI, abbr: 'ASS'},
        ety: {id: 'ety', cls: SourceEknAPI, abbr: 'ETÜ'},
        stl: {id: 'stl', cls: StlAPI, abbr: 'stl'},
        /*WiktionaryEst: {id: 'vikisonastik', cls: SourceWiktionaryEstAPI, abbr: 'Vikisõnastik', name: 'Eesti Vikisõnastik'},*/
        WikiEst: {id: 'WikiEst', cls: SourceWikiEstAPI, abbr: 'Vikipeedia', name: 'Eesti Vikipeedia'}
    });

    var qm = new QueryManager() ;
    app.qm = qm;

    /**
     * @todo: change app.sources with an sources Observer pattern
     *        QueryManager allready is the observer? but uses query_all?
     */
    for (var key in app.sources) {

        var src = app.sources[key];
        var so;
        if (typeof src['cls'] === 'function') {
            so = new src.cls(key);
        } else {
            so = new SourceOTest(key);
        };

        $.extend(so, app.sources[key]);
        qm.addSrc(key, so);
    }
    //qm.addSrc("qs", new EkiSource("qs"));

    //var qs = qm.createSrc("qs", "http://www.eki.ee/ekeeleabi/o_test.cgi", {R: "qs"});
    //var ekss = qm.createSrc("ekss", "http://www.eki.ee/ekeeleabi/o_test.cgi", {R: "ekss"});
    //test
    //ekss.query("kibe", {}, [function(d){console.log(d)}])

    /**
     * Add description to processor definiton attributes
     * @todo
     */
    //Vahet88tlejate defineerimine:
    var processors = {
        keyw: {res: ['qs', 'ekss'], proc: ProcKeyw }
    }


    //Tulemuste vaadete defineerimine:

    /*
    //see plokk peab olema p2rast catClasside def-e
    var resultCategories = app.resultCategories = {
            //keyw: {h: 'Märksõna', res: ['qs', 'ekss'], cview: CatKeyw, col: 1}, //tuleb luua, aga mitte lisada qm-i?
            //keyw: {h: 'Märksõna', res: ['qs', 'ekss'], col: 1},
            //morf: {h: 'Morfoloogia', res: []},
            qs13: {h: 'ÕS', res: ['qs'], cview: CatTyyp, col: 1, url: 'http://eki.ee/dict/qs/index.cgi?Q='}, //dyn laetav css tahab qs13 nimelist css klassi
            def: {h: 'Seletused', res: ['ekss'], cview: CatTyyp, col: 1, url: 'http://eki.ee/dict/ekss/index.cgi?Q='},
            //def: {h: 'Seletused', res: ['ekss'], col: 1},
            //thes: {h: 'Seotud sõnad', res: {id: 'qs'}},
            sugg: {h: 'Soovitused', res: ['vakk'], cview: CatVakk, col: 2, url: 'http://keeleabi.eki.ee/index.php?leht=0&otsi='},
            //sugg: {h: 'Soovitused', res: ['vakk'], col: 2},
            syn: {h: 'Sünonüümid', res: ['syn'], cview: CatTyyp, col: 1, url: 'http://eki.ee/dict/synonyymid/index.cgi?Q='},
            //ex: {h: 'Näited', res: {id: 'ies'}},
            trans_en: {h: 'Inglise vasted', res: ['ies'], cview: CatLinker, col: 1, url: 'http://eki.ee/dict/ies/index.cgi?Q='},
            trans_ru: {h: 'Vene vasted', res: ['evs'], cview: CatLinker, col: 1, url: 'http://eki.ee/dict/evs/index.cgi?Q='},
            knab: {h: 'Kohanimed', res: ['knabee', 'knabmm'], col: 1, url: 'http://www.eki.ee/cgi-bin/mkn8.cgi?form=mm&lang=et&of=tb&f2v=Y&f3v=Y&f10v=Y&f14v=Y&kohanimi='},
            ekkr: {h: 'Käsiraamat', res: ['ekkr'], cview: CatEKKR, col: 1, url: 'http://www.eki.ee/books/ekk09/index.php?paring='}
        };
    */
    
    /**
     * Add description of resultCategories attributes
     * @todo
     * resultCategories = {
     *   <name of>: {
     *     h: "this is the header shown in the view",
     *     res: ["array of"],
     *     cview: NameOfConcreteRGView,
     *     url: "url to be assigned the button in the view, current query_str will be appended to the end of this string"
     *   }
     * }
     */
    var resultCategories =
    app.resultCategories = {
        //keyw: {h: 'Märksõna', res: ['qs', 'ekss'], cview: CatKeyw, col: 1}, //tuleb luua, aga mitte lisada qm-i?
        //keyw: {h: 'Märksõna', res: ['qs', 'ekss'], col: 1},
        //morf: {h: 'Morfoloogia', res: []},

        c_qs: {h: 'ÕS', col: 1, grps: {
            qs13: {h: 'Eesti õigekeelsussõnaraamat ÕS 2013', res: ['qs'], cview: RGTyyp, url: 'http://eki.ee/dict/qs/index.cgi?Q='} //dyn laetav css tahab qs13 nimelist css klassi
        }},
        c_def: {h: 'Seletused', col: 1, grps: {
            ekss: {h: 'Eesti keele seletav sõnaraamat', res: ['ekss'], cview: RGTyyp, url: 'http://eki.ee/dict/ekss/index.cgi?Q='}
        }},
        c_rel: {h: 'Seotud sõnad', col: 1, grps: {
            syn: {h: 'Sünonüümid', res: ['syn'], cview: RGLinker, url: 'http://eki.ee/dict/synonyymid/index.cgi?Q='},
            thes: {h: 'Eesti Wordnet', res: ['thes'], cview: RGThes, url: 'http://www.cl.ut.ee/ressursid/teksaurus/teksaurus.cgi.et?otsi='}
        }},
        c_ety: {h: 'Etümoloogia', col: 1, grps: {
            ety: {h: 'Eesti etümoloogiasõnaraamat', res: ['ety'], cview: RG_Ekn, url: 'http://eki.ee/dict/ety/index.cgi?Q='}
        }},
        c_trans: {h: 'Tõlkevasted', col: 1, grps: {
            trans_en: {h: 'Inglise-eesti masintõlkesõnastik', res: ['ies'], cview: RGLinker, url: 'http://eki.ee/dict/ies/index.cgi?Q='},
            trans_ru: {h: 'Eesti-vene sõnaraamat', res: ['evs'], cview: RGLinker, url: 'http://eki.ee/dict/evs/index.cgi?Q='}
        }},
        c_sugg: {h: 'Soovitused', col: 2, grps: {
            ass: {h: 'Ametniku soovitussõnastik', res: ['ass'], cview: RG_Ekn_Linker, url: 'http://www.eki.ee/dict/ametnik/index.cgi?F=M&C06=et&Q='},
            //vakk: {h: 'Keelenõuvakk', res: ['vakk'], cview: RGVakk, url: 'http://keeleabi.eki.ee/index.php?leht=0&otsi='}
            vakk: {h: 'Keelenõuvakk', res: ['vakk'], cview: RGVakk, url: 'http://keeleabi.eki.ee/index.php?leht=4&act=1&otsi='}
        }},
        c_knab: {h: 'Kohanimed', col: 1, grps: {
            knabee: {h: 'Eesti kohanimed', res: ['knabee'], url: 'http://www.eki.ee/cgi-bin/mkn8.cgi?form=ee&lang=et&of=tb&f2v=Y&f3v=Y&f10v=Y&f14v=Y&kohanimi='},
            knabmm: {h: 'Maailma kohanimed', res: ['knabmm'], url: 'http://www.eki.ee/cgi-bin/mkn8.cgi?form=mm&lang=et&of=tb&f2v=Y&f3v=Y&f10v=Y&f14v=Y&kohanimi='}
        }},
        c_WikiEst: {h: 'Mujalt veebist', col:2, grps: {
        	/*WiktionaryEst: {h: 'Eesti Vikisõnastik', res: ['WiktionaryEst'], 'lisada'},*/
        	WikiEst: {h: 'Eesti Vikipeedia', res: ['WikiEst'], cview: RGWikiEst, url: 'lisada'}
        }},
        c_ekkr: {h: 'Käsiraamat', col: 2, grps: {
            ekkr: {h: 'Eesti Keele Käsiraamat', res: ['ekkr'], cview: RG_EKKR, url: 'http://www.eki.ee/books/ekk09/index.php?paring='}
        }}

    };



    for (var cid in processors) {

        var pdef = processors[cid];

        var pr;
        if (typeof pdef['proc'] === 'function') {
            pr = new pdef.proc(cid);
        };

        //for (var i in pdef.res)
        for (var i = 0; i < pdef.res.length; i++) { //anname sisendid //pdef.res on []
            var src_id = pdef.res[i];
            pr.addSrc(src_id, qm.srcs.h[src_id]);
        }

        qm.addProc(cid, pr);
    }



    for (var cid in resultCategories) {

        var rc = resultCategories[cid];
        
        var catv = new CategoryView(cid); //CategoryView

        catv.heading = rc.h;
        catv.col = rc.col;


        //result Grp-id
        for (var gid in rc.grps) {
            var g = rc.grps[gid];

            var rgv; //RGView
            if (typeof g['cview'] === 'function') {
                rgv = new g.cview(gid);

            } else { //default
                rgv = new RGView(gid);
            }
            dbg('gid', gid, 'new rgv', rgv);

            rgv.heading = g.h;

            if (g.url !== undefined) {
                rgv.src_url_static_part(g.url);
            }

            //ressursid
            //for (var i in rc.res) {
            for (var i = 0; i < g.res.length; i++) { //anname cv-le sisendid
                var src_id = g.res[i];
                rgv.addSrc(src_id, qm.srcs.h[src_id]);
            }

            catv.addRGrp(gid, rgv);
        }

        qm.addView(cid, catv);
    }


    /**
     * RGView tarvitab
     * 
     * @class Result
     * @param [id]
     * @param [full]
     * @param [comp]
     * @constructor
     */
    var Result = function(id, full, comp) {
        var t = this;
        t.id = id || Math.random().toString(36).replace(/[^a-z]+/g, '');

        t.collapsible = false;
        if (comp === undefined) {
            t.comp = full;
            t.collapsible = false;
        } else {
            t.comp = comp;
            t.collapsible = true;
        }

        t.full = full || '';
        t.expanded = ko.observable( t.collapsible ? false : true );
        
        /**
         * Toggles the expanded state
         * 
         * @method toggleExp
         */
        t.toggleExp = function() {
            t.expanded(!t.expanded());
            //proovime parandada linke //todo
            //eeldame et siin on dom juba ehitatud
        };

        /**
         * Returns the Result's content, either full or compact
         * depending on whether the view is expanded or not
         * 
         * @method getHTML
         * @return {string}
         */
        t.getHTML = function() {
            //dbg('t.expanded()', t.expanded());
            //var r;
            var r = (t.expanded()) ? t.full : t.comp;
            /*
            var ex = t.expanded();
            dbg('ex', ex);
            if (ex === true) {
                dbg('v6tab full')
                r = t.full;
            } else {
                dbg('v6tab comp')
                r = t.comp;
            }
            dbg('t.full', t.full);
            dbg('t.comp', t.comp);
            dbg('r', r);
            */
            return r;
        };
        //t.HTML = ko.observable(t.getHTML());
        t.HTML = ko.computed(t.getHTML);
        //t.getCol = function() {return t.comp;};
        //t.getExp = function() {return t.full;};//t.getHTML;

        /**
         * Returns a static string 'src?'
         * 
         * @method getSrc
         * @return {string}
         */
        t.getSrc = function() {
            return 'src?';
        };
        
        /**
         * Returns a static empty string ''
         * 
         * @method srcUrl
         * @return {string}
         */
        t.srcURL = function() {
            return '';
        };
        
        /**
         * Returns a static string 'Allika nimi'
         * 
         * @method srcTitle
         * @return {string}
         */
        t.srcTitle = function() {
            return 'Allika nimi';
        };
    };




    /**
     * Expandable description
     * 
     * @class Expandable
     * @param id
     * @param html
     * @uses Result
     */
    var Expandable = function(id, html) {
        Result.apply(this, arguments);
        var t = this;
        
        /**
         * empty function
         * 
         * @method expand
         * @deprecated
         */
        t.expand = function() {
            
        };
        
        /**
         * empty function
         * 
         * @method collapse
         * @deprecated
         */
        t.collapse = function() {
            
        };
        
    };

    /**
     * Section description
     * 
     * @class Section
     * @param id
     * @param html
     * @uses Expandable
     */
    var Section = function(id, html) {
        Expandable.apply(this, arguments);
        var t = this;
        this.id = id;
        
        t.html = '';
    };


    //ResultItem ---------------------------------------------------------------------------------------
    /**
     * ResultItem description 
     * 
     * @class ResultItem
     * @param sid
     * @param keyw
     * @param [result]
     */
    var ResultItem = function(sid, keyw, result) {
        
        var t = this;
        //t.id is reserved
        t.sid = sid;
        t.keyw = keyw;
        t.results = (result ? [result] : []);
        
        /**
         * Adds a result to the results list
         * Lisab leiu leidude listi
         * 
         * @method add 
         * @param result
         */
        t.add = function(result) {
            results.push(result);
        };
        
        /**
         * Returns the results as a string
         * 
         * @method getHTML
         * @return {string}
         */
        t.getHTML = function() {
            var outp = '';
            for (var i in t.results) {
                outp += t.results[i].html;
                //outp += '<div class="">'+'stuff'+'</div>';
            }
            return outp;
        };
        
        /**
         * Returns the abbreviated form of the Source's name
         * 
         * @method getSrc
         * @return {string}
         */
        t.getSrc = function() {
            return sources[t.sid].abbr;
        };
        
        /**
         * Should return the Source's url
         * 
         * @beta
         * @method srcURL
         * @return {string}
         */
        t.srcURL = function() {
        	// return sources[t.sid].url;
            return 'http://www.eki.ee/dict/qs/index.cgi?F=M&Q=kraam';
        };
        
        /**
         * Returns the Source's name
         * 
         * @srcTitle
         * @return {string}
         */
        t.srcTitle = function() {
            return sources[t.sid].name;
        };

    };
    
    /**
     * ResultList description
     * 
     * @class ResultList
     * @extends Harray
     * @uses Harray
     * @param id
     */
    var ResultList = function(id) {
        Harray.apply(this, arguments); //<- id
        var t = this;
        //t.harr = Harray('id');
        
        t.add = function(sid, keyw, result) {
            if (t.h[keyw]) {
                t.h[keyw].add(sid, keyw, result);
            } else {
                t.push( new ResultItem(sid, keyw, result) );
            }
            
        };
    };
    ResultList.prototype = Harray.prototype;

    // // ResultItem -------------------------------------------------------------------------------------


    //ExpandableList
    // kasutab: UniqueList
    /**
     * ExpandableDataitem description
     * 
     * @class ExpandableDataItem
     * @param sid
     * @param id
     * @param [keyw]
     * @param [pcol]
     * @param [pexp]
     */
    var ExpandableDataItem = function(sid, id, keyw, pcol, pexp) {
        var t = this;
        t.id = id; //selle j2rgi paneb Harray.push ta hashi.
        var col = pcol || null;
        var exp = pexp || null;
        //result = result || {col: '<span></span>', exp: '<span></span>'} //collapsed, expanded
        //t.setCol(result.col);
        //t.setExp(result.exp);
        
        t.sid = sid;
        t.keyw = keyw || null;

        t.expandable = false;

        t.expanded = ko.observable(false);
        //t.HTML = ko.observable(result.col);

        /**
         * Toggles between expanded and collapsed view
         * 
         * @method toggleExp
         */
        t.toggleExp = function() {
            var self = '';
            t.expanded(!t.expanded());
            //dbg('EDI expanded toggled: '+ t.expanded() + ' ' + self);
        };
        
        /**
         * Sets the item's column
         * 
         * @method setCol
         * @param string s
         */
        t.setCol = function(s) {
            col = s;
        };
        
        /**
         * Sets the view as expanded
         * 
         * @method setExp
         * @param s
         */
        t.setExp = function(s) {
            exp = s;
            t.expandable = true;
        };
        
        /**
         * Returns the column
         * 
         * @method getCol
         * @return {number}
         */
        t.getCol = function() {
            return col;
        };
        
        /**
         * Returns boolean if the item is expanded or not
         * 
         * @method getExp
         * @return {bool}
         */
        t.getExp = function() {
            return exp;
        };

        /**
         * @method getDefault
         * @return {string}
         * @deprecated
         */
        t.getDefault = function() {
            return '[default]';
        };
        
        /**
         * @method getHTML
         * @return {string}
         * @deprecated
         */
        t.getHTML = function() {
            var html = (t.expanded() ? 
                            ( (exp) ? 
                                t.getExp() 
                            : 
                                t.getDefault())
                        : 
                            ( (col) ? 
                                t.getCol() 
                            : 
                                t.getDefault())
                      );
            return t.id + ' ' + t.keyw + ' ' + html;
        };

        //allikas
        /**
         * Returns the source's abbreviated name
         * 
         * @method getSrc
         * @return {string}
         */
        t.getSrc = function() {
            return sources[t.sid].abbr;
        };
        
        /**
         * Returns a static url
         * 
         * @method srcUrl
         * @return {string}
         * @deprecated
         */
        t.srcURL = function() {
            return 'http://www.eki.ee/dict/qs/index.cgi?F=M&Q=test';
        };
        
        /**
         * Returns the source's name
         * 
         * @method srcTitle
         * @return {string}
         */
        t.srcTitle = function() {
            return sources[t.sid].name;
        };

    };
    
    /**
     * @class ExpandableList
     * @uses Harray
     */
    var ExpandableList = function() {
        //this.keyProperty = 'id';
        //Harray.apply(this, arguments); //<- id
        var t = this;
        //t.harr = Harray('id');
        t.h = {}; //h tundub olema staatiline - 1 k6igi exemplaride peale.  
        //new ExpandableList peaks kyll tegema, aga ei tee?? Mystika!
        //loogiline, Harray konstruktor k2itatakse ainult 1 kord prototyybi seadmisel.
        
        /**
         * Adds an ExpandableDataItem to the list
         * Returns the ExpandableDataItem
         * 
         * @method add
         * @param sid
         * @param id
         * @param keyw
         * @param col
         * @param exp
         * @return {ExpandableDataItem}
         */
        t.add = function(sid, id, keyw, col, exp) {
            var e;
            if (t.h[id]) {
                e = t.h[id];
                if (col) {
                    e.setCol(col);
                }
                if (exp) {
                    e.setExp(exp);
                }
                
            } else {
                e = new ExpandableDataItem(sid, id, keyw, col, exp);
                t.push( e );
            }
            return e;
        };
    };
    ExpandableList.prototype = new Harray('id');
    //ExpandableList.prototype.constructor = ExpandableList;
        
    //this.ex = new ExpandableList();

    /**
     * UniqueList description
     * 
     * @class UniqueList
     */
    var UniqueList = function() { //kasutab: ProcKeyw
        var t = this;

        t.h = {};

        /**
         * Adds an element as an ExpandableDataItem to the list only if it doesn't exist yet
         * 
         * @method add
         * @param keyw
         * @param o
         * @return {ExpandableDataItem}
         */
        t.add = function(keyw, o) {
            //t88delda keyw-eemaldada mittelubatud m2rgid
            var e; //element
            if (keyw in t.h) {
                e = t.h[keyw];
                e.exp = e.exp + o.exp;

            } else {
                e = new ExpandableDataItem('', keyw, keyw, o.col, o.exp);
                //e = new Harray('id');
                t.h[keyw] = e;
            }
            return e;
        };

        /**
         * Returns boolean if keyw exists in the list
         * 
         * @method has
         * @param keyw
         * @return {bool}
         */
        t.has = function(keyw) {
            return (keyw in t.h);
        };

        /**
         * Return the item for keyw if it exists in the list,
         * return undefined if not found
         * 
         * @method get
         * @param keyw
         * @return {bool, undefined}
         */
        t.get = function(keyw) {
            return (t.h[keyw]);
        };
    };

    /*
    var uql = new UniqueList();
    uql.add('kason', 'sss')
    var k = uql.get('midapole')
    console.log(k)
    if( k  ) {
        console.log('on')
    } else {
        console.log('pole')
    }
     */

});


