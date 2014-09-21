var vanaKlass = function() {
  var muutujaid = 'vanad 0';
  return {
      getVanaMuutujaid: function() {return muutujaid},
      setVanaMuutujaid: function(v) {muutujaid = v}
  };
}

var noorKlass = vanaKlass();
noorKlass.nooriMuutujaid = 'ülinoored';

console.log(noorKlass.getVanaMuutujaid());
noorKlass.setVanaMuutujaid('vanad 1');
console.log(noorKlass.getVanaMuutujaid());