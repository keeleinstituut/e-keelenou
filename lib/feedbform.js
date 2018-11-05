var EKN = EKN || {};

EKN.forms = {


    sendForm: function(formElement) {

        $fe = $(formElement);

        var addr = $fe.data('addr');

        //var addr = $fe.attr('action');
        var url = 'https://kn.eki.ee/kn/post.php?addr=' + addr;

        //dbg(addr);
        //return false;


        dbg('post: ', url);
        var $msg = $fe.find('.f_message');

        $msg.toggleClass('error-message', false);
        $msg.text("Toimub teate saatmine...");

        $fe.find('.send').attr('value', app.uid); //kasutame uid transpordiks
        var srld = $fe.serialize();
        dbg('serialized:', srld);

        var jqxhr = $.post( url, srld, function(){}, 'json')
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

