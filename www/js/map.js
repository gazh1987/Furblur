/**
 * Some Leaflet Controls have been disabled for clearer UX. 
 * ZoomControl. This has been removed because the user can simply pinch the screen to zoom in and out.
 * AttributionControl. This is disabled for clearer UX however, we might add this in if needed later.
 */


// Turn Debug off for Production
const DEBUG = true;
var marker = null;
var circle = null;

var map = L.map('map',{
    zoomControl: true, 
    attributionControl: true,
}).fitWorld();

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

// enableHighAccuracy ensures better accuracy, useful for tracking walking routes in urban areas
map.locate({
    setView: true, 
    watch: true, 
    maxZoom: 17, 
    enableHighAccuracy: true } 
);

function onLocationFound(e) {
    if (DEBUG) {
        console.log("Location found");
    }

    if (!e.latlng) {
        console.warn("Invalid Location Received: ", e);
        return;
    }

    if (!marker) {
        marker = L.marker(e.latlng).addTo(map);
    }
    else {
        marker.setLatLng(e.latlng);
    }

    var radius = e.accuracy;
    if(!circle) {
        circle = L.circle(e.latlng, radius, {
            radius: radius,
            color: "blue",
            fillColor: "#add8e6",
            fillOpacity: 0.3
        }).addTo(map);
    }
    else {
        circle.setLatLng(e.latlng);
        circle.setRadius(radius);
    }
    
}
map.on('locationfound', onLocationFound);

function onLocationError(e) {
    if (DEBUG) {
        console.log(e.message);
    }
    
    var spanButton = document.getElementById("walkingButton");

    if (spanButton) {
        spanButton.style.pointerEvents = "none";
        spanButton.id = "walkingButtonOnLocationErrorMessage";
        spanButton.textContent = e.message;
    }
}
map.on('locationerror', onLocationError);

// Before page unload or navigating away, stop tracking to prevent unnecessary processing
window.addEventListener("beforeunload", function() {
    if (DEBUG) {
        console.log("map has stopped locating");
    }

    map.stopLocate();
})
