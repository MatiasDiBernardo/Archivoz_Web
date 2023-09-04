const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const recordingsList = document.getElementById('recordingsList');
const recordingTimeDisplay = document.getElementById('recordingTimeDisplay');
const totalRecordingTimeDisplay = document.getElementById('totalRecordingTimeDisplay');

let mediaRecorder;
let recordedChunks = [];
let currentRecording;
let recordingStartTime;
let totalRecordingTime = 0;

function updateRecordingTimeDisplay() {
    const currentTime = Date.now();
    const elapsedTime = currentTime - recordingStartTime;
    const seconds = Math.floor(elapsedTime / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    recordingTimeDisplay.textContent = `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

function updateTotalRecordingTimeDisplay() {
    const totalSeconds = Math.floor(totalRecordingTime / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const remainingTotalSeconds = totalSeconds % 60;

    totalRecordingTimeDisplay.textContent = `${totalMinutes}:${remainingTotalSeconds < 10 ? '0' : ''}${remainingTotalSeconds}`;
}

startButton.addEventListener('click', async () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        return;
    }

    startButton.disabled = true;
    stopButton.disabled = false;
    recordingStartTime = Date.now();

    recordedChunks = [];
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const options = { audioBitsPerSecond: 22050 * 24 };
    mediaRecorder = new MediaRecorder(stream, options);

    mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
        }
    };

    mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);

        const audio = document.createElement('audio');
        audio.controls = true;
        audio.src = url;

        const recordingItem = document.createElement('li');
        recordingItem.appendChild(audio);
        recordingsList.appendChild(recordingItem);

        currentRecording = {
            blob: blob,
            audioElement: audio
        };

        startButton.disabled = false;
        stopButton.disabled = true;
        recordingTimeDisplay.textContent = '0:00';
        totalRecordingTime += Date.now() - recordingStartTime;
        updateTotalRecordingTimeDisplay();
    };

    mediaRecorder.start();
    updateRecordingTimeDisplay();
});

stopButton.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();

        //Aca habría que agregar código para que me mande un POST request al backend con el audio
    }
});

// Actualiza el contador cada un segundo
setInterval(() => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        updateRecordingTimeDisplay();
    }
}, 1000);