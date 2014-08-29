/**
 * Created by kaur on 9.04.14.
 *
 */


function Dict(elements) {
    // allow an optional initial table
    this.hash = elements || {}; // simple Object
    this.hasSpecialProto = false; // has "__proto__" key?
    this.specialProto = undefined; // "__proto__" element
}

Dict.prototype.has = function(key) {
    if (key === "__proto__") {
        return this.hasSpecialProto;
    }
    // own property only
    return Object.prototype.hasOwnProperty.call(this.hash, key);
};

Dict.prototype.get = function(key) {
    if (key === "__proto__") {
        return this.specialProto;
    }
    // own property only
    return this.has(key)
        ? this.hash[key]
        : undefined;
};

Dict.prototype.set = function(key, val) {
    if (key === "__proto__") {
        this.hasSpecialProto = true;
        this.specialProto = val;
    } else {
        this.hash[key] = val;
    }
};

Dict.prototype.remove = function(key) {
    if (key === "__proto__") {
        this.hasSpecialProto = false;
        this.specialProto = undefined;
    } else {
        delete this.hash[key];
    }
};






function Dictarr() {
    // allow an optional initial table
    this.innerValues = [];
    this.innerKeys = [];
    //this.idxHash = new Dict(); //{key: arr_idx, ...}
    //this.length = this.innerValues.length;

    this.hash = {};
    this.hasSpecialProto = false; // has "__proto__" key?
    this.specialProto = undefined; // "__proto__" element
    //this.prototype.cnt++;
}
Dictarr.prototype = {
    //length: this.innerValues.length
    pint: 9,
    pobj: {unic: 8},
    cnt: 0
};

Dictarr.prototype.has = function(key) {
    if (key === "__proto__") {
        return this.hasSpecialProto;
    }
    // own property only
    return Object.prototype.hasOwnProperty.call(this.hash, key);
};

Dictarr.prototype.innerGet = function(key) { //str või false
    if (key === "__proto__") {
        return this.specialProto;
    }
    // own property only
    return this.has(key)
        ? this.hash[key]
        : undefined;
};

Dictarr.prototype.get = function(key) {
    var str = this.innerGet(key);
    return (str !== undefined) ? str.o : undefined;
};


Dictarr.prototype.set = function(key, val) {

    //kui selline key on juba olemas, vaheta val-objekt
    var str = this.innerGet(key);
    if (str !== undefined) {
        str.o = val;
        this.innerValues[str.i] = val;
        return;
    }

    this.innerKeys.push(key);
    var newlength = this.innerValues.push(val);
    str = {o: val, i: newlength - 1};

    if (key === "__proto__") {
        this.hasSpecialProto = true;
        this.specialProto = str;
    } else {
        this.hash[key] = str;
    }

};

Dictarr.prototype.remove = function(key) {

    var str = this.innerGet(key);

    //del from arr
    if (str !== undefined) {
        this.innerValues.splice(str.i, 1);
        this.innerKeys.splice(str.i, 1);
    }

    //del from hash
    if (key === "__proto__") {
        this.hasSpecialProto = false;
        delete this.specialProto;
    } else {
        delete this.hash[key];
    }

};

Dictarr.prototype.length = function() {
    return this.innerValues.length;
};
//Dictarr.prototype.length = Dictarr.prototype.innerValues.length;
    /*
    */
Dictarr.prototype.arr = function() {
    return this.innerValues;
};


