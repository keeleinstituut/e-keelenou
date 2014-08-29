
jQuery(document).ready(function(){
	"use strict";
	
	// submit-nupule vajutades sooritatakse analüüs
	jQuery(":submit").click(analyzeTextTable);
	
	// valikud kajastatakse Morph moodulis
	jQuery("input:checkbox").change(function() {
		var name = jQuery(this).attr('name'),
			 state = jQuery(this).prop("checked");
		
		EKIToolkit("Morph", function (EKI) {
			EKI.Morph.setConfig(name, state); // @todo: ei salvestu
		});
	});

    var prepTyyp = function(res) { //leiab ressursi / kasti k6ik tyybi-lingid ja ehitab neile infomulli kylge.

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

    }();



});

function analyzeTextTable() {
	EKIToolkit("Morph", function (EKI) {
		var textTokens,
			table = jQuery("<table>"),
			tbody, tr, td, rowId,
			params = ["Sõne", /*"Vaste",*/ "Lemma", "Tyvi", "Vorm", "Tyyp"],
			param_vaste = {"Sõne":"Sõne", /*"Vaste":"Vaste",*/ "Lemma":"Lemma", "Tyvi":"Tüvi", "Vorm":"Vormikood", "Tyyp":"Sõnaliik ja muuttüüp"},
			param,
			thead = jQuery("<thead>"),
			theadrow = jQuery("<tr>"),
			textToken, cleanToken,
			i, tdi;
		
		// lisa tabeliuuendaja morfanalüüside jälgijaks
		EKI.addObserver(updateMorphAnalysisList);
		
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
		
		// print one token per line and construct Elements for their morph-analyses
		table.appendTo("#analyzedtext");
		
		jQuery(theadrow).appendTo(thead);
		
		for (i=0; i<params.length; i+=1) {
			param = params[i];
			jQuery("<th>").addClass(param).text(param_vaste[param]).appendTo(theadrow);
		}
		jQuery(theadrow).appendTo(thead);
		jQuery(thead).appendTo(table);
		tbody = jQuery("<tbody>").appendTo(table);
		
		for (i=0; i<textTokens.length; i++) {
			textToken = textTokens[i];
			cleanToken = EKI.Morph.cleanToken(textToken);
			EKI.Morph.addToken(cleanToken);
			
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
		EKI.Morph.analyze();
		
		/* ********** ülejäänud funktsioonid **************** */
		
		
		function updateMorphAnalysisList () {
			/* simply iterates the analyzed tokens and updates their elements */
			
			jQuery.each(EKI.Morph.getTokenMorphList(), updateMorphAnalysisTable);
			// add hide functionality to checkboxes
			jQuery("td input:checkbox").click(hideOtherRows);
		}
		
		
		function updateMorphAnalysisTable (token, analysisData) {
			/* Makes a new table row for the token and its analysis. The new row
			 * replace the old one(s) */
			
			if (analysisData === undefined) {
				console.log('EKIToolkit: No analysisData sent to updateMorphAnalysisTable');
				return;
			}
			
			// for each of the same token's rows, we insert the acquired analysis
			jQuery(".morph"+token).each(insertAnalysisRows);
			
			function insertAnalysisRows (index, element) {
				var params = [/*"Vaste",*/ "Lemma", "Tyvi", "Vorm", "Tyyp"], param,
					tokenRow, rowspan, rowId, tokenRows, td, tokenCell, value,
					analyzeGroup, analysis, link,
					i, j, p;
				
				// make a new tokenRow to replace the current tokenRow
				// the tokenRow rowspan will be set according to amount of analysises
				tokenRow = jQuery("<tr>");
				//~ EKI.tmp.rowId = 0; // this is set elsewhere!
				// increment an ID used for row identification
				EKI.tmp.rowId += 1;
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
						analysis = analyzeGroup[j];
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
								case 'Lemma': // show a checkbutton on each row
								jQuery('<input type="checkbox" class="markanalysisrow">').appendTo(td);
								jQuery(td).addClass(param);
								
								jQuery(td).addClass("morphAnalysis");
								link = jQuery("<a/>").attr('href', 'http://kn.eki.ee/?Q='+value);
								link.text(value);
								//value = jQuery(td).html() + link;
								jQuery(td).append(link);
								break;
	
								case "Vorm":
								jQuery(td).attr("title", EKI.Morph.getFormName(value));
								
								jQuery(td).addClass(param);
								jQuery(td).addClass("morphAnalysis");
								//value = jQuery(td).html() + value;
								jQuery(td).html(value);
								break;
	
								case "Tyyp":
								// @todo: don't do here, but split this before
								value = value.split('_');
								jQuery(td).attr("title", EKI.Morph.getPosName(value[1]));
								
								jQuery(td).addClass(param);
								jQuery(td).addClass("morphAnalysis");
								//value = jQuery(td).html() + value;
								    var tyypnr = value[0];

                                    var res = 'qs13';
                                    var tyyplink = jQuery("<a/>"); //.attr('onclick', 'EKN.tyypinfo.showTyyp("'+ res +'", '+ tyypnr +')');
                                    //tyyplink.attr('href', '#');
                                    tyyplink.text(tyypnr);

                                    tyyplink.attr('data-res', res);
                                    tyyplink.attr('data-tyyp', tyypnr);


                                    jQuery(td).append(EKI.Morph.getPosName(value[1]) + ' (');
                                    jQuery(td).append(tyyplink);
                                    jQuery(td).append(')');
								break;
								
								default:
								jQuery(td).addClass(param);
								jQuery(td).addClass("morphAnalysis");
								//value = jQuery(td).html() + value;
								jQuery(td).html(value);
								break;
							}
							
							
							jQuery(td).appendTo(tokenRow);
						}
						
						// save the rows for later insertion into the DOM
						tokenRows.push(tokenRow);
						tokenRow = jQuery("<tr>"); // @todo: is this a memory leak?
					}
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
