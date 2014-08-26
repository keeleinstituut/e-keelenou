/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 
Function.prototype.extend = function(obj) {
    for (var property in obj)
    this[property] = obj[property];
    return this;
}
*/

/*
     Christoph:
     http://stackoverflow.com/questions/1404559/what-will-be-a-good-minimalistic-javascript-inheritance-method/1404697#1404697.

function clone(obj) {
	if(typeof obj !== 'undefined') {
		clone.prototype = Object(obj);
		return new clone;
	}
}
 
*/