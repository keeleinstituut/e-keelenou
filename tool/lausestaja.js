
jQuery(document).ready(function(){
	"use strict";
	
	// submit-nupule vajutades sooritatakse analüüs
	jQuery(":submit").click(analyzeText);
	
});

function analyzeText() {
	EKIToolkit("Lausestaja", function (EKI) {
		var textTokens, textToken, cleanToken,
			tempToken,
			i, tdi;
		
		// lisa tabeliuuendaja analüüsitulemuste jälgijaks
		EKI.addObserver(printAnalyzedText);
		
		// üksusta sisestatud tekst n.ö sõnadeks
		// NB! kuna jQuery.text() ei pruugi anda reavahetusi, siis lisame
		// nendele juba eelnevalt tühikud
		textTokens = jQuery("#usertext").html();
		textTokens = textTokens.replace(/<br>/gi, ' <br>');
		jQuery("#usertext").html(textTokens);
		textTokens = jQuery("#usertext").text();
		
		// kustuta endine tekst analüüsitulemustest
		jQuery("#analyzedtext").text('');
		
		// saada analüüsitavaks serverisse (updateHyphenatedText()
		// jooksutatakse automaatselt)
		EKI.Lausestaja.analyze(textTokens);
		
		
		/* ********** ülejäänud funktsioonid **************** */
		
		
		function printAnalyzedText () {
			/* simply iterates the displayed tokens and updates their elements */
			var i, rowText, analyzedText = EKI.Lausestaja.getTokenStorage()[0];
				table = jQuery("<table>");
			
			//~ jQuery.each(EKI.Lausestaja.getTokenStorage(), updateWordAnalysis);
			for (i=0; i<analyzedText.length; i+=1) {
				rowText = analyzedText[i];
				jQuery("<tr><td>"+rowText+"</td></tr>").appendTo(table);
			}
			jQuery("#analyzedtext").replaceWith(table);
		}
		
		
	});
}
