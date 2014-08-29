
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
    app.forms = {


        sendForm: function(formElement) {

            $fe = $(formElement);

            var ad = $fe.data('addr');

            //var addr = $fe.attr('action');
            //http://kn.eki.ee/kn/post.php?addr=
            var addr = 'http://kn.eki.ee/kn/post.php?test=1&addr=' + ad;

            //dbg(addr);
            //return false;


            dbg('post: ', addr);
            var $msg = $fe.find('.f_message');

            $msg.toggleClass('error-message', false);
            $msg.text("Toimub teate saatmine...");

            $fe.find('.send').attr('value', app.uid); //kasutame uid transpordiks
            var srld = $fe.serialize();
            dbg('serialized:', srld);

            var jqxhr = $.post( addr, srld, function(){}, 'json')
                .done(function(data, textStatus, jqXHR) {
                    dbg( "success..", textStatus);
                    dbg('..data:', data );

                    if (data.r < 0) {
                        //viga
                        $msg.toggleClass('error-message', true);
                        $msg.text("Viga: "+ data.msg);

                    } else {

                        $msg.toggleClass('error-message', false);
                        $msg.text("Teade on edastatud. Täname!");
                        setTimeout(close, 2000);
                    }

                })
                .fail(function(jqXHR, textStatus, errorThrown) {
                    dbg( "fail",  jqXHR);
                    dbg('textStatus:', textStatus);
                    dbg('errorThrown:', errorThrown);

                    $msg.text("Viga:"+ textStatus);
                    $msg.toggleClass('error-message', true);
                });

            var close = function() {
                $fe.find('.send').click(); //javascript.js: $(".send").click - s6idutab vormi kinni
                setTimeout(function(){
                    $fe[0].reset();
                    $msg.text('');
                }, 800)

            };

        } //sendForm

    } //app.forms


    ko.applyBindings(app);
    //$('#Q').focus();

})

