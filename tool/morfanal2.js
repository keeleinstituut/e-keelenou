"use strict";

// seadista morfoloogiline analüsaator
var ma = jsEKIMorphAnalyzer();


function jsEKIMorphAnalyzer (config) {
	/* This is the MorphAnalyzer constructor */
	
	/* observerList contains callbacks to launch after analysis */
	var observerList = [],
		/* holds the set of morphologically analyzed tokens */
		tokenStorage = {},
		/* holds up to JSONBatchsize tokens to be sent to analysis */
		analyzeBatch = [],
		/* holds tokens sent, but whose analysis hasn't been registered yet */
		tokensWaitingForAnalysis = [],
		/* @todo: this is not used? to be removed */
		waitingForJSON = false,
		/* holds the config */
		config = config || {
			'action':					'analyys',
			'chkTuletusega':	false,
			'chkLiitsqnaga':	true,
			'chkSqnastikuga':	true,
			'JSONBatchsize':	100,
			'JSONRetries':		3
		};
	/* holds the set of analyzed tokens */
	//~ var tokenStorage = {}; // @todo: rename to tokenAnalysisStorage
	/* holds the set of un-analyzed tokens */
	//~ var analyzeBatch = [];
	//~ var tokensWaitingForAnalysis = [];
	/* holds the client's observing functions */
	//~ var observerList = [];
	//~ var waitingForJSON = false; // @todo: not used? delete it
	
	/* *************************************************************** */
	
	function addToken (token) {
		/* Adds the token to be analyzed
		 * returns true if token was added
		 * returns false if token was '' or allready present */
		
		/* kuna EKI morfoloogia analüüsija sisendiks on ainult eesti tähed,
		 * koristame kõik ülejäänud ära */
		var token = cleanToken(token);

		if ((token == '') || // don't accept empty tokens, nor
			  (token in tokenStorage) || // token allready analyzed, nor
			  (analyzeBatch.indexOf(token) != -1) || // token allready in the batch, nor
			  (tokensWaitingForAnalysis.indexOf(token) != -1)) { // token waiting for analysis
					return false;
		}
		analyzeBatch.push(token);
		
		// if the batch is full, send it for analysis
		if (analyzeBatch.length >= config.JSONBatchsize) {
			analyze();
		}
		return true;
	}
	
	
	function cleanToken (token) {
		/* for now simply remove all non-estonian characters and make it
		 * lowercased. */
		
		var token = token || '';
		var nonChars = /[^abcdefghijklmnopqrsšzžtuvwõäöüxy]/ig;
		
		token = token.replace(nonChars, '');
		token = token.trim().toLocaleLowerCase();
		return token;
	}
	
	
	function analyze () { // @todo: calling this multiplies lines in output! should we clear the table somewhere first?
		/* Sends all unanalyzed tokens to the server to be analyzed.
		 * Analysis is done using the current config */
		
		// see if we need to analyze anything
		if (analyzeBatch.length > 0) {
			tokensWaitingForAnalysis = tokensWaitingForAnalysis.concat(analyzeBatch);
			EKIMorfservJSONRequest(analyzeBatch);
			analyzeBatch = [];
		} else {
			// otherwise just notify the subscribed observers directly
			notifyObservers();
		}
	}
	
	
	function onJSONReplySUCCESS (data, textStatus, jqXHR) {
		/* This function is called on a positive reply from the server. It
		 * adds the analysises to the tokenStorage and notifies all 
		 * observers. */
		 
		// extend tokenStorage @todo: remove jQuery
		jQuery.extend(tokenStorage, data);
	
		// remove all the tokens that have been successfully analyzed from
		// the tokensWaitingForAnalysis
		tokensWaitingForAnalysis = tokensWaitingForAnalysis.filter(
			function (token) {
				return !(token in tokenStorage);
			});
		
		// @todo: notifyObservers only if the tokenStorage changed it's state
		notifyObservers();
	}
	
	
	function onJSONReplyERROR (jqXHR, textStatus, ex) {
		/* This function is called on a negative reply from the serve. It
		 * tries 3 times to re-analyze before giving up.
		 * @todo: NOT IMPLEMENTED! */
		
		// @todo: should we try re-analyze only previously sent tokens, or
		//        all un-analyzed tokens?
		//~ console.log(textStatus + "," + ex + "," + jqXHR.responseText);
		console.log('JSON ERROR ' + textStatus);
	}
	
	
	function notifyObservers() {
		/* Notifies the all the observers when an update has been made */
		var i, observerFunct;
		
		for (i=0; i<observerList.length; i++) {
			observerFunct = observerList[i];
			observerFunct();
		}
	}
	
	
	function emptyTokenStorage () {
		/* Simply empties the tokenStorage */
		
		tokenStorage = {};
	}
	
	
	function getTokenMorphList () {
		/* Returns the tokenStorage */
		
		return tokenStorage;
	}
	
	
	function EKIMorfservJSONRequest (tokens) {
		/* HIDDEN simple approach to Elgar's service */
		
		config['sone'] = tokens;
		
		jQuery.ajax({
			type: "POST",
			async: true,
			url: 'http://artur.eki.ee/morfserv/DataService.ashx',
			contentType: 'application/json; charset=utf-8',
			dataType: "json",
			data: JSON.stringify(config),
			timeout: 2000,
			success: onJSONReplySUCCESS,
			error: onJSONReplyERROR 
		});
	}
	
	
	function setConfig (confKey, confValue) {
		/* Sets the config according to newConfig object. Available variables:
		 * - useCompoundDetection
		 * - useDictionary
		 * - useDerivationGuessing */
		
		// @todo: we should do error checking that throws something!
		config[confKey] = confValue;
		console.log(config); // @todo: remove before production
	}
	
	
	function addObserver (callback) {
		/* Adds a client function callback that is called whe updated */
		
		if (!(callback in observerList)) {
			observerList.push(callback);
			console.log('added observer');
			return true;
		} else {
			console.log('observer allready subscribed');
			return false;
		}
	}
	
	
	function formNames (key) {
		/* simply looks up the key in a list and returns the value or empty
		 * if not found */
		 
		var formList = {
			"??":					"määramatu vorm",
			"Fpref":			"prefiks",
			"Ger":				"des-vorm",
			"ID":					"muutumatu sõna (indekl)",
			"Ilyhi":			"muutumatu sõna lühitüvi",
			"IM_sA":			"im-tuletis (ülivõrre)",
			"ImpPrIps":		"käskiva kõneviisi oleviku umbisikuline tegumood",
			"ImpPrN":			"käskiva kõneviisi oleviku isikulise tegumoe eitus",
			"ImpPrPl1":		"käskiva kõneviisi oleviku mitmuse 1.p.",
			"ImpPrPl1N":	"käskiva kõneviisi oleviku mitmuse 1.p. eitus",
			"ImpPrPl2":		"käskiva kõneviisi oleviku mitmuse 2.p.",
			"ImpPrPl2N":	"käskiva kõneviisi oleviku mitmuse 2.p. eitus",
			"ImpPrPs":		"käskiva kõneviisi oleviku isikuline tegumood",
			"ImpPrSg2":		"käskiva kõneviisi oleviku ainsuse 2.p.",
			"ImpPrSg2N":	"käskiva kõneviisi oleviku ainsuse 2.p. eitus",
			"IndIpfIps":	"kindla kõneviisi lihtmineviku umbisikuline tegumood",
			"IndIpfIpsN":	"poldud",
			"IndIpfPl1":	"kindla kõneviisi lihtmineviku mitmuse 1.p.",
			"IndIpfPl2":	"kindla kõneviisi lihtmineviku mitmuse 2.p.",
			"IndIpfPl3":	"kindla kõneviisi lihtmineviku mitmuse 3.p.",
			"IndIpfPsN":	"polnud",
			"IndIpfSg1":	"kindla kõneviisi lihtmineviku ainsuse 1.p.",
			"IndIpfSg2":	"kindla kõneviisi lihtmineviku ainsuse 2.p.",
			"IndIpfSg3":	"kindla kõneviisi lihtmineviku ainsuse 3.p.",
			"IndPrIps":		"kindla kõneviisi oleviku umbisikuline tegumood",
			"IndPrIps_":	"kindla kõneviisi oleviku umbisikuline tegumood (eitusega)",
			"IndPrIpsN":	"polda",
			"IndPrPl1":		"kindla kõneviisi oleviku mitmuse 1.p.",
			"IndPrPl2":		"kindla kõneviisi oleviku mitmuse 2.p.",
			"IndPrPl3":		"kindla kõneviisi oleviku mitmuse 3.p.",
			"IndPrPs_":		"kindla kõneviisi oleviku isikuline tegumood (eitusega)",
			"IndPrPsN":		"pole",
			"IndPrSg1":		"kindla kõneviisi oleviku ainsuse 1.pööre",
			"IndPrSg2":		"kindla kõneviisi oleviku ainsuse 2.p.",
			"IndPrSg3":		"kindla kõneviisi oleviku ainsuse 3.p.",
			"Inf":				"da-infinitiiv e da-tegevusnimi",
			"Ivahe":			"muutumatu sõna vahehäälikuga vorm",
			"JA_vS":			"ja-tuletis (tegijanimi)",
			"KE_dA":			"ke-tuletis",
			"KE_dS":			"ke-tuletis",
			"KENE_dA":		"kene-tuletis",
			"KENE_dS":		"kene-tuletis",
			"KndPrIps":		"tingiva kõneviisi oleviku umbisikuline tegumood",
			"KndPrPl1":		"tingiva kõneviisi oleviku mitmuse 1.p.",
			"KndPrPl2":		"tingiva kõneviisi oleviku mitmuse 2.p.",
			"KndPrPl3":		"tingiva kõneviisi oleviku mitmuse 3.p.",
			"KndPrPs":		"tingiva kõneviisi oleviku isikuline tegumood",
			"KndPrPsN":		"poleks",
			"KndPrSg1":		"tingiva kõneviisi oleviku ainsuse 1.p.",
			"KndPrSg2":		"tingiva kõneviisi oleviku ainsuse 2.p.",
			"KndPtIps":		"tingiva kõneviisi mineviku umbisikuline tegumood",
			"KndPtPl1":		"tingiva kõneviisi mineviku mitmuse 1.p.",
			"KndPtPl2":		"tingiva kõneviisi mineviku mitmuse 2.p.",
			"KndPtPl3":		"tingiva kõneviisi mineviku mitmuse 3.p.",
			"KndPtPs":		"tingiva kõneviisi mineviku isikuline tegumood",
			"KndPtPsN":		"polnuks",
			"KndPtSg1":		"tingiva kõneviisi mineviku ainsuse 1.p.",
			"KndPtSg2":		"tingiva kõneviisi mineviku ainsuse 2.p.",
			"KvtPrIps":		"kaudse kõneviisi oleviku umbisikuline tegumood",
			"KvtPrPs":		"kaudse kõneviisi oleviku isikuline tegumood",
			"KvtPrPsN":		"polevat",
			"KvtPtIps":		"kaudse kõneviisi mineviku umbisikuline tegumood",
			"KvtPtPs":		"kaudse kõneviisi mineviku isikuline tegumood",
			"KvtPtPsN":		"polnuvat",
			"LINE_aA":		"line-tuletis",
			"LT_mD":			"lt-tuletis",
			"M_cA":				"m-tuletis (keskvõrre)",
			"MATA_vA":		"mata-tuletis",
			"MATU_vA":		"matu-tuletis",
			"MINE_vS":		"mine-tuletis (teonimi)",
			"MUS_vS":			"mus-tuletis",
			"NE_aA":			"ne-tuletis",
			"Neg":				"eitus",
			"Nlyhi":			"noomeni lühitüvi",
			"NU_vS":			"nu-tuletis",
			"NUD_vA":			"nud-tuletis",
			"Nvahe":			"noomeni vahehäälikuga vorm",
			"PlAb":				"mitmuse ilmaütlev",
			"PlAbl":			"mitmuse alaltütlev",
			"PlAd":				"mitmuse alalütlev",
			"PlAll":			"mitmuse alaleütlev",
			"PlEl":				"mitmuse seestütlev",
			"PlEs":				"mitmuse olev",
			"PlG":				"mitmuse omastav",
			"PlIll":			"mitmuse sisseütlev",
			"PlIn":				"mitmuse seesütlev",
			"PlKom":			"mitmuse kaasaütlev",
			"PlN":				"mitmuse nimetav",
			"PlP":				"mitmuse osastav",
			"PlTer":			"mitmuse rajav",
			"PlTr":				"mitmuse saav",
			"PtsPrIps":		"oleviku umbisikuline kesksõna e tav-kesksõna",
			"PtsPrPs":		"oleviku isikuline kesksõna e v-kesksõna",
			"PtsPtIps":		"mineviku umbisikuline kesksõna e tud-kesksõna",
			"PtsPtPs":		"mineviku isikuline kesksõna e nud-kesksõna",
			"Qunik":			"seotud / unikaalne tüvi",
			"Rpl":				"vokaalmitmuse tüvi",
			"SgAb":				"ainsuse ilmaütlev",
			"SgAbl":			"ainsuse alaltütlev",
			"SgAd":				"ainsuse alalütlev",
			"SgAdt":			"ainsuse suunduv e lühike sisseütlev",
			"SgAll":			"ainsuse alaleütlev",
			"SgEl":				"ainsuse seestütlev",
			"SgEs":				"ainsuse olev",
			"SgG":				"ainsuse omastav",
			"SgIll":			"ainsuse sisseütlev",
			"SgIn":				"ainsuse seesütlev",
			"SgKom":			"ainsuse kaasaütlev",
			"SgN":				"ainsuse nimetav",
			"SgP":				"ainsuse osastav",
			"SgTer":			"ainsuse rajav",
			"SgTr":				"ainsuse saav",
			"Sup":				"ma-infinitiiv e ma-tegevusnimi",
			"SupAb":			"mata-vorm",
			"SupEl":			"mast-vorm",
			"SupIn":			"mas-vorm",
			"SupIps":			"ma-tegevusnime umbisikuline tegumood",
			"SupTr":			"maks-vorm",
			"TAMATU_vA":	"tamatu-tuletis",
			"TAV_vAS":		"tav-tuletis",
			"TU1_vS":			"tu-tuletis (tegevuse objekt)",
			"TU2_kA":			"tu-tuletis (omadus)",
			"TUD_vA":			"tud-tuletis",
			"US_aS":			"us-tuletis (omadus)",
			"US_vS":			"us-tuletis (tegevus)",
			"V_vA":				"v-tuletis",
			"Vlyhi":			"verbi lühitüvi",
			"Vvahe":			"verbi vahehäälikuga vorm"
		}
		return formList[key] || '';
	}
	
	
	function posNames (key) {
		/* simply looks up the key in a list and returns the value or empty
		 * if not found */
		 
		var posList = {
			"A": "omadussõna",
			"D": "määrsõna",
			"G": "omastavaline täiend",
			"H": "pärisnimi",
			"I": "hüüdsõna",
			"J": "sidesõna",
			"K": "kaassõna",
			"N": "põhiarvsõna",
			"O": "järgarvsõna",
			"P": "asesõna",
			"S": "nimisõna",
			"V": "tegusõna"
		}
		return posList[key] || '';
	}
	
	
	return {
		/* this is the public interface */
		setConfig: setConfig,
		emptyTokenStorage: emptyTokenStorage,
		addToken: addToken,
		getTokenMorphList: getTokenMorphList,
		analyze: analyze,
		addObserver: addObserver,
		getPosName: posNames,
		getFormName: formNames,
		cleanToken: cleanToken,
		EKIMorfservJSONRequest: EKIMorfservJSONRequest
	};
};


/* **************************************************************** */

jQuery(document).ready(function(){
	
	// the 'ma' morph analyzer has been set up globally (file beginning)
	ma.addObserver(updateMorphAnalysisList);
	
	jQuery(":submit").click(analyzeTextTable);
	
	// set up the config according to the checkboxes
	
	jQuery("input:checkbox").change(function() {
		var name = jQuery(this).attr('name'),
			 state = jQuery(this).prop("checked");
		
		ma.setConfig(name, state);
	});
	
});


/* ***************************************************************** */



function analyzeTextTable () {
	/* this is the main program */
	
	var textTokens,
		table = jQuery("<table>"),
		tbody, tr, td,
		params = ["Sõne", "Vaste", "Lemma", "Tyvi", "Vorm", "Tyyp"],
		param,
		thead = jQuery("<thead>"),
		theadrow = jQuery("<tr>"),
		textToken, cleanToken,
		i, tdi;
	
	// tokenize inputted text
	textTokens = tokenizer(jQuery("#usertext").text());
	
	// clear the placeholder
	jQuery("#analyzedtext").html('');
	
	// print one token per line and construct Elements for their morph-analyses
	table.appendTo("#analyzedtext");
	
	jQuery(theadrow).appendTo(thead);
	
	for (i=0; i<params.length; i+=1) {
		param = params[i];
		jQuery("<th>").addClass(param).text(param).appendTo(theadrow);
	}
	jQuery(theadrow).appendTo(thead);
	jQuery(thead).appendTo(table);
	tbody = jQuery("<tbody>").appendTo(table);
	
	for (i=0; i<textTokens.length; i++) {
		textToken = textTokens[i];
		cleanToken = ma.cleanToken(textToken);
		ma.addToken(cleanToken);
		
		tr = document.createElement("tr");
		tr.className = "morph"+cleanToken;
		jQuery(tr).appendTo(tbody);
		
		// create the span element for (original) token
		td = document.createElement("td");
		td.className = "morphToken";
		td.innerHTML = textToken;
		jQuery(td).appendTo(tr);
		
		// create 4 td elements for the morph analysises
		// (the actual analysis will be filled later)
		tdi = 4;
		while(tdi>0) {
			td = document.createElement("td");
			td.className = "morphAnalysis";
			td.innerHTML = "...";
			jQuery(td).appendTo(tr);
			tdi -= 1;
		}
		jQuery(tr).appendTo(tbody);
	}
	// send to analyze
	ma.analyze();
}


function tokenizer (text) {
	/* The tokenizer chunks the text into tokens that are analyzed
	 * by the morphological analyzer. By default the tokenizer
	 * chunks tokens simply by whitespace, but this can be
	 * over-ridden by any function that returns an array of tokens */
	 
	 var tokenized_text = text;
	 tokenized_text = tokenized_text.split(/\s+/g);
	 
	 // ... we could for example remove duplicates here ...
	 
	 return tokenized_text;
}


function updateMorphAnalysisList () {
	/* simply iterates the analyzed tokens and updates their elements */
	
	jQuery.each(ma.getTokenMorphList(), updateMorphAnalysisTable);
}


function updateMorphAnalysisTable (token, analysisData) {
	/* Makes a new table row for the token and its analysis. The new row
	 * replace the old one(s) */
	
	if (analysisData == undefined) {
		console.log('No analysisData sent to updateMorphAnalysisTable');
		return;
	}

	var params = ["Vaste", "Lemma", "Tyvi", "Vorm", "Tyyp"], param,
		tokenRow, rowspan, tokenRows, td, tokenCell, value,
		analyzeGroup, analysis,
		i, j, p;
	
	// make a new tokenRow to replace the current tokenRow
	// the tokenRow rowspan will be set according to amount of analysises
	tokenRow = jQuery("<tr>");
	rowspan = 0;
	tokenRows = [];
	
	// HTML tables only the first row of a multiple rowspan row gets
	// the first column's tabledata (td)
	td = tokenCell = jQuery("<td>");
	jQuery(td).addClass("morphToken");
	jQuery(td).text(token);
	jQuery(td).appendTo(tokenRow);
	
	// for each group of analysises
	for(i=0; i<analysisData.length; i+=1) {
		analyzeGroup = analysisData[i];
		// for each possible analysis, append it to the element
		for(j=0; j<analyzeGroup.length; j+=1) {
			tokenRow.addClass("morph"+token);
			tokenRow.addClass("morphRow");
			analysis = analyzeGroup[j];
			for(p=0; p<params.length; p+=1) {
				// make td element for each column (except the first)
				param = params[p];
				value = analysis[param];
				td = jQuery("<td>");
				
				switch (param) {
					case "Vorm":
					jQuery(td).attr("title", ma.getFormName(value));
					break;
					case "Tyyp":
					// @todo: don't do here, but split this before
					jQuery(td).attr("title", ma.getPosName(value.charAt(value.length-1)));
					break;
				}
				
				jQuery(td).addClass(param);
				jQuery(td).text(value);
				jQuery(td).appendTo(tokenRow);
			}
			tokenRows.push(tokenRow);
			tokenRow = jQuery("<tr>"); // @todo: is this a memory leak?
		}
	}
	
	// change the rowspan if needed
	if (tokenRows.length > 1) {
		tokenCell.attr('rowspan', tokenRows.length);
	}
	
	// replace all the old table rows with this new one
	jQuery(".morph"+token).replaceWith(tokenRows);
}

