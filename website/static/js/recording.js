document.addEventListener('DOMContentLoaded', () => {
    // Recording variables
    let mediaRecorder;
    let chunks = [];
    let audio = document.querySelector('audio');

    // Buttons
    const startBtn = document.getElementById('iniciarGrabacion');
    const stopBtn = document.getElementById('detenerGrabacion');
    const deleteBtn = document.getElementById('borrarGrabacion');
    const sendBtn = document.getElementById('enviarGrabacion');

    // UI display
    const circulo = document.querySelector('section .contenedor-grab-cant .esta-grabando .circulo-rojo');
    const counterDisplay = document.getElementById('contador');
    // Estaría bueno que este dato se lo pasemos desde el back, así si un user entre de nuevo tiene
    // guardado la cantidad de audios que aportó. Es mejor que tenerlo en el local storage.
    let audioSentCount = localStorage.getItem('audioSentCount') || 0;
    counterDisplay.textContent = audioSentCount;

    // Backend var
    var pathnameURL = window.location.pathname;
  
    function toggleDeleteButton() {
      deleteBtn.disabled = chunks.length === 0;
    }
  
    function clearRecording() {
      chunks = [];
      audio.src = '';
      toggleDeleteButton();
    }

    function mostrarCirculoRojo() {
      circulo.style.opacity = '1';
    }
    
    function ocultarCirculoRojo() {
      circulo.style.opacity = '0';
    }
  
    // Inicialzation of the mediaRecorder obj that handels recording 
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        mediaRecorder = new MediaRecorder(stream);
  
        mediaRecorder.ondataavailable = event => {
          chunks.push(event.data);
          toggleDeleteButton();
        };
  
        // This section parse the data to the audio object when media recorder is stopped
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(chunks, { type: 'audio/wav' });
          const audioURL = URL.createObjectURL(audioBlob);
          // Si ya esta agregado esto, podes tratar de mandarlo abajo de los botones y que quede
          // porque esta bueno que el user pueda escuchar lo que grabó
          audio.src = audioURL;
          toggleDeleteButton();
        };
      })
      .catch(err => {
        console.error('Permiso denegado o no se soporta la grabación:', err);
      });
  
    startBtn.addEventListener('click', () => {
      mostrarCirculoRojo();
      clearRecording();
      mediaRecorder.start();
      startBtn.disabled = true;
      stopBtn.disabled = false;
      deleteBtn.disabled = false;
      sendBtn.disabled = true;
    });
  
    stopBtn.addEventListener('click', () => {
      ocultarCirculoRojo();
      mediaRecorder.stop();
      startBtn.disabled = false;
      stopBtn.disabled = true;
      startBtn.disabled = false;
      sendBtn.disabled = false;
    });
  
    deleteBtn.addEventListener('click', () => {
      ocultarCirculoRojo();
      // Porque este check si abajo pones mediaRecorder igual?
      if (mediaRecorder.state != 'inactive') {
        mediaRecorder.stop();
      } 
        mediaRecorder.stop();
        startBtn.disabled = false;
        stopBtn.disabled = true;
        deleteBtn.disabled = true;
        sendBtn.disabled = true;
      clearRecording();
    });
  
    sendBtn.addEventListener('click', () => {
      // El cambio del texto tiene que ir en esta sección. 
      // Se puede manejar desde acá (JS) o desde el back con Jinja
      let oracionID = audioSentCount.toString();

      // POST to backend 
      const audioBlob2 = new Blob(chunks, { type: 'audio/mpeg-3' });
      var form = new FormData();
      form.append('file', audioBlob2, 'data.mp3');
      form.append('texto', oracionID);
      //Chrome inspector shows that the post data includes a file and a title.
      $.ajax({
          type: 'POST',
          url:pathnameURL,
          data: form,
          cache: false,
          processData: false,
          contentType: false
      }).done(function(data) {
          console.log(data);
      });
  
      // Visual update
      audioSentCount++;
      localStorage.setItem('audioSentCount', audioSentCount);
      counterDisplay.textContent = audioSentCount;
      clearRecording();

      startBtn.disabled = false;
      stopBtn.disabled = true;
      deleteBtn.disabled = true;
      sendBtn.disabled = true;
    });

    // Que esta parte, esta por fuera de los botones se podría borrar no?
    clearRecording();
    startBtn.disabled = false;
    stopBtn.disabled = true;
    deleteBtn.disabled = true;
    sendBtn.disabled = true;
  });