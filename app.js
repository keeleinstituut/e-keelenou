/*jshint strict:true*/
/* global ie */
/* global ko */

console.log('ie=', ie);
var DEVELOPMENT = true;
if (ie) {
	function dbg() {
		// @todo: IE debugimine implementeerida
	}
} else {
	dbg = new Function('console.log.apply(console, arguments);');
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
 * O creates hash arrays, that is plain empty Objects inheriting null
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
};


var cookieList = function(cookieName) {
	//When the cookie is saved the items will be a comma seperated string
	//So we will split the cookie by comma to get the original array
	var cookie = $.cookie(cookieName);
	//Load the items or a new array if null.
	var items = cookie ? cookie.split(/,/) : new Array();

	//Return a object that we can use to access the array.
	//while hiding direct access to the declared items array
	//this is called closures see http://www.jibbering.com/faq/faq_notes/closures.html
	return {
		"set_str": function(str) {
			
			$.cookie(cookieName, str);
		},
		"set": function(arr) {
			items = arr;
			$.cookie(cookieName, items.join(','));
		},
		"add": function(val) {
			//Add to the items.
			items.push(val);
			//Save the items to a cookie.
			//EDIT: Modified from linked answer by Nick see 
			//      http://stackoverflow.com/questions/3387251/how-to-store-array-in-jquery-cookie
			$.cookie(cookieName, items.join(','));
		},
		"remove": function (val) { 
			//EDIT: Thx to Assef and luke for remove.
			indx = items.indexOf(val); 
			if(indx!=-1) items.splice(indx, 1); 
			$.cookie(cookieName, items.join(','));        
			
		},
		"clear": function() {
			items = null;
			//clear the cookie.
			$.cookie(cookieName, null);
		},
		"items": function() {
			//Get all the items.
			return items;
		}
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
	 * Facade to the site's general logging facility API
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
		 * @param [params]
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
	 * Facade for the Estonian WordNet API
	 * 
	 * @class SourceThesAPI
	 * @param rid
	 */
	var SourceThesAPI = function(rid) {
		this.id = rid;
		var pars = {R: rid};
		
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
	 * Facade for the EKI e-keelenõu dictionary API
	 * (serves etümoloogia, ametnik)
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
		 * @deprecated ?
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
		 * @param [params]
		 * @return 
		 */
		this.query = function(query_str, params) {
			$.extend(pars, params || {});
			$.extend(pars, {Q: query_str});
			return $.getJSON("http://www.eki.ee/ekeeleabi/api.cgi", pars); //return promise
		};
	};
	
	/**
	 * Facade for the *old* EKI e-keelenõu dictionary API
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
		 * @param [params]
		 * @return data
		 */
		this.query = function(query_str, params) {
			$.extend(pars, params || {});
			$.extend(pars, {Q: query_str});
			
			var p = $.getJSON("http://www.eki.ee/ekeeleabi/o_test.cgi", pars);
			
			return p.then(function done(data) {
				if (data['lyhivaade'].length === 1 && 
						data['lyhivaade'][0] === 'Ei leidnud') {
					data.lyhivaade = [];
					data.taisvaade = [];
				}
				return data;
			});
		};
	};
	
	/**
	 * Facade for querying the Estonian Wikipedia API
	 * 
	 * @class SourceWikiEstAPI
	 * @param rid
	 */
	var SourceWikiEstAPI = function(rid) {
		this.id = rid;
		var self = this;
		var url = 'https://et.wikipedia.org/w/api.php';
		
		/**
		 * Make an open search on MediaWiki API
		 * This is used when direct queries find no results
		 */
		this.openSearch = function(query_str, params) {
			var promise;
			
			// define default parameters
			if (typeof params === 'undefined') {
				params = {};
				params['action'] = 'opensearch';
				//params['limit']    = 20; // Maximum amount of results
				//params['namespace']= 0; // Namespaces to search
				params['format']   = 'json'; // The format of the output
			}
			params['search']   = query_str; // Search string
			
			// make the ajax request to the wikipedia API
			promise = $.ajax({
				url: url,
				dataType: 'jsonp', // needed for Cross-Origin Requests
				cache: true, // needed because dataType is 'jsonp'
				data: params,
				xhrFields: {
					'withCredentials': true, // needed for Cross-Origin Requests
					'User-Agent': 'EKIbot/0.9 (+http://kn.eki.ee/)' // API bot best practices 
				}
			});
			
			return promise.then(function done(data) {
				return {'opensearch': data};
			});
		};
		
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
			var promise;
			
			// define default parameters
			if (typeof params === 'undefined') {
				params = {};
				params['action']          = 'query'; // make a query
				params['prop']            = 'extracts'; // get page content extract
				params['prop']           += '|categories'; // and page's categories
				//params['exintro']         = null; // extract only the first paragraph
				params['exsentences']     = 1;
				//params['explaintext']     = null; // extract as plaintext
				params['redirects']       = null; // handle redirects automatically
				params['format']          = 'json';
				params['cllimit']         = 10; // maximum 10 categories
				params['exlimit']         = 10; // maximum 10 extracts  
				params['indexpageids']    = null; // get a list of pageIds separately
				params['maxlag']          = 10; // don't request if there is a 10 sec lag
				//params['origin']          = location.origin; // needed for Cross-Origin Requests
			}
			
			params['titles'] = query_str; // append the query string
			
			// make the ajax request to the wikipedia API
			promise = $.ajax({
				url: url,
				dataType: 'jsonp', // needed for Cross-Origin Requests
				cache: true, // needed because dataType is 'jsonp'
				data: params,
				xhrFields: {
					'withCredentials': true, // needed for Cross-Origin Requests
					'User-Agent': 'EKIbot/0.9 (+http://kn.eki.ee/)' // API bot best practices 
				}
			});
			
			return promise.then(function done(data) {
				// if nothing precise was found, make an open search instead
				if ('-1' in data['query']['pages']) {
					return self.openSearch(query_str);
				} else {
					// the returned Wikipedia API datamodel is fine, just send 
					// it to RGWikiEst.procResponse @todo: kuhu saadetakse?
					return data;
				}
			});
		};
	};
	
	/**
	 * LayoutManager *will* manage a responsive layout
	 * 
	 * @class LayoutManager
	 */
	var LayoutManager = function() {
		var self = this;
		
		// bigword displays the query string if found
		self.bigword = {
			text: ko.observable(''),
			displayed: ko.observable(false)
		};
		
		// right now we handle only two columns
		self.cols = [];
		self.col1 = ko.observableArray(new Harray('id'));
		// @todo: self.cols.push(ko.observableArray(new Harray('id')));
		self.col2 = ko.observableArray(new Harray('id'));
		// @todo: self.cols.push(ko.observableArray(new Harray('id')));
		
		/**
		 * Insert a ResultCategory's CategoryView in a column (displayed as a box)
		 * @method add
		 * @param {CategoryView} catView
		 */
		self.add = function(catView) {
			// @todo: self.cols[catView.col - 1];
			if (catView.col == 1) {
				self.col1.push(catView);
			}
			else {
				self.col2.push(catView);
			}
		};
		
		/**
		 * Returns all CategoryViews in a column from the LayoutManager
		 * Ei kasutata praegu kusagil
		 * 
		 * @method getCol
		 * @param {Number} nr number of the column
		 * @uses QueryManager!!!
		 * @return Array
		 
		self.getCol = function(nr) {
			var c = [];
			var vs = qm.views();
			
			for (var i = 0; i < vs.length; i += 1) {
				dbg('getCol', i, vs[i]);
				var v = vs[i];
				if (v.col === nr) {
					c.push(v);
				}
			}
			//return ko.observableArray(c);
			return c
		};*/
		
	};
	
	app.lm = new LayoutManager();


	/**
	 * ResourceMediator is mediator between sources, processers and views for one resource
	 * 
	 * @class ResourceMediator
	 */
	var ResourceMediator = function() {
		var self = this;
		
		this.query = function() {
			
		}
		
		
	}

	/**
	 * QueryManager holds a current set of resources that user wants to query
	 * 
	 * @class QueryManager
	 */
	var QueryManager = function() {
		var self = this;
		
		this.addResource = function() {
			
		}
		
		this.removeResource = function() {
			
		}
		
		/**
		 * Make a search on all registered Source APIs
		 * 
		 * @method queryAll
		 * @param query_str
		 * @param params
		 * @return promises
		 */
		this.queryAll = function(query_str, params) {
			var responses = O.plain(); //{};
			var promises = [];

			//kas teeks teistmoodi?:
			// 1. käime läbi kõik RG-d, mis antud kasutaja konfi puhul midagi otsida tahavad
			// 1.1 kogume neilt kokku kõik src-id
			// 2. teeme päringud
			// 3. jagame vastused RG-dele.
			//----------------------

			//tee kõik päringud
			for (var i = 0; i < self.srcs.length; i += 1) {
				var s = self.srcs[i];
				responses[s.id] = s.query(query_str, params); //promise
			}

			//jaga vastused proc-idele:
			for (var i = 0; i < self.procs.length; i += 1) {
				var pr = self.procs[i];
				var prResponses = O.plain(); //{}; //miks hash?
				for (var sk in pr.srcs) { //pr.srcs on {}
					prResponses[sk] = responses[sk];
				}
				var p = pr.setResponses(query_str, prResponses);
				promises.push(p);
			}

			//jaga vastused cat-idele: iga view saab temale vajalikud vastused
			for (var i = 0; i < self.views().length; i += 1) {
				var cat = self.views()[i];

				for (var si = 0; si < cat.rsltGrps().length; si += 1) {
					var rg = cat.rsltGrps()[si];
					var vResponses = O.plain(); //{};
					for (var sk in rg.srcs) { //v.srcs on {}
						vResponses[sk] = responses[sk];
					}
					var p = rg.setResponses(query_str, vResponses);
					promises.push(p);
				}

			}
			
			return $.when.apply($, promises );
		};

		
	}
	var QueryManager_Old = function() {
		var self = this;
		
		//this.src_ids = [];
		this.srcs = new Harray('id');
		//this.view_ids = [];
		this.procs = new Harray('id');


		//CategoryViews
		this.views = ko.observableArray(new Harray('id')); //miks obs?
		
		//RG Management
		this.RGs = O.plain();
		this.cookieRGs = cookieList('RGs');
		
		this.savedRGs = function() {
			return self.cookieRGs.items();
		} 
		this.saveRGs = function(arr) {
			self.cookieRGs.set(arr);
		}
		this.forceRGs = function(v) {//arr või 1
			self.screenRGs(v);
		}
		this.suggRGs = function(v) {//arr või 1
			self.screenRGs(v);
		}

		//ekraanil näha RG-d
		this.screenRGs = ko.computed({
			read: function(){
				var arr = [];
				for (var iv = 0; iv < self.views().length; iv++) {
					var view = self.views()[iv];
					for (var i = 0; i < view.rsltGrps().length; i++) {
						if (view.rsltGrps()[i].active()) {
							arr.push(view.rsltGrps()[i].id);
						}
					}
				}
				return arr;
			},
			write: function(arr) {
				if (typeof arr === 'object') {
					for (var iv = 0; iv < self.views().length; iv++) {
						var view = self.views()[iv];
						for (var i = 0; i < view.rsltGrps().length; i++) {
							var rg = view.rsltGrps()[i];
							if (arr.indexOf(rg.id) != -1) {
								rg.active(1);
							} else {
								rg.active(0);
							}
						}
					}
					
				} else {
					for (var iv = 0; iv < self.views().length; iv++) {
						var view = self.views()[iv];
						for (var i = 0; i < view.rsltGrps().length; i++) {
							var rg = view.rsltGrps()[i];
							rg.active(1);
							
						}
					}
					
				}
			},
			owner: this
		});
		//========== RG Management
		
		/**
		 * Adds a Source (as an observer pattern?)
		 * 
		 * @method addSrc
		 * @param src_id
		 * @param src_o
		 */
		this.addSrc = function(src_id, src_o) {
			//self.src_ids.push(src_id);
			self.srcs.push(src_o);
		};

		/**
		 * Adds a proc (as an observer pattern?)
		 * 
		 * @method addProc
		 * @param cid
		 * @param proc_o
		 */
		this.addProc = function(cid, proc_o) {
			self.procs.push(proc_o);
		};
		
		/**
		 * Adds a view (as an observer pattern?)
		 * 
		 * @method addView
		 * @param cid
		 * @param view_o
		 */
		this.addView = function(cid, view_o) {
			//self.view_ids.push(cid);
			self.views.push(view_o);

			app.lm.add(view_o);
			//self.views[view_id] = view_o;
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
			// 1. käime läbi kõik RG-d, mis antud kasutaja konfi puhul midagi otsida tahavad
			// 1.1 kogume neilt kokku kõik src-id
			// 2. teeme päringud
			// 3. jagame vastused RG-dele.
			//----------------------

			//tee kõik päringud
			for (var i = 0; i < self.srcs.length; i += 1) {
				var s = self.srcs[i];
				responses[s.id] = s.query(query_str, params); //promise
			}

			//jaga vastused proc-idele:
			for (var i = 0; i < self.procs.length; i += 1) {
				var pr = self.procs[i];
				var prResponses = O.plain(); //{}; //miks hash?
				for (var sk in pr.srcs) { //pr.srcs on {}
					prResponses[sk] = responses[sk];
				}
				var p = pr.setResponses(query_str, prResponses);
				promises.push(p);
			}

			//jaga vastused cat-idele: iga view saab temale vajalikud vastused
			for (var i = 0; i < self.views().length; i += 1) {
				var cat = self.views()[i];

				for (var si = 0; si < cat.rsltGrps().length; si += 1) {
					var rg = cat.rsltGrps()[si];
					var vResponses = O.plain(); //{};
					for (var sk in rg.srcs) { //v.srcs on {}
						vResponses[sk] = responses[sk];
					}
					var p = rg.setResponses(query_str, vResponses);
					promises.push(p);
				}

			}
			
			return $.when.apply($, promises );
		};
	};

	/**
	 * Response processer for promises
	 * 
	 * @class ResProcessor
	 * @param id
	 */
	var ResProcessor = function(id) {
		this.id = id;
		var self = this;

		self.active = ko.observable(1); //näitab ja teeb päringuid

		self.srcs = O.plain(); //{}; //public
		self.src_ids = '';

		/**
		 * Add a source (as an observer pattern?)
		 * @method addSrc
		 * @param src_id
		 * @param src_o
		 */
		self.addSrc = function(src_id, src_o) {
			self.srcs[src_id] = src_o;
			self.src_ids = (self.src_ids.length) ? (self.src_ids +' '+ src_id) : src_id;
		};

		//resultide kokku kogumiseks eri responsidest.
		self.rslts = []; //taisvaade
		self.rsltsComp = []; //lyhivaade
	 
		/**
		 * Resets the result lists
		 * 
		 * @method reset
		 */
		self.reset = function() {
			self.rslts = [];
			self.rsltsComp = [];
		};

		/**
		 * Initialises a query by setting a stopwath (SW) for
		 * timing the response time
		 * 
		 * @method initQuery
		 */
		self.initQuery = function(qrystr) {
			self.qtime = new SW();
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
		//uus päring - antakse kõik responsid promisitena
		self.setResponses = function(qrystr, responses) {
			dbg('ResProcessor setResponses', responses);
			//var qtime = new SW();
			self.reset(); //self.rslts = [];
			self.initQuery(qrystr);

			var ready = []; //kogutakse kohale jõudnud ja äratöödeldud responside promisid

			//$.each()

			dbg(self.id+ ' setResponses:', responses);
			for (var sk in responses) { //responses on {}
				var r = responses[sk]; //r on Promise

				r.id = sk; //läheb jqXHR kylge (va kui SourceOTest .then ei lase jqXHR-i edasi, siis on r lihtsalt Promise)

				var p = r.then(
					function( data, textStatus, jqXHR ) {
						//
						var sid = sk;
						//self.procResponse(jqXHR.id, data);
						self.procResponse(sid, data);
					},
					function( x1, x2, x3 ) {
						dbg(sk +' query failed: ');
						dbg('x1', (typeof x1), x1);
						dbg('x2', (typeof x2), x2);
						dbg('x3', (typeof x3), x3);
					}
				);
				p.id = sk;
				ready.push(p);
			}
			//dbg('ready: ', ready);

			var p = $.when.apply($, ready ).then(function() { //kõik responsid on tulnud
				var arr = $.makeArray( arguments );
				//dbg('when responses arrived:', arr); // [undefined, undefined] ?

				self.responsesArrived(arr, p);
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
		//käivitatakse nii mitu korda kui on src-id
		self.procResponse = function(sid, data) { //process one response
			//$.extend(self.items(), data.taisvaade);

			//dbg('ResProcessor procResponse', sid, data);
			//var o = {full: data.taisvaade, comp: data.lyhivaade};
			//dbg('o', o)
			self.rslts.push.apply(self.rslts, data.taisvaade );
			self.rsltsComp.push.apply(self.rsltsComp, data.lyhivaade );
			//console.log(self.rslts.length);
		};

		/**
		 * Processes all the results
		 * This is triggered when all responses has arrived
		 * 
		 * @method responsesArrived
		 * @param resps
		 * @param prom
		 */
		//kõik andmed on saabunud
		//overwrite?
		self.responsesArrived = function(resps, prom) {
			self.procResults(self.rslts);
		};

		//overwrite
		self.procResults = function(rslts) { //process all results

		};

		/**
		 * Delays invoking the passed function with two milliseconds
		 * 
		 * @method delay
		 * @param fn the callback function
		 */
		self.delay = function(fn) {
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
		this.id = id;
		var self = this;

		self.qry_time = ko.observable(0);
		self.qry_str = ko.observable('');

		self.rsltGrps = ko.observableArray(new Harray('id'));

		/**
		 * Returns true if results are still loading, false if finished
		 * 
		 * @method loading
		 * @return {Bool}
		 */
		self.loading = ko.pureComputed(function(){
			for (var i = 0; i < self.rsltGrps().length; i++) {
				if (self.rsltGrps()[i].loading()) {
					return true;
				}
			}
			return false;
		});

		self.active = ko.pureComputed(function(){
			for (var i = 0; i < self.rsltGrps().length; i++) {
				if (self.rsltGrps()[i].active()) {
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
		self.reslen = ko.pureComputed(function() {
			var sum = 0;
			for (var i = 0; i < self.rsltGrps().length; i++) {
				sum += self.rsltGrps()[i].reslen();
			}
			return sum;
		});

		self.addRGrp = function(grp_id, grp_o) {

			self.rsltGrps.push(grp_o);
			dbg('addRGrp:', grp_id, grp_o);
		};

	};


	/**
	 * General view component for RGs (Result Groups)
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
		var self = this;
		
		self.qry_time = ko.observable(0);
		self.qry_str = ko.observable('');
		self.loading = ko.observable(false);
		self.src_url_static_part = ko.observable('http://eki.ee/dict/qs/index.cgi?Q='); //default
		self.src_url = ko.computed(function() {
			return self.src_url_static_part() + URI.encode(self.qry_str());
		});

		self.viewComp = ko.observable(false); //view mode: comp vs full
		self.toggleView = function(char) {
			if (char === 'v') {
				self.viewComp(!self.viewComp());
			}
			return false; //ei reageeri lingile
		};
		
		// This binds the items datamodels with their HTML views as KO observers
		self.compItems = ko.observableArray(new Harray('id')); //kuvatavad objektid
		self.items = ko.observableArray(new Harray('id')); //kuvatavad objektid
		self.reslen = ko.computed(function() {
			return self.items().length;
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
		self.initQuery = function(qrystr) {
			self.qtime = new SW();
			self.loading(true);
			self.qry_str( qrystr );
		};

		/**
		 * @method showThoseItems
		 * @param rslts
		 * @return itemList
		 * @deprecated ???
		 */
		self.showThoseItems = function(rslts) {
			var itemList = [];

			for (var i = 0; i < rslts.length; i++) {
				var vi = new Result('', rslts[i]);
				itemList.push( vi );
			}

			return(itemList); //näitame uut arrayd

		};

		/**
		 * Appends every (HTML) item stored in the rslts array as
		 * a Result item that is shown in the view
		 * @method showItems
		 */
		self.showItems = function() {
			var itemList = [];
			for (var i = 0; i < self.rslts.length; i++) {
			//for (var i in self.rslts) {

				//var o = self.rslts[i];
				//dbg('self.rslts[i]', i, o);
				var vi = new Result('', self.rslts[i]);
				//var vi = new ExpandableDataItem('', '', '', '', self.rslts[i]);
				itemList.push( vi );
			}
			self.items(itemList); //näitame uut arrayd
		};

		/**
		 * @method responsesArrived
		 * @param resps
		 * @param prom
		 */
		self.responsesArrived = function(resps, prom) { //resps [undefined]
			self.procResults(self.rslts);
			self.showItems();
			self.loading(false);
			var time = self.qtime.get();
			console.log(self.id, time);
			self.qry_time(time);
			self.viewReady();
			//self.onViewReady();
		};

		self.tasksOnViewReady = [];
		/**
		 * Mediator for running tasks when view is finished loading
		 * 
		 * @method onViewReady
		 * @param {Function} fn the function to be invoked when ready
		 */
		self.onViewReady = function(fn) {
			self.tasksOnViewReady.push(fn);
		};

		/**
		 * Triggers the tasks to be run when the view is ready. For not
		 * blocking the browser, there is a short delay (2 ms) between
		 * the triggers.
		 * 
		 * @method viewReady
		 */
		self.viewReady = function() {
			//käita
			$.each(self.tasksOnViewReady, function(k, v){
				self.delay(v);
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

		var self = this;

		self.sarnased = [];
		self.reset = function() {
			self.rslts = [];
			self.sarnased = [];
		};

		/**
		 * Process the response by:
		 * 1. gather the near-synonyms
		 * 2. gather their ?
		 */
		self.procResponse = function(sid, data) { //process one response
			var r;
			//$.extend(self.items(), data.taisvaade);

			//dbg('RG_Ekn procResponse', sid, data);
			//dbg('RG_Ekn procResponse', self.rslts)

			for (var i=0; i < data.sarnased.length; i++) {
				r = data.sarnased[i];
				self.sarnased.push( r );
			}

			for (var i=0; i < data.vaade.length; i++) {
				r = data.vaade[i];
				self.rslts.push( r );
				//dbg('vaade:', r)
			}

			//var o = {full: data.taisvaade, comp: data.lyhivaade};
			//dbg('o', o)
			//self.rslts.push.apply(self.rslts, data );

			//console.log(self.rslts.length);
		};
		
		/**
		 * Show the collected near-synonyms
		 */
		self.showItems = function() {
			var itemList = [];
			for (var i = 0; i < self.rslts.length; i++) {
				//for (var i in self.rslts) {

				var o = self.rslts[i];
				//dbg('self.rslts[i]', i, o);
				var vi = new Result('', o.self, o.l);
				//var vi = new ExpandableDataItem('', '', '', '', self.rslts[i]);
				itemList.push( vi );
			}
			self.items(itemList); //näitame uut arrayd
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

		var self = this;

		CMLinker(self, id);

		self.onViewReady(function(){
			self.procLinks();
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
		var self = this;

		self.relType = {
			hypernym: "Ülemmõisted",
			hyperonym: "Ülemmõisted",
			synonym: "Sarnased",
			antonym: "Vastandid",
			hyponym: "Alammõisted"
		};
		
		/**
		 * Process the results
		 */
		self.procResponse = function(sid, data) { //process one response

			//dbg('RGThes procResponse', self.rslts)

			for (var i=0; i < data.length; i++) {
				var o = data[i];
				self.rslts.push( o );
			}

		};

		self.word_cnt = 0;
		self.reslen = ko.computed(function() {
			if (self.items().length) {
				return self.word_cnt;
			}
			return 0;
		});

		self.showItems = function() {
			var itemList = [];
			self.word_cnt = 0;
			for (var i = 0; i < self.rslts.length; i++) {
				//for (var i in self.rslts) {

				var o = self.rslts[i];
				self.word_cnt += o.words.length;

				o.ekRelType = self.relType[o.relationshipType];

				//dbg('self.rslts[i]', i, o);
				//var vi = new Result('', o);
				itemList.push( o );
			}
			self.items(itemList); //näitame uut arrayd
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

		self.word_cnt = 0;
		
		/**
		 * Processes the data coming from the Wikipedia API
		 * and pushes processed items to rslt list
		 * 
		 * @method procResponse
		 * @param sid
		 * @param data
		 */
		self.procResponse = function(sid, data) {
			// init the counter
			self.word_cnt = 0;
			
			// base url for view more
			var baseUrl = 'https://et.wikipedia.org/wiki/';
			
			// find out what kind of action we ended up with
			if ('opensearch' in data) {
				data = data['opensearch'];
				for (searchterm_i = 0; searchterm_i < data.length; searchterm_i += 2) {
					var item = {};
					var searchterm = data[searchterm_i];
					var searchtermMatches = data[searchterm_i + 1];
					
					item['content'] = 'Leiti sarnaseid: ';
					item['content'] += searchtermMatches.join(', ');
					item['content'] += '.';
					self.rslts.push(item);
				}
			} else if ('query' in data) {
				// only the query part is needed
				data = data['query'];
				
				// add the found pages to the view's list
				for (pageids_i=0; pageids_i<data['pageids'].length; pageids_i+=1) {
					var pageId = data['pageids'][pageids_i];
					var page = data['pages'][pageId];
					
					self.word_cnt += 1;
					var item = {};
					
					// if the article redirects, it should be reflected in the title
					if ('redirects' in data) {
						// we should only get length 1, but anyways we can loop it
						//for (redirects_i=0; redirects_i<data['redirects'].length; redirects_i+=1) {
							item['title'] = data['redirects'][0]['from'] + " → " + page['title'];
							item['url'] = baseUrl + data['redirects'][0]['to'];
						//}
					} else {
						item['title'] = page['title'];
						item['url'] = baseUrl + page['title'];
					}
					
					// add the extracted content
					item['content'] = page['extract'];
					// remove <hr> and trim whitespace
					item['content'] = item['content'].replace(/<hr[ ]?[/]?>/gi, '');
					item['content'] = item['content'].trim();
					
					// add the associated categories (but not blaclisted)
					item['categories'] = [];
					if ('categories' in page) {
						var categories_i;
						var categoriesLength = page['categories'].length;
						var category;
						for (categories_i = 0; categories_i < categoriesLength; categories_i += 1) {
							category = page['categories'][categories_i];
							item['categories'].push(stripNamespace(category['title']));
						}
					}
					
					self.rslts.push(item);
				}
			}
		};
		
		/**
		 * Returns the number of results
		 * 
		 * @method reslen
		 * @return {Number}
		 */
		self.reslen = ko.computed(function () {
			if (self.items().length) {
				return self.word_cnt;
			} else {
				return 0;
			}
		});
		
		/**
		 * Simple blacklist of wiki categories
		 * 
		 * @method categoryInBlacklist
		 * @param {String} category name
		 * @param {Boolean} [stripNamespace] default false
		 * @return {Boolean}
		 */
		function categoryInBlacklist(catName, stripNamespace) {
			var blacklist = [
				'',
				];
			
			if (typeof stripNamespace === 'undefined') {
				stripNamespace = false;
			}
			if (stripNamespace) {
				catName = stripNamespace(catName);
			}
			
			return (blacklist.indexOf(catName) === -1 ? false : true);;
		}
		
		/**
		 * Strips the namespace from the beginning of a wiki category name.
		 * Actually deletes everything until the first ':'.
		 * 
		 * @method stripNamespace
		 * @param {String} catName
		 * @return {String}
		 */
		 function stripNamespace(catName) {
			 var index = catName.indexOf(':');
			 
			 if (index > -1) {
				 return catName.slice(index + 1);
			 } else {
				 return catName;
			 }
		 }
		
		/**
		 * Generates a HTML serialisation of the items in the rslt array
		 * 
		 * @method showItems
		 */
		self.showItems = function() {
			
			var itemList = [];
			for (var rslts_i = 0; rslts_i < self.rslts.length; rslts_i+=1) {
				var item = self.rslts[rslts_i];
				var html = '';
				
				// title section
				if (typeof item['title'] !== 'undefined') {
					html += "<p><u>" + item['title'] + "</u></p>";
				}
				// content section
				item['content'] = item['content'].replace(/(\n)/g, '<br>');
				html += "<p>" + item['content'] + "</p>";
				// categories section REMOVED
				/*if (item['categories'].length) {
				//	html += "<p><i>Esineb kategooriates " + item['categories'].join(', ') + ".</i></p>";
				}*/
				// create read more section
				html += '<i>Loe rohkem Vikipeedias</i>';
				var vi = new Result('', html);
				//var vi = new ExpandableDataItem('', '', '', '', self.rslts[i]);
				itemList.push( vi );
			}
			self.items(itemList); //näitame uut arrayd
		};
	};
	
	/**
	 * 
	 * method getTyyp
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
		
		var self = this;
		
		self.prepTyyp = function() { //leiab ressursi / kasti kõik tyybi-lingid ja ehitab neile infomulli kylge.
		
			var res = self.id; //kontseptuaalselt vale - self.id on cat.id mitte res_id
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
				//$self.attr('data-url', 'res/tyypsonad_'+ res + '.html');
				//$self.attr('data-sel', 'res/tyypsonad_'+ res + '.html #'+ $self.text() + ' + table');
				$a.attr('data-res', res);
				$a.attr('data-tyyp', tyyp_nr);


				app.doTyypTip($a, res, '#mt'+ tyyp_nr);


			});

		};

		/*
		self.doTyypTip = function($a, res, fragm_id, tyyp_nr) {

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

		self.onViewReady(function(){
			self.prepTyyp();
		}) ;

	};

	/**
	 * Constructor Module
	 * 
	 * @class CMLinker
	 * @param self
	 * @param id
	 */
	var CMLinker = function(self, id) { //Constructor Module

		/**
		 * @method procLinks
		 */
		self.procLinks = function() {
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
		};

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

		var self = this;

		CMLinker(self, id);

		self.onViewReady(function(){
			//linkide töötlus
			self.procLinks();
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

		var self = this;

		//http://stackoverflow.com/questions/298750/how-do-i-select-text-nodes-with-jquery
		self.getTextNodesIn = function (node, includeWhitespaceNodes) {
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



		self.procLinks = function() {

			var $rs = $('#'+ id +' .result');

			$rs.each(function() {
				var myTextEl = this;

				self.delay(function() {
					// @todo: kas DOMi muudetakse iga each elemendi puhul? võib ehk kiiremaks teha
					myTextEl.innerHTML = Autolinker.link( myTextEl.innerHTML );
				});
			});
		};


		self.onViewReady(function(){
			//dbg(id+ ' onViewReady')
			//linkide töötlus
			self.procLinks();
		});


	};

	/**
	 * Resource Group for the Handbook of Estonian Language
	 * 
	 * @class RG_EKKR
	 * @uses RGView
	 * @param id
	 */
	var RG_EKKR = function RG_EKKRClosure(id) {
		RGView.apply(this, arguments);

		var self = this;

		self.trim = (function RG_EKKR_trimClosure() {
			"use strict";
			
			/**
			 * Escapes RegExp characters from inputted string by backslashing them
			 * @method escapeRegex
			 * @param {String} string
			 * @return {String}
			 * @private
			 */
			function escapeRegex(string) {
				return string.replace(/[\[\](){}?*+\^$\\.|\-]/g, "\\$&");
			}
			
			/**
			 * @method trim
			 * @param {String} str string to be trimmed?
			 * @param {String} characters to be removed from string?
			 * @param {String} [flag] RegExp flags (default "g")
			 * @param {String}
			 * @public
			 */
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
		dbg(self.trim(" - hello* trim test* +", "+*- "));
		// tagastab "hello* trim test"  ei saa aru????


		/**
		 * Returns boolean whether the inserted URI is valid or not
		 * 
		 * @method validURI
		 * @param {String} uri
		 * @return {Boolean}
		 */
		self.validURI = function(uri) {
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

			return re_weburl.test(uri);
		};


		self.onViewReady(function(){
			//linkide töötlus
			self.procLinks();
			self.procPics();
		});

		self.procLinks = function() {

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

					if (self.validURI(href)) {

					} else {
						if (self.validURI(linkText)) {
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

		self.procPics = function () {

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
		var self = this;

		self.reset();

		// ResProcessor.setResponses() kutsub välja:
		self.reset = function() {
			self.dstnctList = new ExpandableList();
			self.uniqueList = new UniqueList();
			self.foundMatch = false;
		};

		self.qry_str = '';

		self.initQuery = function(qrystr) {
			self.qtime = new SW();
			self.qry_str = qrystr;
		};

		self.getDom = function(html) {
			var wr_str_html = '<div>'+ html +'</div>';
			return $.parseHTML(wr_str_html);
		};

		self.removePunctuation = function(s) {
			//var s = "This., -/ is #! an $ % ^ & * example ;: {} of a = -_ string with `~)() punctuation";
			//var punctuationless = s.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g,"");
			var punctuationless = s.replace(/[.'´+|\[\]]/g,"");
			var finalString = punctuationless.replace(/\s{2,}/g," ");

			//myTxt = myTxt.replace(/[^a-zA-Z0-9 ]+/g, '').replace('/ {2,}/',' ');
			//myTxt = myTxt.replace(/['";:,.\/?\\-]/g, '');

			return finalString;
		};

		self.getKeywObj = function(html) {
			var d = self.getDom( html );
			var $d = $(d);
			var $span = $d.find('span.leitud_id');
			var id = $span.attr('id');
			var raw_keyw = $span.text();
			var plain_keyw = self.removePunctuation(raw_keyw);
			//dbg(id +' - '+ raw_keyw+ ' - '+ plain_keyw);
			return {
				id: id,
				keyw: plain_keyw,
				raw: raw_keyw,
				d: $d,
				html: html
			};
		};

		self.procResponse = function(sid, data) { //process one response
			//alert('procResponse')
			//$.extend(self.items(), data.taisvaade);

			//self.rslts.push.apply(self.rslts, data.taisvaade);

			//viime kokku lyhivaate ja täisvaate
			for (var i in data.taisvaade) {
				var o = self.getKeywObj( data.taisvaade[i] );
				self.dstnctList.add(sid, o.id, o.keyw, null, o.html);
			}
			for (var i in data.lyhivaade) {
				var o = self.getKeywObj( data.lyhivaade[i] );
				self.dstnctList.add(sid, o.id, o.keyw, o.html);
			}

		};

		self.procResults = function(rslts) { //process all results

			var q_s = self.qry_str;

			var foundMatch = false;
			for (var i in self.dstnctList) {
				var edi = self.dstnctList[i];
				self.uniqueList.add(edi.keyw, edi);
				//console.log("edi: "+edi.keyw);
				if (q_s == edi.keyw) {
					self.foundMatch = true;
				}

			}
			if (self.foundMatch) {
				//console.log("täpne vaste");
				// kas see on vajalik?:
				// $(".info, .social-buttons").fadeOut("slow", function(){$("#page_content").fadeIn("slow");});
				app.lm.bigword.displayed(true);
				app.lm.bigword.text(q_s);
			} else {
				//console.log('pole täpset')
				app.lm.bigword.displayed(false);
				app.lm.bigword.text('');
			}
		};
	};

	//========================================================================================


	app.configuration = {
	
		/**
		 * Definitions used for building the QueryManager
		 * @todo
		 */
		sources: {
			qs: {id: 'qs', cls: SourceOTest, abbr: 'ÕS', name: 'Eesti õigekeelsussõnaraamat'},
			ekss: {id: 'ekss', cls: SourceOTest, abbr: 'EKSS', name: 'Eesti keele seletav sõnaraamat'},
			vakk: {id: 'vakk', cls: SourceOTest, abbr: 'KNV', name: 'Keelenõuvakk'},
			ekkr: {id: 'ekkr', cls: SourceOTest, abbr: 'EKKR', name: 'Eesti Keele Käsiraamat'},
			ies: {id: 'ies', cls: SourceOTest, abbr: 'IES', name: 'Inglise-eesti masintõlkesõnastik'},
			evs: {id: 'evs', cls: SourceOTest, abbr: 'EVS', name: 'Eesti-vene sõnaraamat'},
			knabee: {id: 'knabee', cls: SourceOTest, abbr: 'KNAB', name: 'Eesti kohanimed'},
			knabmm: {id: 'knabmm', cls: SourceOTest, abbr: 'KNAB', name: 'Maailma kohanimed'},
			syn: {id: 'syn', cls: SourceOTest, abbr: 'SÜN', name: 'Sünonüümisõnastik'},
			thes: {id: 'thes', cls: SourceThesAPI, abbr: 'EWN', name: 'Eesti Wordnet'},
			ass: {id: 'ass', cls: SourceEknAPI, abbr: 'ASS', name: 'Ametniku soovitussõnastik'},
			ety: {id: 'ety', cls: SourceEknAPI, abbr: 'ETÜ', name: 'Etümoloogia sõnastik'},
			stl: {id: 'stl', cls: StlAPI, abbr: 'stl'},
			/*WiktionaryEst: {id: 'vikisonastik', cls: SourceWiktionaryEstAPI, abbr: 'Vikisõnastik', name: 'Eesti Vikisõnastik'},*/
			WikiEst: {id: 'WikiEst', cls: SourceWikiEstAPI, abbr: 'Vikipeedia', name: 'Eesti Vikipeedia'}
		},
		
		/**
		 * Definitions used for building shared processors
		 * @todo
		 */
		processors: {
			// @todo: kas keyw paneb bigword-i? jah.
			keyw: {res: ['qs', 'ekss'], proc: ProcKeyw }
		},
		
		/**
		 * Definitions for building the CategoryView objects
		 * @todo url could be returned by the source itself (after making a query, it knows the exact query_str)
		 * @todo
		 * resultCategories = {
		 *   rid: {
		 *     h: "this is the header shown in the view",
		 *     res: ["array of"],
		 *     cview: NameOfConcreteRGView,
		 *     url: "url to be assigned the button in the view, current query_str will be appended to the end of this string"
		 *   }
		 * }
		 */
		resultCategories: {
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
				WikiEst: {h: 'Eesti Vikipeedia', res: ['WikiEst'], cview: RGWikiEst, url: 'https://et.wikipedia.org/wiki/'}
			}},
			c_ekkr: {h: 'Käsiraamat', col: 2, grps: {
				ekkr: {h: 'Eesti Keele Käsiraamat', res: ['ekkr'], cview: RG_EKKR, url: 'http://www.eki.ee/books/ekk09/index.php?paring='}
			}}
		}

	};
	

	app.qm = new QueryManager_Old();
	
	var init = function(qm) {
		
		/**
		 * Building QueryManager's sources following definitions in app.configuration.sources
		 * @todo: kas kasutajal on enda defineeritud allikate hulk?
		 */
		var cs = app.configuration.sources;
		for (var key in cs) {
	
			var src = cs[key];
			var so; //source obj
			if (typeof src['cls'] === 'function') {
				so = new src.cls(key);
			} else {
				// @todo throw error;
			}
			
			// copy the initiated sources attributes from the definition
			$.extend(so, src);
			qm.addSrc(key, so);
		} 
		//qm.addSrc("qs", new EkiSource("qs"));
		

		/**
		 * Building the processors defined in app.processors
		 */
		var cp = app.configuration.processors;
		for (var cid in cp) {
	
			var pdef = cp[cid];
	
			var pr; //processor
			if (typeof pdef['proc'] === 'function') {
				pr = new pdef.proc(cid);
			}
	
			//anname processorile tema src-d
			for (var i = 0; i < pdef.res.length; i++) { //anname sisendid //pdef.res on []
				var src_id = pdef.res[i];
				pr.addSrc(src_id, qm.srcs.h[src_id]);
			}
	
			qm.addProc(cid, pr);
		}
	

		/**
		 * Building CategoryView objects defined in app.configuration.resultCategories
		 */
		var rcs = app.configuration.resultCategories;
		for (var cid in rcs) {
	
			var rc = rcs[cid];
			
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
				//dbg('gid', gid, 'new rgv', rgv);
	
				rgv.heading = g.h;
	
				if (g.url !== undefined) {
					rgv.src_url_static_part(g.url);
				}
	
				//ressursid
				for (var i = 0; i < g.res.length; i++) { //anname cv-le sisendid
					var src_id = g.res[i];
					rgv.addSrc(src_id, qm.srcs.h[src_id]);
				}
	
				catv.addRGrp(gid, rgv);
			}
	
			qm.addView(cid, catv);
		}
	
	}
	
	init(app.qm);

	//============================================================================

	/**
	 * Result items are shown in the RGView as a list
	 * RGView tarvitab
	 * 
	 * @class Result
	 * @param [id]
	 * @param [full]
	 * @param [comp]
	 * @constructor
	 */
	var Result = function(id, full, comp) {
		var self = this;
		self.id = id || Math.random().toString(36).replace(/[^a-z]+/g, '');

		self.collapsible = false;
		if (comp === undefined) {
			self.comp = full;
			self.collapsible = false;
		} else {
			self.comp = comp;
			self.collapsible = true;
		}

		self.full = full || '';
		self.expanded = ko.observable( self.collapsible ? false : true );
		
		/**
		 * Toggles the expanded state
		 * 
		 * @method toggleExp
		 */
		self.toggleExp = function() {
			self.expanded(!self.expanded());
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
		self.getHTML = function() {
			//dbg('self.expanded()', self.expanded());
			//var r;
			var r = (self.expanded()) ? self.full : self.comp;
			/*
			var ex = self.expanded();
			dbg('ex', ex);
			if (ex === true) {
				dbg('võtab full')
				r = self.full;
			} else {
				dbg('võtab comp')
				r = self.comp;
			}
			dbg('self.full', self.full);
			dbg('self.comp', self.comp);
			dbg('r', r);
			*/
			return r;
		};
		//self.HTML = ko.observable(self.getHTML());
		self.HTML = ko.computed(self.getHTML);
		//self.getCol = function() {return self.comp;};
		//self.getExp = function() {return self.full;};//self.getHTML;

		/**
		 * Returns a static string 'src?'
		 * 
		 * @method getSrc
		 * @return {string}
		 */
		self.getSrc = function() {
			return 'src?';
		};
		
		/**
		 * Returns a static empty string ''
		 * 
		 * @method srcUrl
		 * @return {string}
		 */
		self.srcURL = function() {
			return '';
		};
		
		/**
		 * Returns a static string 'Allika nimi'
		 * 
		 * @method srcTitle
		 * @return {string}
		 */
		self.srcTitle = function() {
			return 'Allika nimi';
		};
	};



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
		var self = this;
		self.id = id; //selle järgi paneb Harray.push ta hashi.
		var col = pcol || null;
		var exp = pexp || null;
		//result = result || {col: '<span></span>', exp: '<span></span>'} //collapsed, expanded
		//self.setCol(result.col);
		//self.setExp(result.exp);
		
		self.sid = sid;
		self.keyw = keyw || null;

		self.expandable = false;

		self.expanded = ko.observable(false);
		//self.HTML = ko.observable(result.col);

		/**
		 * Toggles between expanded and collapsed view
		 * 
		 * @method toggleExp
		 */
		self.toggleExp = function() {
			var self = '';
			self.expanded(!self.expanded());
			//dbg('EDI expanded toggled: '+ self.expanded() + ' ' + self);
		};
		
		/**
		 * Sets the item's column
		 * 
		 * @method setCol
		 * @param string s
		 */
		self.setCol = function(s) {
			col = s;
		};
		
		/**
		 * Sets the view as expanded
		 * 
		 * @method setExp
		 * @param s
		 */
		self.setExp = function(s) {
			exp = s;
			self.expandable = true;
		};
		
		/**
		 * Returns the column
		 * 
		 * @method getCol
		 * @return {number}
		 */
		self.getCol = function() {
			return col;
		};
		
		/**
		 * Returns boolean if the item is expanded or not
		 * 
		 * @method getExp
		 * @return {bool}
		 */
		self.getExp = function() {
			return exp;
		};

		/**
		 * @method getDefault
		 * @return {string}
		 * @deprecated
		 */
		self.getDefault = function() {
			return '[default]';
		};
		
		/**
		 * @method getHTML
		 * @return {string}
		 * @deprecated
		 */
		self.getHTML = function() {
			var html = (self.expanded() ? 
							( (exp) ? 
								self.getExp() 
							: 
								self.getDefault())
						: 
							( (col) ? 
								self.getCol() 
							: 
								self.getDefault())
					  );
			return self.id + ' ' + self.keyw + ' ' + html;
		};

		//allikas
		/**
		 * Returns the source's abbreviated name
		 * 
		 * @method getSrc
		 * @return {string}
		 */
		self.getSrc = function() {
			return sources[self.sid].abbr;
		};
		
		/**
		 * Returns a static url
		 * 
		 * @method srcUrl
		 * @return {string}
		 * @deprecated
		 */
		self.srcURL = function() {
			return 'http://www.eki.ee/dict/qs/index.cgi?F=M&Q=test';
		};
		
		/**
		 * Returns the source's name
		 * 
		 * @method srcTitle
		 * @return {string}
		 */
		self.srcTitle = function() {
			return sources[self.sid].name;
		};

	};
	
	/**
	 * @class ExpandableList
	 * @uses Harray
	 */
	var ExpandableList = function() {
		//this.keyProperty = 'id';
		//Harray.apply(this, arguments); //<- id
		var self = this;
		//self.harr = Harray('id');
		self.h = {}; //h tundub olema staatiline - 1 kõigi exemplaride peale.  
		//new ExpandableList peaks kyll tegema, aga ei tee?? Mystika!
		//loogiline, Harray konstruktor käitatakse ainult 1 kord prototyybi seadmisel.
		
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
		self.add = function(sid, id, keyw, col, exp) {
			var e;
			if (self.h[id]) {
				e = self.h[id];
				if (col) {
					e.setCol(col);
				}
				if (exp) {
					e.setExp(exp);
				}
				
			} else {
				e = new ExpandableDataItem(sid, id, keyw, col, exp);
				self.push( e );
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
		var self = this;

		self.h = O.plain(); //{};

		/**
		 * Adds an element as an ExpandableDataItem to the list only if it doesn't exist yet
		 * 
		 * @method add
		 * @param keyw
		 * @param o
		 * @return {ExpandableDataItem}
		 */
		self.add = function(keyw, o) {
			//töödelda keyw-eemaldada mittelubatud märgid
			var e; //element
			if (keyw in self.h) {
				e = self.h[keyw];
				e.exp = e.exp + o.exp;

			} else {
				e = new ExpandableDataItem('', keyw, keyw, o.col, o.exp);
				//e = new Harray('id');
				self.h[keyw] = e;
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
		self.has = function(keyw) {
			return (keyw in self.h);
		};

		/**
		 * Return the item for keyw if it exists in the list,
		 * return undefined if not found
		 * 
		 * @method get
		 * @param keyw
		 * @return {bool, undefined}
		 */
		self.get = function(keyw) {
			return (self.h[keyw]);
		};
	};


});


