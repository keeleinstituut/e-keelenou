/**
 * Created by kaur on 9.04.14.
 * (David Herman)
 */

function Dict(elements) {
    // allow an optional initial table
    this.elements = elements || {}; // simple Object
    this.hasSpecialProto = false; // has "__proto__" key?
    this.specialProto = undefined; // "__proto__" element
}

Dict.prototype.has = function(key) {
    if (key === "__proto__") {
        return this.hasSpecialProto;
    }
    // own property only
    return {}.hasOwnProperty.call(this.elements, key);
};

Dict.prototype.get = function(key) {
    if (key === "__proto__") {
        return this.specialProto;
    }
    // own property only
    return this.has(key)
        ? this.elements[key]
        : undefined;
};

Dict.prototype.set = function(key, val) {
    if (key === "__proto__") {
        this.hasSpecialProto = true;
        this.specialProto = val;
    } else {
        this.elements[key] = val;
    }
};

Dict.prototype.remove = function(key) {
    if (key === "__proto__") {
        this.hasSpecialProto = false;
        this.specialProto = undefined;
    } else {
        delete this.elements[key];
    }
};

//var dict = new Dict();
//console.log('dict.has("__proto__"): ', dict.has("__proto__") ); // false