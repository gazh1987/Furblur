let marker = null;
let circle = null;
let polyline = null;
let walkLatLngs = [];
let walkingTracking = false;

const map = L.map('map',{
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
    if (!marker) {
        marker = L.marker(e.latlng).addTo(map);
    }
    else {
        marker.setLatLng(e.latlng);
    }

    let radius = e.accuracy;
    if(!circle) {
        circle = L.circle(e.latlng, {
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

    // Do not record the polyline and total distance if not on the walk page
    if (walkingTracking) {
        walkLatLngs.push(e.latlng);
        let totalDistance = 0;
    
        if (!polyline) {
            polyline = new L.polyline(walkLatLngs, {color: 'red'}).addTo(map);
        }
        else {
            polyline.setLatLngs(walkLatLngs);

            for (let i = 1; i < walkLatLngs.length; i ++) {
                totalDistance += walkLatLngs[i].distanceTo(walkLatLngs[i-1]);
            }
        }

        document.getElementById("distance").textContent = totalDistance > 0 ? 
            (totalDistance / 1000).toFixed(2) + " km" :
            "0 km";
    }
}
map.on('locationfound', onLocationFound);

function onLocationError(e) {
    let spanButton = document.getElementById("walkingButton");

    if (spanButton) {
        spanButton.style.pointerEvents = "none";
        spanButton.id = "walkingButtonOnLocationErrorMessage";
        spanButton.textContent = e.message;
    }
}
map.on('locationerror', onLocationError);

function startWalkingTracking() {
    walkingTracking = true;
}

// Before page unload or navigating away, stop tracking to prevent unnecessary processing
window.addEventListener("beforeunload", function() {
    map.stopLocate();
    walkingTracking = false;
})