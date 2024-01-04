function obtenerDatos(idUsuario) {
  fetch(`/recording/${idUsuario}`, {
      method: 'GET',
      headers: {
          'X-Requested-With': 'XMLHttpRequest'
      }
  })
  .then(response => response.json())
  .then(data => {
      // Usa los datos JSON obtenidos
      console.log(data);
      // Realiza acciones con los datos obtenidos
  })
  .catch(error => {
      console.error('Error al obtener datos JSON:', error);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const id_user = document.getElementById('id_user').textContent;
  console.log(id_user);
  let datos = obtenerDatos(id_user);
  console.log(datos);  
  
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
    var audioSentCount = "{{ num_recordings }}";
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
      // Aclaración: Recordá que yo te paso desde el back número de grabaciones (int) y texto a leer (string), 
      // lo que explico a continuación es para que entiendas como funciona, pero vos solo tenes que mandarme de
      // vuelta el string text_to_read en el post asociado en esa variable textID.

      // textID es una variable string que me asocia la información del audio que se
      // manda al back. El formato es "autor_libro_cuento_IdMax_IdOración" donde autor libro y cuento
      // viene especificado en el json en ese order con los textos y el IdOración es el indice 
      // de la frase que se esta mostando cuando se grabó el audio.
      // Ejemplo con indice 12: "Cortazar_Octaedro_Liliana LLorando_174_12"

      // Cuando se registra un usuario nuevo, desde el back te llega la información
      // de que ese usuario no tiene un estado previo de grabación, en este caso el texto a mostrar
      // es Archivoz.json, y textID tiene que ser: Archivoz_IdMax_IdOracion 
      // Ejemplo para la primera oración: Archivoz_4_0
      let textID = audioSentCount.toString();

      // POST to backend 
      const audioBlob2 = new Blob(chunks, { type: 'audio/mpeg-3' });
      var form = new FormData();
      form.append('file', audioBlob2, 'data.mp3');
      form.append('texto', textID);
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