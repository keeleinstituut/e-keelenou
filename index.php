<?php

include_once 'plib/utrack.php';
include_once 'plib/redirect.php';

	/* uudisvoo teegi laadimine ja seadistamine kasutamaks utf8 */
	define('MAGPIE_OUTPUT_ENCODING', 'UTF-8');
	require_once('plib/magpierss/rss_fetch.inc');

$domain_name = $_SERVER['SERVER_NAME'];

?><!DOCTYPE html>
<html>
	<head>
		<title>e-keelenõu</title>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
		<meta name="viewport" content="width=device-width, height=device-height, user-scalable=no">
		<meta name="eknid" content="<?php echo $uid; ?>">
	        <link rel="alternate" type="application/rss+xml" title="EKI keelenõuannete uudisvoog" href="https://keeleabi.eki.ee/feeds/nouanded.php">
	        <link rel="search" type="application/opensearchdescription+xml" title="EKI e-keelenõu" href="eki_kn.xml">
		<!--script type='text/javascript' src='//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.js'></script-->
		<script type='text/javascript' src='lib/jquery.js'></script>

		<script type='text/javascript' src='lib/knockout-3.2.0.js'></script>
		<!--
		<script type='text/javascript' src='//cdnjs.cloudflare.com/ajax/libs/knockout/2.3.0/knockout.js'></script>
		<script type='text/javascript' src='//cdnjs.cloudflare.com/ajax/libs/knockout.mapping/2.3.5/knockout.mapping.js'></script>
		<script type='text/javascript' src='//rawgithub.com/SteveSanderson/knockout.mapping/master/build/output/knockout.mapping-latest.js'></script>
		<script src="/js/jquery.form.js"></script> 
		<script type='text/javascript' src='lib/shim.js'></script>
		-->
		<link rel="stylesheet" href="css/style.css?v=1.4" />
		
		<script src="lib/jquery-ui-1.10.3.custom.min.js"></script>
		<script src="lib/jquery.iecors.js" async></script>
		
		<script type='text/javascript' src='lib/qtip/jquery.qtip.min.js'></script>
		<link rel="stylesheet" type="text/css" href="lib/qtip/jquery.qtip.css" />

		<script type='text/javascript' src="lib/jquery.cookie.min.js"></script>
		
		<link rel="stylesheet" type="text/css" href="https://www.eki.ee/ekeeleabi/css/ressursid.css?v=1.0.2" />
		<link rel="stylesheet" type="text/css" href="css/cleanstickyfooter.css" media="screen" charset="utf-8" />
		
		<script type='text/javascript' src="lib/myshim.js"></script>
		<script type='text/javascript' src='lib/harray.js'></script>
		<script type='text/javascript' src='lib/dictarr.js'></script>

		<script type='text/javascript' src='app.js?v=1.0.5'></script>
		<script type='text/javascript' src="lib/feedbform.js?v=1.0.3"></script>
		<script type='text/javascript' src="lib/javascript.js"></script>

		<script src="history.js/scripts/bundled-uncompressed/html4+html5/jquery.history.js"></script>
		<script src="lib/URI.js"></script>
		<script src="lib/Autolinker.min.js"></script>

		<link href='//fonts.googleapis.com/css?family=Open+Sans:400,700,600' rel='stylesheet' type='text/css'>
		<link href='gr/css/fontello.css' rel='stylesheet' type='text/css'>

		<script>
		$(function() {
			
			var defaultTitle = 'e-keelenõu';
			
			/**
			 * Returns a title containing search term and the site's default title
			 *
			 * @param {String} query
			 */
			var makeTitle = function(query) {
				return  query + ' [' + defaultTitle + ']';
			};

			app = new App();
			app.uid = '<?php echo $uid; ?>';

			//otsingu k2itumine
			app.queryText = ko.observable(); // @todo: setQueryTitle ??
			app.searching = ko.observable(0);// @todo: isSearching ??


			// Bind to StateChange Event
			History.Adapter.bind(window, 'statechange', function onStateChange() {
				var state = History.getState();

				//dbg('statechange:', state);
				var data = state.data;
				//dbg('data:'+ data);
				if (data['Q'] !== undefined) {
					var q = data.Q;
					app.queryText(q);
					app.plainSearch(q);
				}
			});

			var currentQuery = '';
			
			/**
			 * Creates a historical state in the browser history *if* the query
			 * is not the same as the previous state
			 *
			 * @method createState
			 * @param {String} queryText
			 */
			var createState = function(queryText) {
				if (currentQuery !== queryText) {

					//dbg('createState: ');
					var st = History.getState();
					//dbg('old state: ', st);

					var url = new URI(st.url);
					//url on olemasolev, enne uut otsingut olnud url
					
					//konstrueerime uue urli
					var map = url.search(true);
					map['Q'] = queryText;
					url.query(map); //kirjutab ?järgse osa üle 
					
					//dbg('url', url.toString())

					History.pushState(
						map,
						//{'Q': queryText},
						makeTitle(queryText),
						url.toString()
					);
					//dbg('new state: ', History.getState());

					//currentQuery = queryText;
				}
			};
			
			/**
			 * Käivitatakse lehele saabumisel, kui url sisaldab päringut
			 * @method myReplaceState
			 * @param {String} queryText
			 */
			var myReplaceState = function(queryText) {
				if (1) {

					var st = History.getState();

					//dbg('before replace state: ', st);
					dbg('st.url', st.url)
					
					var url = new URI(st.url);
					
					//url.query({ Q: queryText}); //teised param peale Q kaovad
					//dbg('url', url.toString())

					History.replaceState(
						{'Q': queryText},
						makeTitle(queryText),
						url.toString()
					);
					//kontroll, kas tegi searchi (m6nik ei tee, kui esimene historys)
					if (currentQuery !== queryText) {
						dbg('ei otsinud, otsime siis ise:', queryText) //ainult Chromes
						window.document.title = makeTitle(queryText); // @todo: setTitle()
						app.plainSearch(queryText);

					}
					dbg('after replace state: ', History.getState());

					//currentQuery = queryText;
				}
				
			};


			/**
			 * Makes the QueryManager make a search in all it's registered sources
			 * 
			 * @method plainSearch
			 * @param {String} queryStr
			 */
			app.plainSearch = function(queryStr) {
				var summq = new SW();
				app.searching(1);
				currentQuery = queryStr;
				

				var p = this.qm.searchAll(queryStr);
				$('#Q').select();

				p.then(function () {
					app.searching(0);
					$('#poscontainer').show(); //parandus
					console.log('kogu päring ' + summq.get() + "ms");
					//call was this helpful

				});

			};

			var onFirstSearch = function() {
				$('#start_content, .mobile-text').hide();
				$('#page_content').show();
			};

			//las tegeleb ainult otsimsega, ilma state'idest midagi teadmata.
			app.formSearch = function () { //ko annab parameetriks kaasa [object HTMLFormElement]

				//on first call of search() do additional tasks:
				onFirstSearch();

				app.formSearch = function () {
					var q1 = app.queryText();
					var q = q1.trim();
					if (q !== q1) {app.queryText(q);}
					createState(q);
				};

				//call actual function
				app.formSearch();

			};


			app.forms = EKN.forms;


			ko.applyBindings(app);
			$('#Q').focus();


			/*
			var q = app.getUrlParams('Q');
			if (q) {
				//defaultQuery = q;
				app.queryText(q);
				app.plainSearch(q);
			}
			*/
			var url = new URI(window.location.search);

			
			//Allikate valik ---------------------------------------------------
			
			if (url.hasQuery("frgs")) { //"forced RGs"
				var map = url.search(true);
				var frgs = map['frgs'];
				dbg('frgs:'+ frgs)
				if (frgs == '*' || frgs.length == 0) {
					app.qm.forceRGs(1); //luba kõik RGd
				} else {
					var uRGs = frgs.split(',');
					
					dbg('uRGs', uRGs, typeof uRGs)
					dbg(uRGs)
	
					if (uRGs.length > 0) {
						app.qm.forceRGs(uRGs);
					}
				}
			} else {
				//URLiga ei sunnita RG valikut.
				//vaatame kas on küpsises salvestatud
				var saved = app.qm.savedRGs();
				if (saved.length > 0) {
					//küpsises on valik
					app.qm.screenRGs(saved);
				} else {
					//ei olnud küpsises.
					//ega url ei soovita valikut?
					if (url.hasQuery("srgs")) {//"suggested RGs"
						var map = url.search(true);
						var srgs = map['srgs'];
						if (srgs == '*' || srgs.length == 0) {
							app.qm.suggestRGs(1); //luba kõik RGd
						} else {
							uRGs = srgs.split(',');
							if (uRGs.length > 0) {
								app.qm.suggestRGs(uRGs);
							}
						}
						
					} else {
						//url ei soovita,
						//võtame vaikimisi konfist
						var ids = app.configuration.getInitialRG_IDs();
						//dbg('ids confist:', ids);
						app.qm.screenRGs(ids);
					}
				}
				
			}
			//------------------------------------------------------------------
			
			if (url.hasQuery("Q")) {
				var q = url.search(true)['Q'];
				app.queryText(q);
				//app.plainSearch(q);

				onFirstSearch();

				myReplaceState(q);
				
			};

			if (url.hasQuery("u")) {
				var m_uri = url.search(true);
				delete m_uri.u;
				var s_url = url.search(m_uri).toString();
				if (s_url.length == 0) {
					//kui state-url on tühi string, siis replaceState'i ei tehta vist üldse.
					s_url = '/';
				}
				dbg('m_uri', m_uri, s_url );
				//var u = uri.search(true)['u'];
				History.replaceState(null, defaultTitle, s_url);
			};
			
			


			/*
			var addRGSources = function() {

				$.each(app.resultCategories, function( cid, o ) {
					var src_names = '';

					for (var rgk=0; rgk < o.grps.length; rgk++) { //iga RG-ga
						var rgdo = o.grps[rgk]; //RG descr obj

						for (var k=0; k < rgdo.res.length; k++) { //iga Src-ga
							var src_id = rgdo.res[k];
							var sdo = app.sources[src_id]; //src descr obj
							src_names += '<div>'+ sdo.name +'</div>'
						}
					}

					var $header = $('#' + cid + " h2");
					//$header.append('<span class="info" href="#"> i</span>' + '<div class="popup">'+ src_names +'</div>');
					$header.append('<div class="popup">'+ src_names +'</div>');
					$header.mouseenter(function(){
						$(this).children(".popup").fadeIn("slow");
					});
					$header.mouseleave(function(){
						$(this).children(".popup").fadeOut("slow");
					});
				});

			};
			addRGSources();
			*/





			//s6na tyybi infomulli tekitamine ===================================
			//qtips = [];
			app.onTyypLink(function($a, html, res) {
				//$a - <a> lingi element jquery objektina.
				//html - tyybi mulli sisu
				//res - ressursi id ('qs' v6i 'def')
				//tyyp - tyybi nr

				var qt = $a.qtip({
					overwrite: false, // Make sure the tooltip won't be overridden once created
					content: {
						text: function(event, api) {

							//api.set('content.text', html);
							//return 'Laeb...';
							return html;
						}
					},
					hide: {
						fixed: true,
						delay: 300
					},
					events: {

						render: function(event, api) {
							// Grab the tooltip element from the API elements object
							//var tooltip = api.elements.tooltip;
							var $c = api.elements.content;
							//dbg('tooltip content:', $c)
							//dbg('$c.get(0)', $c.get(0))
							//dbg('$c.get(0)', $c.get(0))
							//var div = $c.get(0);
							//dbg(div)
							//var $as = $(div).find('div');
							//var $as = $div.find('a')

							//var $as = $c.find('a')

							setTimeout(function() {
								var $as = $c.find('a[href]');
								$as.each(function() {
									var $tyyp_a = $(this);
									var fragm_id = $tyyp_a.attr('href');
									dbg(fragm_id)
									app.doTyypTip($tyyp_a, res, fragm_id);
								})
							}, 10);


							//dbg('tooltip rendered:', tooltip);

						}

					}
				});
				//dbg('qtip', qt);
				//qtips.push(qt);

			});

			//===================================================================


			/*
			var str = '-1 muu';
			var n1 = str.substr(0,str.indexOf(' '));
			dbg(parseInt());



			// inspect
			var el = $('#ffl_send').get(0);
			var events = jQuery._data(el, "events");
			dbg(events);

			jQuery.each(clickEvents, function(key, handlerObj) {
				dbg(handlerObj.handler) // alerts "function() { alert('clicked!') }"
				// also available: handlerObj.type, handlerObj.namespace
			})
			*/

			//$('#ffl_submit')



		}); //$(func)
			function show(e){
				if($(e).hasClass("closed")){
					$(e).next(".rGrpCont").css("height", "auto");
					$(e).removeClass("closed");
				}else{
					$(e).next(".rGrpCont").css("height", "0");
					$(e).addClass("closed");
				}
			}

		</script>

	</head>
	<body data-bind="with: app">
		<!--div id="preloader"> <div class="loader"></div> </div-->
		<div id="wrapper">
			<div id="content_wrapper">
				<div id="content_inner_wrapper">
					<div id="header">
						<div class="logo-wrapper">
							<div class="logo">
								<a href="/"><img src="/gr/logo/logo_eki.gif"/></a>
							</div>	
							<a class="social opacity" style="clear: both; margin-right:0;"
							   title="Soovita seda Facebookis"
							   onclick="return !window.open(this.href, 'Facebook', 'width=550,height=320')"
							   href="https://www.facebook.com/sharer/sharer.php?u=kn.eki.ee"
							   target="_blank"><img src="/gr/facebook.png" alt="Facebook"/></a>
							<a class="social opacity"
							   title="Säutsu sellest Twitteris"
							   onclick="return !window.open(this.href, 'Twitter', 'width=550,height=420')"
							   href="https://twitter.com/intent/tweet?text=e-keelenõu&amp;url=kn.eki.ee"
							   target="_blank"><img src="/gr/twitter.png" alt="twitter"/></a>
							<a class="social opacity"
							   href="mailto:?subject=e-keelenõu%20portaal&amp;body=Vaata%20%C3%BCle%20http%3A%2F%2Fkn.eki.ee%2F"
							   title="Soovita e-postiga"><img style="padding-top: 3px;" src="/gr/email.png" alt="email"/></a>
						</div>
						<div class="mobile-text">Ühispäring keeleinfot sisaldavatest allikatest</div>
						<ul id="top-bar">
							<li class="tools"><a href="#">Keeletööriistad</a>
								<ul class="submenu">
								<li><a href="http://<?php echo $domain_name ?>/tool/?m=morfoloogia">Morfoloogiline analüüs</a></li>
								<li><a href="http://<?php echo $domain_name ?>/tool/?m=silbitaja">Silbitus</a></li>
									<li><a href="/tool/?m=lausestaja">Lausestamine</a></li>
									<li><a href="/tool/?m=emo">Emotsioonidetektor</a></li>
								<li><a href="http://<?php echo $domain_name ?>/tool/?m=speech">Kõnesüntees</a></li>
									<li><a href="/tool/?m=sonastik">Oma sõnastik</a></li>
								</ul>
							</li>
							<li style="display: none;" class="sisene"><a href="#">Sisene</a>
								<div class="submenu">
									<div id="login">
										<strong>Logi sisse kasutajaga</strong>
										<input onblur="if (this.value == '') {this.value = 'Kasutajanimi';}" onfocus="if (this.value == 'Kasutajanimi') {this.value = '';}" name="login" type="text" value="Kasutajanimi"/>
										<input onblur="if (this.value == '') {this.value = 'Parool';}" onfocus="if (this.value == 'Parool') {this.value = '';}" name="password" type="text" value="Parool" />
										<a href="#" class="top_10">Registreeru</a>
										<a href="#">Unustasin parooli</a>
										<input type="button" value="Logi sisse"/>
										<div style="clear:both;"></div>
									</div>
									<div id="social-login">
										<strong>Kasuta sisselogimiseks</strong>
										<a href="#" class="facebook-login opacity"></a>
										<a href="#" class="goolge-login opacity"></a>
										<a href="#" class="twitter-login opacity"></a>
										<a href="#" class="id-login opacity"></a>
									</div>
								</div>
							</li>
							<li class="lisainfo"><a href="#">E-keelenõust</a>
								<ul class="submenu">
									<li><a href="/lisainfo/?m=keelenoust">E-keelenõu portaalist</a></li>
									<li><a href="/lisainfo/?m=allikad">Allikate valimine</a></li>
									<li><a href="https://keeleabi.eki.ee/?leht=8">Nõuandearhiiv</a></li>
									<!--
									<li><a href="/lisainfo/?m=rakendusliidesed">Rakendusliidesed</a></li>

									<li><a href="#">Statistika</a></li>
									<li><a href="/lisainfo/kasutustingimused.html">Kasutustingimused</a></li>
									-->
								</ul>
							</li>
							<!--<li><a href="keelenoust.html">E-keelenõust</a></li> -->

						</ul>
						<form data-bind="submit: formSearch" id="paring" class="topBar">
							<input data-bind="value: queryText" onblur="if (this.value == '') {this.value = 'Sisesta siia sõna või väljend';}" 
								onfocus="if (this.value == 'Sisesta siia sõna või väljend') {this.value = '';}" id="Q" name="Q" type="text" 
								placeholder="Sisesta siia sõna või väljend" autofocus="" />
							<input data-bind="style: { border: searching() ? '2px solid #ff6000' : ''}" id="otsi" value=""
								   type="submit" />
							<a id="mob-allikad" href="/lisainfo/?m=allikad" title="Allikate valik"><img id="gear"
								   src="gr/icon/1433309672_gear.svg" /></a>
						</form>
						<div class="social-buttons">
							<a class="social opacity" style="clear: both; margin-right:0;" href="https://www.eki.ee/"><img src="/gr/facebook.png" alt="facebook"/></a>
							<a class="social opacity" href="https://www.eki.ee/"><img src="/gr/twitter.png" alt="twitter"/></a>
							<a class="social opacity" href="https://www.eki.ee/"><img style="padding-top: 3px;" src="/gr/email.png" alt="email"/></a>
						</div>
						<div id="menu-wrapper">
							<ul id="menu">
								<li><a href="#c_qs">ÕS</a></li>
								<li><a href="#c_def">EKSS</a></li>
								<li><a href="#c_vsl">VSL</a></li>
								<li><a href="#c_rel">Seotud</a></li>
								<li><a href="#c_ety">Etümoloogia</a></li>
								<li><a href="#c_trans">Tõlkevasted</a></li>
								<li><a href="#c_knab">Kohanimed</a></li>
								<li><a href="#c_sugg">Soovitused</a></li>
								<li><a href="#c_ekkr">Käsiraamat</a></li>
							</ul>
						</div>

					
					</div>

					<div style="clear: both;"></div>

					<div id="start_content">
						<h1 id="bigword" style="float: center;">e-keelenõu</h1>
						<div id="info">Ühispäring keeleinfot sisaldavatest allikatest<br><br></div>
						<div id="left-column" class="poscol">
							<div class="box">
								<div class="boxHead"><h2>Keelenõuanne</h2></div>
								<div class="boxContent">
									<div class="rGrpCont">
										<div class="result">
											<p><a href="https://keeleabi.eki.ee/">Keelenõuande</a> telefonil 631 3731 vastatakse tööpäeviti kl 9–12 ja 13–17.<br>
												Keelenõu saab ka meili teel (kasuta paremal olevat nuppu vormi avamiseks) või kirjaga aadressil Eesti Keele Instituut, Roosikrantsi 6, 10119 Tallinn.

											</p>
											<p>
												<a style="color: #ff6000;" href="https://keeleabi.eki.ee/">Eesti Keele Instituudi Keelenõuanne (keeleabi.eki.ee)</a>
												<br/>
												<br/>
											</p>
		
											<div style="clear: both;"></div>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div id="right-column" class="poscol">
							<div class="box">
								<div class="boxHead"><h2>Viimased keelenõuanded</h2></div>
								<div class="boxContent">
									<div class="result">
										<?php
											/**
											 * Keelenõuannete uudisvoo viimased sissekanded
											 * @attr rss_limit {Number} kui mitu uudist näidatakse
											 */
											$rss_limit = 6;
											
											echo '<ul>';
											$rss = fetch_rss('https://keeleabi.eki.ee/feeds/nouanded.php?number='.urlencode($rss_limit));
											foreach ($rss->items as $item) {
												$title = $item['title'];
												$url   = $item['link'];
												$date  = new DateTime($item['pubdate']);
												$date  = $date->format('d.m.Y');
												echo "<li><a href=\"$url\">$title ($date)</a></li>\n";
											}
											echo '</ul>';
										?>
										
										<div style="clear: both;"></div>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div id="page_content" style="display: none">
						<!-- ko if: lm.bigword.displayed -->
						<div class="bigword"><span id="bigword" data-bind="text: lm.bigword.text"></span></div>
						<!--/ko-->

						<div id="poscontainer">

							<script type="text/html" id="box_templ">

								
								<div data-bind="'visible': active, attr: {'id': id, 'data-active': active(), 'data-reslen': reslen}" class="box col5">

									<div class="boxHead">
										<!--<span class="expBtn">[+]</span>-->

										<h2><span data-bind="text: heading">Pealkiri</span></h2>
										<!--<h2><span data-bind="text: heading">Pealkiri</span> (<span data-bind="text: reslen, attr: {title: ('Tulemusi: '+reslen() )}"></span>)</h2>-->

										<span class="boxHeadItems">
											<div class="boxHeadItem" data-bind="'if': loading()"><img src="gr/loading-spinner.gif"></div>
										</span>
									</div>

									<div class="boxContent" data-bind="css: {loading: loading() }, foreach: rsltGrps">

										<div class="resultGrp" data-bind="'if': active, attr: {'id': id}">

											<div class="rGrpHead">
												<span class="grpheading" onclick="show(this.parentElement);">
													<span data-bind="text: heading">alapealkiri</span>
													(<span data-bind="text: reslen, attr: {title: ('Tulemusi: '+reslen() )}"></span>)
												</span>

												<span class="boxHeadItems">
													<div class="boxHeadItem" data-bind="'if': loading()"><img src="gr/loading-spinner.gif"></div>
													<a target="_blank" data-bind="attr: { href: src_url, title: 'Allikas' }" class="book"></a>
												</span>
											</div>

											<div class="rGrpCont" data-bind="foreach: items">

												<!-- ko ifnot: ($data.collapsible) -->
												<div class="result">
													<!-- ko if: ($data.relationshipType) -->
													<div class="resultCont" style="clear: both">
														<div style="width: 100%;"><b data-bind="text: ekRelType">:</b></div>
														<div data-bind="foreach: words">
															<a class="vt_sarnane" data-bind="attr: {href: '?Q='+$data}, text: $data"></a>
														</div>
													</div>
													<!--/ko-->
													<!-- ko ifnot: ($data.relationshipType) -->
													<div class="resultCont" data-bind="html: HTML">

													</div>
													<!--/ko-->

												</div>
												<!--/ko-->

												<!-- ko if: ($data.collapsible) -->
												<div class="result">
													<div style="width: 10%;">
														<a href="#" class="expBtn" data-bind="click: toggleExp">[<span data-bind="text: expanded() ? '-' : '+' "></span>]</a>
													</div>
													<div class="resultCont" data-bind="html: HTML" data-x="html: (expanded ? getExp() : getCol() )">

													</div>
													<!--<div style="clear: both;"></div>
													<div class="res_src"><a target="_blank" data-bind="attr: { href: srcURL(), title: srcTitle() }, html: getSrc()">src</a></div>-->
												</div>
												<!--/ko-->


											</div>
											<div style="clear: both;"></div>
											<div class="rGrpFoot"></div>

										</div>

									</div>

								</div>
								

							</script>

							<div id="poscol1" class="poscol" data-bind="template: { name: 'box_templ', foreach: lm.col1 }"></div>
							<div id="poscol2" class="poscol" data-bind="template: { name: 'box_templ', foreach: lm.col2 }"></div>

						</div>

						<div id="helpful">
							<div class="comment-content" id="helpful-question">
								Kas leidsite, mida otsisite?<br/>
								<input type="button" value="Jah" data-feedback="y"/>
								<input type="button" value="Ei" data-feedback="n"/>
							</div>
							<div class="comment-content" id="helpful-why_n">
								Mida me saaksime paremini teha?
								<textarea id="why_n" style="width: 230px; height: 60px;"></textarea>
								<input type="button" value="Saada" data-feedback="s"/>
							</div>
							<div class="comment-content" id="helpful-response">
								Täname vastamast!
							</div>
						</div>

					</div>
				</div>
			</div>
			<div id="tagasiside" class="opacity form-button"></div>
			<!--<div id="language" class="opacity form-button"></div>-->
			<div class="tagasiside">
				<div id="feedback">
					<div id="feedback-form">
						<h2>Küsi Eesti Keele Instituudi keelenõuandjatelt.</h2>
						<form id="f_feedback_dev" method="POST" data-addr="lang"
							data-bind="submit: app.forms.sendForm"
							action="//kn.eki.ee/kn/spam.php">
							<input type="hidden" name="checkme" value="formmail">
							<div class="left small">
								<label for="ffd_nimi">Nimi</label>
								<input type="text" name="nimi" id="ffd_nimi">
							</div>
							<div class="left small">
								<label for="ffd_email">E-post</label>
								<input type="email" name="email" id="ffd_email">
							</div>
							<div class="left big">
								<label for="ffd_teema">Teema</label>
								<input type="text" name="teema" id="ffd_teema">
							</div>
							<div>
								<label for="ffd_comment">Küsimus või kommentaar</label>
								<textarea name="kiri" id="ffd_comment"></textarea>
							</div>
							<div class="spam-control">
								<!--<span>Täna on selle nädala </span><input type="text" name="np"/><span> päev</span>.-->
								<span>&nbsp;</span>
							</div>
							<div class="feedback-footer">
								<span class="f_message"></span>
								<input class="" type="submit" value="Saada" name="saada"/>
								<input class="send" type="hidden" value="vuid" name="uid"/>
							</div>
						</form>
					</div>
					<div class="close opacity"></div>
				</div>
			</div>
			<!--
			<div class="language">
				<div id="feedback">
					<div id="feedback-form">
						<h2>Küsi Eesti Keele Instituudi keelenõuandjatelt.</h2>
						<form id="f_feedback_lang" method="POST" data-addr="lang"
						  data-bind="submit: app.forms.sendForm"
						  action="//kn.eki.ee/kn/spam.php">
							<input type="hidden" name="checkme" value="formmail">
							<div class="left small">
								<label for="ffl_nimi">Nimi</label>
								<input type="text" name="nimi" id="ffl_nimi">
							</div>
							<div class="left small">
								<label for="ffl_email">E-mail</label>
								<input type="email" name="email" id="ffl_email">
							</div>
							<div class="left big">
								<label for="ffl_teema">Teema</label>
								<input type="text" name="teema" id="ffl_teema">
							</div>
							<div>
								<label for="ffl_comment">Küsimus või kommentaar</label>
								<textarea name="kiri" id="ffl_comment"></textarea>
							</div>
							<div class="spam-control">

								<span>&nbsp;</span>
							</div>
							<div class="feedback-footer">
								<span class="f_message"></span>
								<input class="" type="submit" value="Saada" name="saada"/>
								<input class="send" type="hidden" value="vuid" name="uid"/>
							</div>
						</form>
					</div>
					<div class="close opacity"></div>
				</div>
			</div>
			-->
			<div id="full-screen"></div>
			<div style="clear:both"></div>
			<div id="page-up"></div> 
		</div> 
		
		<div id="footer_wrapper"> 
			<div id="footer_inner_wrapper">
				<div id="footer">
					<div id="footer_l">
						<div id="footer_r">
							<p id="syndicate">
								<a href="https://portaal.eki.ee/">Eesti Keele Instituut</a><br/>
								Roosikrantsi 6, 10119 Tallinn.
							</p>
							<p id="power_by">
								E-post: <a href="mailto:eki@eki.ee">eki@eki.ee</a><br/>
								tel: 6177500
							</p>
						</div>
					</div>
				</div>
			</div>
			<div style="clear:both"></div>

		</div>


		<script>
			setTimeout(function(){
				(function(w,d,s,u,g,a,m){
					w['GoogleAnalyticsObject'] = g;
					w[g] = w[g]||function(){
						(w[g].q = w[g].q||[]).push(arguments)
					},
					w[g].l = 1*new Date();
					a = d.createElement(s), m = d.getElementsByTagName(s)[0];
					a.async=1;
					a.src = u;
					m.parentNode.insertBefore(a, m)
				})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
				ga('create', 'UA-41617938-2');
				ga('send', 'pageview');
			},1500);
		</script>
	</body>
</html>
