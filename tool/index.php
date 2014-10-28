<?php

error_reporting(E_ALL);
include_once('../plib/simple_html_dom.php');

if (!$module = @$_GET['m']) {
	die('no module');
}

$html = file_get_html("$module.html");

//$e_start_content = $html->find("div#start_content", 0);



?><!DOCTYPE html>
<html>
<head>
	<?php
	if ($title = $html->find("title", 0)) {
		echo $title->outertext . "\n";
	} else {
		echo '<title>e-keelenõu</title>'. "\n";
	}
	//echo $html->find("title", 0)->outertext . "\n";
	?>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, height=device-height, user-scalable=no">
	<script type='text/javascript' src='../lib/jquery.js'></script>
	<script type='text/javascript' src='../lib/knockout-3.1.0.js'></script>

	<link rel="stylesheet" href="../css/style.css" />
	<link rel="stylesheet" href="../css/cleanstickyfooter.css" type="text/css" media="screen" />
	<link rel="stylesheet" href="../css/tool.css" />
	<link href='http://fonts.googleapis.com/css?family=Open+Sans:400,700,600' rel='stylesheet' type='text/css'>
	<script type='text/javascript' src="../lib/myshim.js"></script>
	<script type='text/javascript' src="../lib/feedbform.js"></script>
	<script type='text/javascript' src="../lib/javascript.js"></script>
	<script>
		$(function(){

			app = {
				getCookie: function(name) {
					var value = "; " + document.cookie;
					var parts = value.split("; " + name + "=");
					if (parts.length == 2) return parts.pop().split(";").shift();
				},
				searching: ko.observable(false),
				searchFrom: function() {
					this.searching(true);
					return false;
				},

				testText: ko.observable('test-sisu')

			};
			app.uid = app.getCookie('eknid');

			app.forms = EKN.forms;

			ko.applyBindings(app);
			//$('#Q').focus();

		})
	</script>
<?php
/*
	foreach ($html->find('link.votasee') as $element) {
		echo $element->outertext;
	}

	foreach ($html->find('script.votasee') as $element) {
		echo $element->outertext;
	}
*/
	foreach ($html->find('head .votasee') as $element) {
		echo $element->outertext . "\n";
	}

?>


</head>
<body class="tool">

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
								<li><a href="/tool/?m=morfoloogia">Morfoloogiline analüüs</a></li>
								<li><a href="/tool/?m=silbitaja">Silbitus</a></li>
								<li><a href="/tool/?m=lausestaja">Lausestamine</a></li>
								<li><a href="/tool/?m=emo">Emotsioonidetektor</a></li>
								<li><a href="/tool/?m=speech">Kõnesüntees</a></li>
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
								<li><a href="/lisainfo/?m=keelenoust">Keelenõust</a></li>
								<li><a href="/lisainfo/?m=allikad">Allikate kirjeldus</a></li>
								<li><a href="http://keeleabi.eki.ee/?leht=8">Nõuandearhiiv</a></li>
								<!--
								<li><a href="/lisainfo/?m=rakendusliidesed">Rakendusliidesed</a></li>
								
								<li><a href="#">Statistika</a></li>
								<li><a href="/lisainfo/kasutustingimused.html">Kasutustingimused</a></li>
								-->
							</ul>
						</li>
						<!--<li><a href="keelenoust.html">E-keelenõust</a></li> -->

					</ul>
					<form id="paring" class="topBar" action="/" method="get">
						<input onblur="if (this.value == '') {this.value = 'Sisesta siia sõna või väljend';}" 
							onfocus="if (this.value == 'Sisesta siia sõna või väljend') {this.value = '';}" 
							id="Q" name="Q" type="text" value="Sisesta siia sõna või väljend" 
							placeholder="Sisesta siia sõna või väljend"/>
						<input data-bind="style: { border: app.searching() ? '2px solid #ff6000' : ''}" id="otsi" value=""
							   type="submit" />
						<input type="hidden" data-bind="value: app.testText" />
					</form>
					<div class="social-buttons">
						<a class="social opacity" style="clear: both; margin-right:0;" href="http://www.eki.ee/"><img src="/gr/facebook.png" alt="facebook"/></a>
						<a class="social opacity" href="http://www.eki.ee/"><img src="/gr/twitter.png" alt="twitter"/></a>
						<a class="social opacity" href="http://www.eki.ee/"><img style="padding-top: 3px;" src="/gr/email.png" alt="email"/></a>
					</div>
					<div id="menu-wrapper">
						<ul id="menu">
							<li><a href="#qs13">ÕS</a></li>
							<li><a href="#ekss">EKSS</a></li>
							<li><a href="#syn">Sünonüümid</a></li>
							<li><a href="#ety">Etümoloogia</a></li>
							<li><a href="#trans_en">Inglise</a></li>
							<li><a href="#trans_ru">Vene</a></li>
							<li><a href="#knabee">Kohanimed</a></li>
							<li><a href="#ekkr">Käsiraamat</a></li>
							<li><a href="#ass">Soovitused</a></li>
							<!--li><a href="#ass">dummy0</a></li>
							<li><a href="#ass">dummy1</a></li>
							<li><a href="#ass">dummy2</a></li-->
						</ul>
					</div>


				</div>

				<div style="clear: both;"></div>

<?php
// start_content
//echo $e_start_content->outertext;
	foreach ($html->find("div#start_content") as $element) {
		echo $element->outertext . "\n";
	}
	
	foreach ($html->find("div#page_content") as $element) {
		echo $element->outertext . "\n";
	}
	
	
?>

			</div>
		</div>
		<div id="tagasiside" class="opacity form-button"></div>
		<div id="language" class="opacity form-button"></div>
		<div class="tagasiside">
			<div id="feedback">
				<div id="feedback-form">
					<h2>Anna tagasisidet e-keelenõu arendajatele.</h2>
					<form id="f_feedback_dev" method="POST" data-addr="dev"
						  data-bind="submit: app.forms.sendForm"
						  action="http://kn.eki.ee/kn/spam.php">
						<input type="hidden" name="checkme" value="formmail">
						<div class="left small">
							<label for="ffd_nimi">Nimi</label>
							<input type="text" name="nimi" id="ffd_nimi">
						</div>
						<div class="left small">
							<label for="ffd_email">E-mail</label>
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
		<div class="language">
			<div id="feedback">
				<div id="feedback-form">
					<h2>Küsi Eesti Keele Instituudi keelenõuandjatelt.</h2>
					<form id="f_feedback_lang" method="POST" data-addr="lang"
						  data-bind="submit: app.forms.sendForm"
						  action="http://kn.eki.ee/kn/spam.php">
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
							<a href="http://portaal.eki.ee/">Eesti Keele Instituut</a><br/>
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

</body>
</html>