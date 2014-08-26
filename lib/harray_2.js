/**
 * Harray
 * https://gist.github.com/icholy/3451147
 * jutt ja kasutamine: 
 * http://stackoverflow.com/questions/12111738/javascript-hash-array-hybrid-performance
 * ...
 * Modified by me
 */


function Harray(prop) {
    this.keyProperty = prop;
    this.h = {};
};
 
Harray.prototype = new Array();
console.log('Harray.prototype.constructor:')
console.log(Harray.prototype.constructor)
Harray.prototype.constructor = Harray;
console.log('Harray.prototype.constructor:')
console.log(Harray.prototype.constructor)

Harray.prototype.push = function(){
    Array.prototype.push.apply(this, arguments);
    for (var i = 0; i < arguments.length; i++) {
        var value = arguments[i];
        this.h[value[this.keyProperty]] = value;
    }
    return this.length;
};

Harray.prototype.push_1 = function(value){
    this.h[value[this.keyProperty]] = value;
    Array.prototype.push.call(this, value);
    return this.length;
};

Harray.prototype.put = function(key, value){
    value[this.keyProperty] = key;
    this.h[key] = value;
    Array.prototype.push.call(this, value);
};
 
Harray.prototype.remove = function(value){
    delete this.h[value[this.keyProperty]];
    this.splice(this.indexOf(value), 1);
};
 
Harray.prototype.removeKey = function(key){
    this.splice(this.indexOf(this.h[key]), 1);
    delete this.h[key];
};
 
Harray.prototype.removeAt = function(idx){
    delete this.h[this[idx][this.keyProperty]];
    this.splice(idx, 1);
};
/*
if (!Array.prototype.forEach) {
    Harray.prototype.forEach = function(fn){
        for (var i in this.arr){
            fn( i, this.arr[i], this.arr );
        }
    
    };
}
*/
//------------------------------------------

var data = [
   { myId: 4324, val: "foo"},
   { myId: 6280, val: "bar"},
   { myId: 7569, val: "baz"},
  
];
var coll = new Harray("myId");
// populate with data
//data.forEach(function(item){ coll.push(item); });
// key lookup
console.log( coll.h[4324] ) // => { myId: 4324, val: "foo"}
//console.log(coll)
// array functionality
console.log( coll[1] ) // => { myId: 6280, val: "bar"}
//coll.map(function(item){ return item.val; }); // => ["foo", "bar", "baz"]
coll.length // => 3

console.log ('for: ')
for (var i=0; i< coll.length; i++){
    console.log(i + ":" +coll[i])
}

/*
// remove value
coll.remove(coll[0]); // delete => { myId: 4324, val: "foo"}
// by key
coll.removeKey(7569) // delete => { myId: 7569, val: "baz"}
// by index
coll.removeAt(0); // delete => { myId: 6280, val: "bar"}
*/


var koa = ko.observableArray();
koa.push(4);
koa.push('stuff');
koa.push('2');
koa.push('3');

console.log( koa()[1]);

console.log ('for: ')
for (var i=0; i< koa().length; i++){
    console.log(i + ":" + koa()[i])
}
