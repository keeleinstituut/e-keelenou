
jQuery(document).ready(function(){
	"use strict";
	
	// submit-nupule vajutades sooritatakse analüüs
	jQuery(":submit").click(analyzeTextTable);
	
	// valikud kajastatakse moodulis
	jQuery("input:checkbox").change(function() {
		var name = jQuery(this).attr('name'),
			 state = jQuery(this).prop("checked");
		
		EKIToolkit("Quant", function (EKI) {
			EKI.Quant.setConfig(name, state); // @todo: ei salvestu
		});
	});
});

function analyzeTextTable() {
	EKIToolkit("Quant", function (EKI) {
		var textTokens,
			table = jQuery("<table>"),
			tbody, tr, td, rowId,
			params = ["Sõne", /*"Vaste",*/ "Kuju", "Tyyp"],
			param,
			thead = jQuery("<thead>"),
			theadrow = jQuery("<tr>"),
			textToken, cleanToken,
			i, tdi;
		
		// lisa tabeliuuendaja morfanalüüside jälgijaks
		EKI.addObserver(updateQuantAnalysisList);
		
		// lisa kiire viis kuidas mõningaid infokilde kuhugi salvestada
		EKI.tmp = EKI.tmp || {};
		EKI.tmp.rowspan = EKI.tmp.rowspan || {};
		EKI.tmp.rowId = EKI.tmp.rowId || 0;
		
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
		
		// print one token per line and construct Elements for their Quant-analyses
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
			cleanToken = EKI.Quant.cleanToken(textToken);
			EKI.Quant.addToken(cleanToken);
			
			// mark all rows with a numerical id and some classes
			tr = jQuery("<tr>");
			tr.attr('data-id', EKI.tmp.rowId); EKI.tmp.rowId += 1;
			tr.addClass("morph"+textToken);
			tr.addClass("morph"+cleanToken);
			tr.addClass("morphRow");
			
			jQuery(tr).appendTo(tbody);
			
			// create the span element for (original) token
			td = jQuery("<td>");
			td.addClass("morphToken");
			td.text(textToken);
			jQuery(td).appendTo(tr);
			
			// create 4 td elements for the morph analysises
			// (the actual analysis will be filled later)
			tdi = params.length-1;
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
		EKI.Quant.analyze();
		
		/* ********** ülejäänud funktsioonid **************** */
		
		
		function updateQuantAnalysisList () {
			/* simply iterates the analyzed tokens and updates their elements */
			
			jQuery.each(EKI.Quant.getTokenQuantList(), updateQuantAnalysisRows);
			// add hide functionality to checkboxes
			jQuery("td input:checkbox").click(hideOtherRows);
		}
		
		
		function updateQuantAnalysisRows (token, analysisData) {
			/* Makes a new table row for the token and its analysis. The new row
			 * replace the old one(s) */
			
			if (analysisData === undefined) {
				console.log('EKIToolkit: No analysisData sent to updateQuantAnalysisTable');
				return;
			}
			
			// for each of the same token's rows, we insert the acquired analysis
			jQuery(".morph"+token).each(insertAnalysisRows);
			
			function insertAnalysisRows (index, element) {
				var params = [/*"Vaste",*/ "Kuju", "Tyyp"], param,
					tokenRow, rowspan, rowId, tokenRows, td, tokenCell, value,
					analyzeGroup, analysis,
					i, j, p;
				
				// make a new tokenRow to replace the current tokenRow
				// the tokenRow rowspan will be set according to amount of analysises
				tokenRow = jQuery("<tr>");
				EKI.tmp.rowId += 1;
				rowspan = 0;
				tokenRows = [];
				
				// HTML tables only the first row of a multiple rowspan row gets
				// the first column's tabledata (td)
				td = tokenCell = jQuery("<td>");
				jQuery(td).addClass("morphToken");
				jQuery(td).text(token);
				jQuery(td).appendTo(tokenRow);
				
				// for each analysis
				for(i=0; i<analysisData.length; i+=1) {
					analysis = analysisData[i];

					// give the rows unique IDs
					tokenRow.attr('data-id', EKI.tmp.rowId);
					// add classes to the row
					tokenRow.addClass("morphRow");
					for(p=0; p<params.length; p+=1) {
						// make td element for each column (except the first)
						param = params[p];
						value = analysis[param];
						td = jQuery("<td>");
						
						switch (param) {
							case 'Kuju': // show a checkbutton on each row
							jQuery('<input type="checkbox" class="markanalysisrow">').appendTo(td);
							break;

							case "Vorm": // @todo: seda pole
							jQuery(td).attr("title", EKI.Quant.getFormName(value));
							break;

							case "Tyyp":
							// @todo: don't do here, but split this before
							jQuery(td).attr("title", EKI.Quant.getPosName(value.charAt(value.length-1)));
							break;
						}
						
						jQuery(td).addClass(param);
						jQuery(td).addClass("morphAnalysis");
						value = jQuery(td).html() + value;
						
						jQuery(td).html(value);
						jQuery(td).appendTo(tokenRow);
					}
					
					// save the rows for later insertion into the DOM
					tokenRows.push(tokenRow);
					tokenRow = jQuery("<tr>"); // @todo: is this a memory leak?
				}
				
				// change the rowspan if needed
				if (tokenRows.length > 1) {
					tokenCell.attr('rowspan', tokenRows.length);
				}
				
				// now replace all the old table row with this new one
				jQuery(this).replaceWith(tokenRows);
			}
		}
		
		function hideOtherRows(row) {
			"use strict";
			
			var rowId, rowspan,
				markedRow, sameTokenRows;
				
				// get the ID and rowspan for the marked row
				markedRow = jQuery(this).parents('tr');
				rowId = markedRow.attr('data-id');
				sameTokenRows = markedRow.siblings('tr[data-id="'+rowId+'"]');
				//~ rowspan = markedRow.find('[rowspan]');// siblings('tr[data-id="'+rowId+'"]').has('[rowspan]');//.find('td[class="morphToken"]');//.attr('rowspan');
				// store them so that we can later restore them
				//~ EKI.tmp.rowspan[rowId] = rowspan;
				//~ console.log('rowId', rowId, 'rowspan', rowspan, 'markedRow', markedRow);
			
			// if a row gets checked, we'll hide the others (later on,
			// we might use this as a crowdsource)
			if(jQuery(this).is(":checked")) {
				
				// find the rows to hide, and hide them
				sameTokenRows.filter( function(index) {
						if (jQuery(this).find(":checkbox").prop("checked")) {
							return false;
						} else {
							return true;
						}
					}).find("td.morphAnalysis").fadeOut();
			
			} else {
				// if a box gets unchecked, we'll restore and show the other rows
				sameTokenRows.find("td.morphAnalysis").show();
			}
		}
	});
}
