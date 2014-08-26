$(document).ready(function(){
	
	////////////////////////////////////
	// init values
	////////////////////////////////////
	WORDS_PER_JSON = 100;
	analyzedTokens = {};
	
	//~ $(":root").dblclick(analyzeText);
	$(":submit").click(analyzeText);
	//~ $("#usertext").dblclick(function () { $(this).stop().fadeOut("slow"); } );
});


function analyzeText () {
	// we analyze in batches of WORDS_PER_JSON
	batch = [];
	
	// tokenize inputted text
	tokens = tokenize($("#usertext").text().trim());
	
	// print one token per line and construct Elements for their morph-analyses
	$("#analyzedtext").html('');
	for (i=0; i<tokens.length; i++) {
		origToken = tokens[i];
		token = cleanToken(tokens[i]);
		token = token.toLocaleLowerCase();
		
		// create the span element for (original) token
		span = document.createElement('span'); // @todo: should do with jQuery instead
		span.className = "morphToken";
		span.innerHTML = origToken;
		
		// create the span element for morph analysis (the actual analysis will be filled later)
		$("#analyzedtext").append(span);
		span = document.createElement('span');
		span.className = "morphAnalysis";
		span.className += " " + 'morph' + token;
		$("#analyzedtext").append(span);
		
		// do we need to analyse?
		if (token == '' || (token in analyzedTokens)) continue; // skip
		// yes we do need
		// show informative text until we get the results
		span.innerHTML = "sõne analüüsitakse hetkel ..."
		
		// we analyse in batches of WORDS_PER_JSON
		batch.push(token);
		analyzedTokens[token] = null;
		if (batch.length % WORDS_PER_JSON == 0) {
			// now set up the analysis asynchronously
			morphAnalyze(batch, onMorphAnalyzed);
			batch = [];
		}
	}
	// a batch might be unsent to the analysis
	if (batch.length > 0) {
		morphAnalyze(batch, onMorphAnalyzed);
		batch = [];
	}
	// be sure all analyses are shown
	updateMorphAnalysisList();
}

function onMorphAnalyzed (data, textStatus, jqXHR) {
	/* callback function for JSON morphAnalyze,
	 * it simply extends a global hash and updates the element list */
	 
	$.extend(analyzedTokens, data);
	updateMorphAnalysisList();
}

function morphAnalyze (tokens, callback, config) {
	/* simple approach to Elgar's service */
	
	var config = config || {
		'action':					'analyys',
		'chkTuletusega':	'false',
		'chkLiitsqnaga':	'true',
		'chkSqnastikuga':	'true',
		'sone': tokens
	}
	
	$.ajax({
		type: "POST",
		//~ async: false,
		url: 'http://artur.eki.ee/morfserv/DataService.ashx',
		contentType: 'application/json; charset=utf-8',
		dataType: "json",
		data: JSON.stringify(config),
		success: callback,
		//~ timeout: 2000,
		error: function (jqXHR, textStatus, ex) {
			console.log(textStatus + "," + ex + "," + jqXHR.responseText);
		} 
	});
}


function tokenize (text) {
	/* for now simply split on whitespace */
	
	return text.split(/\s+/g);
}


function cleanToken (token) {
	/* for now simply remove all non-estonian characters */
	
	var nonChars = /[^abcdefghijklmnopqrsšzžtuvwõäöüxy]/ig;
	token = token.replace(nonChars, '');
	return token;
}


function updateMorphAnalysisList () {
	/* simply iterates the analyzed tokens and updates their elements */
	
	$.each(analyzedTokens, updateMorphAnalysis);
}


function updateMorphAnalysis (token, analysisData) {
	/* for all the json, update all corresponding 'morph'+token spans
	 * with the correct morph analysis data */

	if (analysisData == undefined) return;
	
	var params = ["Vaste", "Lemma", "Tyvi", "Vorm", "Tyyp"];
	
	var analyseHtml = '';
	$(".morph"+token).text('');
	// for each group of analysises @todo: what is this??
	for(i=0; i<analysisData.length; i++) {
		analyseGroup = analysisData[i];
		// for each possible analysis, append it to the element
		for(j=0; j<analyseGroup.length; j++) {
			analysis = analyseGroup[j];
			for(p=0; p<params.length; p++) {
				param = params[p];
				value = analysis[param];
				
				var title = '';
				switch (param) {
					case "Vorm":
					title = ' title="' + formNames(value) + '"';
					break;
					case "Tyyp":
					title = ' title="' + posNames(value.charAt(value.length-1)) + '"';
					break;
				}
				analyseHtml += '<span class="'+param+'"' + title + '>';
				analyseHtml += value;
				analyseHtml += '</span>'
			}
			analyseHtml += "<br/>\n";
		}
	}
	$(".morph"+token).html(analyseHtml);
}


function formNames (key) {
	formList = {
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
