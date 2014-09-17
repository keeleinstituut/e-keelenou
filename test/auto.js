var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Auto = (function () {
    function Auto(options) {
        this.engine = options.engine;
        this.basePrice = options.basePrice;
        this.state = options.state;
        this.make = options.make;
        this.model = options.model;
        this.year = options.year;
    }
    Auto.prototype.calculateTotal = function () {
        //var taxRate = TaxRateInfo.getTaxRate(this.state);
        return this.basePrice + (0.20 * this.basePrice);
    };

    Auto.prototype.addAccessories = function () {
        var accessories = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            accessories[_i] = arguments[_i + 0];
        }
        this.accessoryList = '';
        for (var i = 0; i < accessories.length; i++) {
            var ac = accessories[i];
            this.accessoryList += ac.accessoryNumber + ' ' + ac.title + '<br />';
        }
    };

    Auto.prototype.getAccessoryList = function () {
        return this.accessoryList;
    };

    Object.defineProperty(Auto.prototype, "basePrice", {
        get: function () {
            return this._basePrice;
        },
        set: function (value) {
            if (value <= 0)
                throw 'price must be >= 0';
            this._basePrice = value;
        },
        enumerable: true,
        configurable: true
    });

    return Auto;
})();

var Engine = (function () {
    function Engine(horsePower, engineType) {
        this.horsePower = horsePower;
        this.engineType = engineType;
    }
    Engine.prototype.start = function (callback) {
        var _this = this;
        window.setTimeout(function () {
            callback(true, _this.engineType);
        }, 1000);
    };

    Engine.prototype.stop = function (callback) {
        var _this = this;
        window.setTimeout(function () {
            callback(true, _this.engineType);
        }, 1000);
    };
    return Engine;
})();

var Truck = (function (_super) {
    __extends(Truck, _super);
    function Truck(options) {
        _super.call(this, options);
        this.bedLength = options.bedLength;
        this.fourByFour = options.fourByFour;
    }
    Object.defineProperty(Truck.prototype, "bedLength", {
        get: function () {
            return this._bedLength;
        },
        set: function (value) {
            if (value == null || value == undefined || value == '') {
                this._bedLength = 'Short';
            } else {
                this._bedLength = value;
            }
        },
        enumerable: true,
        configurable: true
    });

    return Truck;
})(Auto);

var truck = new Truck({
    engine: new Engine(250, 'V8'),
    basePrice: 45000,
    state: 'Arizona',
    make: 'Ford',
    model: 'F-150',
    year: 2013,
    bedLength: 'Short Bed',
    fourByFour: true
});
//document.body.innerHTML = greeter(user);
