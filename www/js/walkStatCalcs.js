const INTERVAL_DURATION = 1000;
let startDate;
let durationInterval;
let paceInterval;
let watchId;
let avgPace = [];

window.addEventListener('load', function(){
    startDate = new Date();
    paceInterval = setInterval(getPace, INTERVAL_DURATION);
    durationInterval = setInterval(calculateAndFormatDuration, INTERVAL_DURATION);
})

function calculateAndFormatDuration() {
    let currentDate = new Date();
    let elapsedMilliseconds = currentDate.getTime() - startDate.getTime();
    
    let elapsedSeconds = Math.floor((elapsedMilliseconds / 1000) % 60);
    let elapsedMinutes = Math.floor((elapsedMilliseconds / (1000 * 60)) % 60);
    let elapsedHours = Math.floor((elapsedMilliseconds / (1000 * 60 * 60)));

    let formattedTimeElapsed = 
        String(elapsedHours).padStart(2, '0') + ":" + 
        String(elapsedMinutes).padStart(2, '0') + ":" + 
        String(elapsedSeconds).padStart(2, '0');

    document.getElementById("duration").textContent = formattedTimeElapsed;
}

function getPace() {
    const options = {
       enableHighAccuracy: true,
       maximumAge: 3600000
    }
    watchId = navigator.geolocation.watchPosition(onSuccess, onError, options);
 
    function onSuccess(position) {
        const speed  = position.coords.speed;
        if (speed !== null && speed > 0) {
            avgPace.push((speed * 3.6).toFixed(2));
        }

        let totalPace = avgPace.reduce((acc, curr) => acc + parseFloat(curr), 0);
        document.getElementById("pace").textContent = avgPace.length > 0 ? 
            (totalPace / avgPace.length).toFixed(2) + " km/h" : 
            "0 km/h";
    };
    
    function onError(error) {
       console.log("code: "    + error.code    + "\n" + "message: " + error.message + "\n");
    }
 }

 // Before page unload or navigating away, stop the intervals
window.addEventListener("beforeunload", function() {
    clearInterval(durationInterval);
    clearInterval(paceInterval);
    navigator.geolocation.clearWatch(watchId);
})