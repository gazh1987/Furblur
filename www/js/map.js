let marker = null;
let circle = null;
let polyline = null;
let walkLatLngs = [];
let walkingTracking = false;
let walkButtonLocked = true;

function startWalkingTracking() {
    walkingTracking = true;
    document.addEventListener('deviceready', keepDeviceAwake, false);
}

function keepDeviceAwake() {
    if (window.plugins && window.plugins.insomnia) {
        window.plugins.insomnia.keepAwake();
    }
}

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
    let spanButton = document.getElementById("walkingLockButton");

    if (spanButton) {
        spanButton.style.pointerEvents = "none";
        spanButton.id = "walkingButtonOnLocationErrorMessage";
        spanButton.textContent = e.message;
    }
}
map.on('locationerror', onLocationError);

let stopWalkingButton = document.getElementById("stopWalkingButton");
stopWalkingButton.onclick = function() {
    if(!walkButtonLocked) {
        showWalkSummary();
        new bootstrap.Modal(document.getElementById("walkSummaryModal")).show();
    }
}

function toggleStopButtonStyles() {
    if (walkButtonLocked) {
        walkButtonLocked = false;
        walkingLockButton.textContent = "lock_open_right"
        walkingLockButton.style.color = "#007bff";
        stopWalkingButton.style.color = "red";
    }
    else {
        walkButtonLocked = true;
        walkingLockButton.textContent = "lock"
        walkingLockButton.style.color = "red";
        stopWalkingButton.style.color = "grey";
    }
};

let summaryMap;

function showWalkSummary() {
    document.getElementById("summaryDuration").textContent = document.getElementById("duration").textContent;
    document.getElementById("summaryDistance").textContent = document.getElementById("distance").textContent;
    document.getElementById("summaryPace").textContent = document.getElementById("pace").textContent;

    // Delay map initialization until modal is visible
    // Improve this, 500 timeout is arbitrary
    setTimeout(() => {
        if (!summaryMap) {
            summaryMap = L.map("summaryMap");
            
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attributionControl: true,
            }).addTo(summaryMap);
        }

        // Add the polyline
        let polyline = L.polyline(walkLatLngs, { color: 'red', weight: 4 }).addTo(summaryMap);

        // Fit the map view to the polyline bounds
        summaryMap.fitBounds(polyline.getBounds());

    }, 500);
}

const energyValues = ['Low', 'Normal', 'High'];
const happinessValues = ['Sad', 'Neutral', 'Happy'];
const behaviorValues = ['Calm', 'Excited', 'Anxious', 'Reactive'];

const energyLevelSlider = document.getElementById('energy-level');
const happinessSlider = document.getElementById('happiness');
const behaviorSlider = document.getElementById('behavior');
const summaryEnergy = document.getElementById('summaryEnergy');
const summaryHappiness = document.getElementById('summaryHappiness');
const summaryBehavior = document.getElementById('summaryBehavior');

// Function to update the selected value based on slider
function updateSliderValue() {
    summaryEnergy.textContent = energyValues[energyLevelSlider.value];
    summaryHappiness.textContent = happinessValues[happinessSlider.value];
    summaryBehavior.textContent = behaviorValues[behaviorSlider.value];
}

// Update the value initially
updateSliderValue();

// Add event listeners to update the values as the sliders change
energyLevelSlider.addEventListener('input', updateSliderValue);
happinessSlider.addEventListener('input', updateSliderValue);
behaviorSlider.addEventListener('input', updateSliderValue);

async function postWalk() {
    const end = new Date();

    const runData = {
        date: new Date().toISOString().split('T')[0],
        startTime: formatDateTime(startDate),
        endTime: formatDateTime(new Date()),
        distanceKm: parseFloat(document.getElementById("summaryDistance").textContent),
        averagePace: parseFloat(document.getElementById("summaryPace").textContent),
        durationFormatted: document.getElementById("summaryDuration").textContent,
        energyLevel: energyValues[energyLevelSlider.value],
        happiness: happinessValues[happinessSlider.value],
        behaviour: behaviorValues[behaviorSlider.value],
        coordinates: getJsonFormattedCoordinates()
    }

    try {
        const res = await fetch (API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(runData)
        });

        if (!res.ok) {
            throw new Error(`Server error: $res.status`);
        }

        const data = await res.json();
        console.log("Walk posted succesful: ", data);
        redirectToHome();
    }
    catch (err) {
        console.log("Failed to Post walk: ", err);
        alert("Failed to log walk. Please try again in a few minutes.");
    }
}

function formatDateTime(date){
    return date.toISOString().slice(0,19); 
}

function getJsonFormattedCoordinates() {
    return walkLatLngs.map(c => ({
        latitude: c.lat,
        longitude: c.lng
    }));
}

 // Before page unload or navigating away, stop the intervals
window.addEventListener("beforeunload", function() {
    clearInterval(durationInterval);
    clearInterval(paceInterval);
    navigator.geolocation.clearWatch(watchId);
})

// Before page unload or navigating away, stop tracking to prevent unnecessary processing
window.addEventListener("beforeunload", function() {
    map.stopLocate();
    walkingTracking = false;
    window.plugins.insomnia.allowSleepAgain()
})

function redirectToHome() {
    window.location.href = "home.html"; 
}