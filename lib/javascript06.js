$(document).ready(function(){
	$(".tools, .lisainfo").click(function(){
		$(".submenu").fadeOut("fast");
		$(this).children("ul").fadeIn("fast");
	});
	$('#menu a').click(function(){
		$("#menu li").removeClass("current");
		$(this).parent("li").addClass("current");
		var e = $(this).attr('href');
		$('html, body').animate({
			scrollTop: $( $.attr(this, 'href') ).offset().top-55
		}, 500, function(){

			console.log($(e).next(".rGrpCont").css("height"));
			//$(e).children(".rGrpHead").next(".rGrpCont").css("height", "auto");
			//$(e).children(".rGrpHead").removeClass("closed");

            app.sm.fromMenu(e);

		});
		return false;
	});
	$("#page-up").click(function(){
		$('html, body').animate({
			scrollTop: $("html").offset().top
		}, 500);
		return false;
	});
	$(".tools, .lisainfo").mouseenter(function(){
		$(".sisene").children(".submenu").fadeOut("fast");
	});
	$(".tools .submenu, .lisainfo .submenu").click(function(){
		$(this).fadeOut("fast");
	});
	$("#header").mouseleave(function(){
		$(".tools .submenu, .lisainfo .submenu").fadeOut("fast");
	});
	var menu = $("#menu").offset().top;
	$(window).scroll(function(){
		var w = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
		var dokument = $(document).height();
		var windowHeigh = $(window).height();
		var bottom = dokument-w-windowHeigh;
		if(menu < w){
			$("#menu-wrapper").addClass("fixed");
			$("#page-up").show();
			if(bottom < "93"){
				$("#page-up").css("bottom","93px");
			}else{
				$("#page-up").css("bottom","0");
			}
		}else{
			$("#menu-wrapper").removeClass("fixed");
			$("#page-up").hide();
		}
	});
	$(".form-button").click(function(){
		var id = $(this).attr("id");
		console.log(id);
		if($('.'+id).css("right") == "-520px"){
			$('.'+id).animate({right: "0"}, 800);
			$(this).animate({right: "520"}, 800);
		$("#full-screen").fadeIn("slow");
		}else{
			$('.'+id).animate({right: "-520"}, 800);
			$(this).animate({right: "0"}, 800);
			$("#feedback").removeClass("shadow");
			$("#full-screen").fadeOut("slow");
		}
	});
	$("#feedback .close, #full-screen, .send").click(function(){
		$(".tagasiside, .language").animate({right: "-520"}, 800);
		$(".form-button").animate({right: "0"}, 800);
		$("#full-screen").fadeOut("slow");
	});
	$(".sisene a").click(function(e){
		e.preventDefault();
		if($(".sisene .submenu").is(":hidden")){
			$(".sisene").children(".submenu").fadeIn("fast");
			$(".tools .submenu").fadeOut("fast");
		}else{
			$(".sisene .submenu").fadeOut("fast");
		}
	});
	$("#page_content").click(function(){
		if($(".sisene .submenu").is(":hidden")){
			
		}else{
			$(".sisene .submenu").fadeOut("fast");
		}
	});
	$("#sugg h2").append('<span class="info"><img src="/gr/white_info.png"/></span><div class="popup">Inglise-eesti s�nastik on valminud ja t�ieneb pidevalt hobi korras muu t�� k�rvalt. Eesti keele instituut lubab selle s�nastiku materjali kasutada mis tahes otstarbel, kuid ei taga, et s�nastik vastab EKI kvaliteedistandardile. Nii m�nigi oluline s�na v�i t�hendus v�ib puududa, nii m�nigi pakutud vaste v�ib erineda �S-i soovitustest ja s�nastik on eba�htlane.</div>'); 
	$("#trans_en h2").append('<span class="info" href="#"><img src="/gr/orange_info.png"/></span><div class="popup">Inglise-eesti s�nastik on valminud ja t�ieneb pidevalt hobi korras muu t�� k�rvalt. Eesti keele instituut lubab selle s�nastiku materjali kasutada mis tahes otstarbel, kuid ei taga, et s�nastik vastab EKI kvaliteedistandardile. Nii m�nigi oluline s�na v�i t�hendus v�ib puududa, nii m�nigi pakutud vaste v�ib erineda �S-i soovitustest ja s�nastik on eba�htlane.</div>'); 
	$(".info").mouseenter(function(){
		$(this).next(".popup").fadeIn("slow");
	});
	$(".info").mouseleave(function(){
		$(this).next(".popup").fadeOut("slow");
	});
	$("#otsi").click(function(){
		$("#preloader").fadeIn("slow");
	});
	window.onresize = function() {
		var width = $(document).width();
		if( width > "1080"){
			$("#poscol1 .box").height("auto");
		}
	};
});