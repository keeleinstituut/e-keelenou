"use strict";
var mySoros,
	MAXLIST = 1000;

function Soros(program) {
		this.funcpat = /(\|?(\uE008\()+)?(\|?\uE008\(([^\(\)]*)\)\|?)(\)+\|?)?/;
		this.meta = "\\\"$()|#;";
		this.enc = "\uE000\uE001\uE002\uE003\uE004\uE005\uE006\uE007";
		this.lines = [];
		if (/__numbertext__/.test(program)) {
				this.numbertext = true;
				program = "0+(0|[1-9]\\d*) $1\n" + program.replace("__numbertext__", "");
		} else {
				this.numbertext = false;
		}

		// subclass for line data
		this.linetype = function (regex, repl, begin, end) {
				this.pat = regex;
				this.repl = repl;
				this.begin = begin;
				this.end = end;
		};

		// strip function
		this.strip = function (st, ch) {
				if (st === undefined) {
						return "";
				}
				return st.replace(new RegExp("^" + ch + "+"), "")
						.replace(new RegExp(ch + "+$"), "");
		};

		// character translation function
		this.tr = function (text, chars, chars2, delim) {
				var i, s;
				for (i = 0; i < chars.length; i += 1) {
						s = delim + chars[i];
						while (text.indexOf(s) >= 0) {
								text = text.replace(s, chars2[i]);
						}
				}
				return text;
		};

		// private run function
		this._run = function (data, begin, end) {
				var i, l, m, s, n, b, e;
				for (i in this.lines) {
						l = this.lines[i];
						if (!((!begin && l.begin) || (!end && l.end))) {
								m = l.pat.exec(data);
								if (m !== null) {
										s = data.replace(l.pat, l.repl);
										n = this.funcpat.exec(s);
										while (n !== null) {
												b = false;
												e = false;
												if (n[3][0] === "|" || n[0][0] === "|") {
														b = true;
												} else if (n.index === 0) {
														b = begin;
												}
												if (n[3][n[0].length - 1] === "|") { //|| n[3][n[0].length - 1] === "|") {
														e = true;
												} else if (n.index + n[0].length === s.length) {
														e = end;
												}
												s = s.substring(0, n.index + (n[1] === undefined ? 0 : n[1].length)) + this._run(n[4], b, e) +
														s.substring(n.index + (n[1] === undefined ? 0 : n[1].length) + n[3].length);
												n = this.funcpat.exec(s);
										}
										return s;
								}
						}
				}
				return "";
		};

		// run with the string input parameter
		this.run = function (data) {
				data = this._run(this.tr(data, this.meta, this.enc, ""), true, true);
				if (this.numbertext) {
						data = this.strip(data, " ").replace(/  +/g, " ");
				}
				return this.tr(data, this.enc, this.meta, "");
		};

		// constructor
		// program = program.replace(/\\\\/g, "\uE000")
		// program = program.replace(/\\[(]/g, "\uE003")
		// program = program.replace(/\\[)]/g, "\uE004")
		// program = program.replace(/\\[|]/g, "\uE005")
		program = this.tr(program, this.meta, this.enc, "\\");
		var i, s, line, l;
		l = program.replace(/(#[^\n]*)?(\n|$)/g, ";").split(";");
		for (i in l) {
				s = /^\s*(\"[^\"]*\"|[^\s]*)\s*(.*[^\s])?\s*$/.exec(l[i]);
				if (s !== null) {
						s[1] = this.strip(s[1], "\"");
						if (s[2] === undefined) {
								s[2] = "";
						} else {
								s[2] = this.strip(s[2], "\"");
						}
						line = new this.linetype(
								new RegExp("^" + s[1].replace("^\^", "").replace("\$$", "") + "$"),
								s[2].replace(/\\n/g, "\n")
										.replace(/(\$\d|\))\|\$/g, "$1||$$") // $(..)|$(..) -> $(..)||$(..)
										.replace(/\$/g, "\uE008")
										.replace(/\\(\d)/g, "$$$1")
										.replace(/\uE008(\d)/g, "\uE008($$$1)"),
								/^\^/.test(s[1]),
								/\$$/.test(s[1])
						);
						this.lines = this.lines.concat(line);
				}
		}
};

function convert() {
		var s, nums, res, maxi, begin, i;
		s = document.getElementById('number').textContent;
		if (s.match(/\d-/)) {
				nums = s.split("-");
				res = "";
				maxi = parseInt(nums[1]);
				begin = parseInt(nums[0]);
				if (maxi - begin > MAXLIST) {
						maxi = begin + MAXLIST;
				}
				for (i = begin; i <= maxi; i++) {
						res = res + i + "\t" + mySoros.run(i + "") + "\n";
				}
				//document.getElementById('numbers').textContent = res;
				document.getElementById('result').textContent = "";
		} else { 
				console.log(s);
				document.getElementById('result').textContent = mySoros.run(s); 
				//document.getElementById('numbers').textContent = "";
		}
}
function comp() {
		mySoros = new Soros(document.getElementById('et').textContent);
}
function load_prg() {
		document.getElementById('number').textContent = document.getElementById(document.getElementById('select').value).value;
}
function copy_result() {
		document.getElementById('number').textContent = document.getElementById('result').textContent;
}

