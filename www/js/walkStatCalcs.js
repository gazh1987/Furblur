var DEBUG = true;
var startDate;
var durationInterval;

window.addEventListener('load', function(){
    startDate = new Date();
    durationInterval = setInterval(calculateAndFormatDuration, 1000);
})

function calculateAndFormatDuration() {
    var currentDate = new Date();
    var elapsedMilliseconds = currentDate.getTime() - startDate.getTime();
    
    var elapsedSeconds = Math.floor((elapsedMilliseconds / 1000) % 60);
    var elapsedMinutes = Math.floor((elapsedMilliseconds / (1000 * 60)) % 60);
    var elapsedHours = Math.floor((elapsedMilliseconds / (1000 * 60 * 60)));

    var formattedTimeElapsed = 
        String(elapsedHours).padStart(2, '0') + ":" + 
        String(elapsedMinutes).padStart(2, '0') + ":" + 
        String(elapsedSeconds).padStart(2, '0');

    document.getElementById("duration").textContent = formattedTimeElapsed;
}

// Before page unload or navigating away, stop the interval
window.addEventListener("beforeunload", function() {
    if (DEBUG) {
        console.log("interval has stopped");
    }
    clearInterval(durationInterval);
})