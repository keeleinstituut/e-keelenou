/**
 * Tüübimulli näitamine
 *
 * Tüübimulli kuvamiseks vajab leht järgnevaid lisasid:
    jquery
    <script type='text/javascript' src='lib/qtip/jquery.qtip.min.js'></script>
    <link rel="stylesheet" type="text/css" href="lib/qtip/jquery.qtip.css" />
    <script type='text/javascript' src='lib/tyypinfo.js'></script>
 *
 *  @type {EKN|*|{}}
 */

var EKN = EKN || {};

EKN.tyypinfo = {

    //t: this, //ei toimi, this on siin window

    getTyyp: function(res_id, fragm_id) {
        //var f = function() {}
        var d = $.Deferred();

        var $div = $("<div></div>");
        var url = '/res/tyypsonad_'+ res_id + '.html '+ fragm_id +'';

        $div.load(
            url,
            //'res/tyypsonad_'+ res_id + '.html a#'+ tyyp_id +' + table',
            //'res/tyypsonad_'+ res_id + '.html tr:has(a[id="tp'+ tyyp_id +'"])',
            function(responseText, textStatus, xhr) {
                //console.log('$d.load: res_id:', res_id,' textStatus:', textStatus, 'responseText:', responseText);
                //responseText sisaldab kogu faili, $d ainult otsitud div-i
                d.resolve($div, responseText, textStatus, xhr);
            }
        );
        return d;
    },

    doTyypTip: function($a, res, fragm_id) {

        console.log($a, res, fragm_id);

        var d = this.getTyyp(res, fragm_id); //laetakse tyybi html..
        var that = this; //kuidas yldse ilma selleta sai enne?
        d.done(function($div, responseText, textStatus, xhr) { //kui laetud

            console.log('getTyyp->d->done:', this);
            var $tp_info = $div;
            var html = $tp_info.html();
            that.initTyypLink($a, html, res); //mulli ehitama
        });

    },

    onTyypLink: function(cb) {
        this.initTyypLink = cb;
    },

    //initTyypLink: function() {}, //($a, html, res) //, tyyp);

    initTyypLink: function($a, html, res) {
        //$a - <a> lingi element jquery objektina.
        //html - tyybi mulli sisu
        //res - ressursi id ('qs' v6i 'def')
        //tyyp - tyybi nr
        var that = this;
        console.log('initTyypLink ', $a, res)

        var qt = $a.qtip({
            overwrite: false, // Make sure the tooltip won't be overridden once created
            content: {
                text: function(event, api) {

                    //api.set('content.text', html);
                    //return 'Laeb...';
                    return html;
                }
            },
            hide: {
                fixed: true,
                delay: 300
            },
            events: {

                render: function(event, api) {
                    // Grab the tooltip element from the API elements object
                    //var tooltip = api.elements.tooltip;
                    var $c = api.elements.content;

                    //var div = $c.get(0);
                    //var $as = $(div).find('div');
                    //var $as = $div.find('a')

                    //var $as = $c.find('a')

                    setTimeout(function() {
                        dbg('render - setTimeout');

                        var $as = $c.find('a[href]');
                        $as.each(function() {
                            var $tyyp_a = $(this);
                            var fragm_id = $tyyp_a.attr('href');
                            dbg(fragm_id);
                            that.doTyypTip($tyyp_a, res, fragm_id);
                        })
                    }, 10);

                }

            }
        });

    },

    //  ===================================================================


    /**
     * Kutsutakse välja nt <a> elemendi onclick handleris
     * - this peab olema link, millele lisatakse infomull.
    */
    showTyyp: function(res, nr) {
        var $a = $(this);
        var tyyp_nr = nr; //$a.text();
        //$a.attr('href', 'javascript: console.log("'+ res +'","'+ tyyp_nr +'")');
        $a.attr('data-res', res);
        $a.attr('data-tyyp', tyyp_nr);
        //paneme väljakutsel this = EKN.tyypinfo:
        EKN.tyypinfo.doTyypTip.call(EKN.tyypinfo, $a, res, '#mt'+ tyyp_nr);
        //t.doTyypTip.call(t, $a, res, '#mt'+ tyyp_nr);
    },

    initTyypInfos: function(root_el, selector, res) {

        $('.selecto').qtip({
            content: {
                text: 'Loading...', // The text to use whilst the AJAX request is loading
                ajax: {
                    url: '/path/to/file #id', // URL to the local file
                    type: 'GET', // POST or GET
                    data: {}, // Data to pass along with your request
                    success: function (data, status) {
                        // Process the data

                        // Set the content manually (required!)
                        this.set('content.text', data);
                    }
                }
            }
        });

    }


};
