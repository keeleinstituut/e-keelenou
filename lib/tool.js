
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


    ko.applyBindings(app);
    //$('#Q').focus();

})

