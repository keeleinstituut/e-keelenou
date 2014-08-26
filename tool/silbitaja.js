
jQuery(document).ready(function(){
	"use strict";
	
	// submit-nupule vajutades sooritatakse analüüs
	jQuery(":submit").click(analyzeText);
	
});

function analyzeText() {
	EKIToolkit("Hyphenate", function (EKI) {
		var textTokens, textToken, cleanToken,
			tempToken,
			i, tdi;
		
		// lisa tabeliuuendaja analüüsitulemuste jälgijaks
		EKI.addObserver(updateHyphenatedText);
		
		// üksusta sisestatud tekst n.ö sõnadeks
		// NB! kuna jQuery.text() ei pruugi anda reavahetusi, siis lisame
		// nendele juba eelnevalt tühikud
		textTokens = jQuery("#usertext").html();
		textTokens = textTokens.replace(/<br>/gi, ' <br>');
		jQuery("#usertext").html(textTokens);
		// nüüd saadame üksustamisele
		textTokens = EKI.utils.simpleTokenizer(jQuery("#usertext").text());
		
		// kustuta endine tekst analüüsitulemustest
		jQuery("#analyzedtext").text('');
		
		// käi iga tekstisõna läbi ja lisa see analüüsitavate järjekorda
		// samuti lisa see analüüsi-kasti
		for (i=0; i<textTokens.length; i+=1) {
			textToken = textTokens[i];
			cleanToken = EKI.Hyphenate.cleanToken(textToken);
			EKI.Hyphenate.addToken(cleanToken);
			tempToken = jQuery("<span>").addClass("token"+cleanToken); //.text(cleanToken);
			jQuery(tempToken).appendTo("#analyzedtext");
			// lisa tühik :(
			jQuery("#analyzedtext").html(jQuery("#analyzedtext").html() + " ");
		}
		// saada analüüsitavaks serverisse (updateHyphenatedText()
		// jooksutatakse automaatselt)
		EKI.Hyphenate.analyze();
		
		
		/* ********** ülejäänud funktsioonid **************** */
		
		
		function updateHyphenatedText () {
			/* simply iterates the displayed tokens and updates their elements */
			var i;
			
			jQuery.each(EKI.Hyphenate.getTokenStorage(), updateWordAnalysis);
		}
		
		function updateWordAnalysis (token, analysisData) {
			/* simply swaps the content of the span(s) */
			var hyphenated = analysisData[0]['Silbitus'],
				span;
			
			span = jQuery(".token"+token);
			span.text(hyphenated);
			// if multiple analysis exists, make them selectable through a menu
			if (analysisData.length > 1) {
				//~ span.wrapInner('<a href="#">').click(toggleMenu);
				span.addClass('multiple').click(toggleMenu);
			}
		}
		
		function toggleMenu (event) {
			/**
			 * toggles a context menu for choosing among many analysises
			 */
			var menu = jQuery(this).children("#selectMenu"),
				token, hyphenatedToken, analysisArray = [], analysis,
				i;
			
			// if the menu exists, get the marked value, then close and destroy
			if (menu.length) {
				// replace span text with checked value
				jQuery(this).text(jQuery(menu).find(":checked").attr('value'));
				// toggle and then remove the menu element
				menu.slideUp('fast').promise().done(function() { this.remove(); });
				
			} else {
				// otherwise generate menu with possible analysis variants
				menu = jQuery('<div id="selectMenu" class="menu">');
				menu.hide(); // don't show yet
				
				// position the menu after it's parent
			  menu.offset(jQuery(this).position());
				
				// populate the menu with values
				hyphenatedToken = jQuery(this).text();
				token = hyphenatedToken.replace(/-/g, '');
				analysisArray = EKI.Hyphenate.getTokenAnalysis(token);
				for (i=0; i<analysisArray.length; i+=1) {
					analysis = analysisArray[i]['Silbitus'];
					
					if (analysis == hyphenatedToken) { // mark the one currently displayed
						jQuery(menu).append('<input type="radio" name="choice" value="'+analysis+'" checked="checked"/>');
					} else {
						jQuery(menu).append('<input type="radio" name="choice"  value="'+analysis+'"/>');
					}
					jQuery(menu).append(analysis);
					jQuery(menu).append("<br/>");
				}
				
				// place the menu where it was called and toggle it
				jQuery(this).append(menu);
				menu.slideDown('fast');
			}
		}
		
		
	});
}
