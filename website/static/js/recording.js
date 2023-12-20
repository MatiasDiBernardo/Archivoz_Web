document.addEventListener('DOMContentLoaded', () => {
    let mediaRecorder;
    let chunks = [];
    let audio = document.querySelector('audio');
    const startBtn = document.getElementById('iniciarGrabacion');
    const stopBtn = document.getElementById('detenerGrabacion');
    const deleteBtn = document.getElementById('borrarGrabacion');
    const sendBtn = document.getElementById('enviarGrabacion');

    const counterDisplay = document.getElementById('contador');

    let audioSentCount = localStorage.getItem('audioSentCount') || 0;
    counterDisplay.textContent = audioSentCount;
  
    function toggleDeleteButton() {
      deleteBtn.disabled = chunks.length === 0;
    }
  
    function clearRecording() {
      chunks = [];
      audio.src = '';
      toggleDeleteButton();
    }
  
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        mediaRecorder = new MediaRecorder(stream);
  
        mediaRecorder.ondataavailable = event => {
          chunks.push(event.data);
          toggleDeleteButton();
        };
  
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(chunks, { type: 'audio/mp3' });
          const audioURL = URL.createObjectURL(audioBlob);
          audio.src = audioURL;
          toggleDeleteButton();
        };
      })
      .catch(err => {
        console.error('Permiso denegado o no se soporta la grabación:', err);
      });
  
    startBtn.addEventListener('click', () => {
      clearRecording();
      mediaRecorder.start();
      startBtn.disabled = true;
      stopBtn.disabled = false;
      deleteBtn.disabled = false;
      sendBtn.disabled = true;
    });
  
    stopBtn.addEventListener('click', () => {
      mediaRecorder.stop();
      startBtn.disabled = false;
      stopBtn.disabled = true;
      startBtn.disabled = false;
      sendBtn.disabled = false;
    });
  
    deleteBtn.addEventListener('click', () => {
      if (mediaRecorder.state === 'inactive') {
        clearRecording();
        startBtn.disabled = false;
        stopBtn.disabled = true;
        deleteBtn.disabled = true
        sendBtn.disabled = true;
      } else {
        mediaRecorder.stop();
        clearRecording();
        startBtn.disabled = false;
        stopBtn.disabled = true;
        deleteBtn.disabled = true;
        sendBtn.disabled = true;
      }
    });
  
    sendBtn.addEventListener('click', () => {
      // Simulación de envío
      setTimeout(() => {
        console.log('Grabación enviada exitosamente.');
        audioSentCount++;
        localStorage.setItem('audioSentCount', audioSentCount);
        counterDisplay.textContent = audioSentCount;
        clearRecording();
      }, 2000);
    });
    clearRecording();
    startBtn.disabled = false;
    stopBtn.disabled = true;
    deleteBtn.disabled = true;
    sendBtn.disabled = true;
  });