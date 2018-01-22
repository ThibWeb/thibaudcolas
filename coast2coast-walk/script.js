(function (L, C2CData) {
  'use strict';

  var map = L.map('map');

  var osmTiles='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  var osmAttrib='Map data © <a href="http://openstreetmap.org">OSM</a> contributors';

  L.tileLayer(osmTiles, {minZoom: 8, maxZoom: 16, attribution: osmAttrib}).addTo(map);

  // Centered on Mount Eden.
  map.setView([-36.875988, 174.764864], 12);

  L.geoJson(C2CData).addTo(map);

})(window.L, window.C2CData);
