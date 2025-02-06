var map = L.map('map',{
    zoomControl: false, // Disable zoom controls
    attributionControl: false, // Disable the attribution control
}).fitWorld();

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);
map.locate({setView: true, maxZoom: 16});

function onLocationFound(e) {
    var radius = e.accuracy;
    L.marker(e.latlng).addTo(map);
}
map.on('locationfound', onLocationFound);

function onLocationError(e) {
    alert(e.message);
}
map.on('locationerror', onLocationError);
