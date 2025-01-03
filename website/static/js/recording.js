// Función para obtener datos del usuario desde el backend
function obtenerDatos(idUsuario) {
  return fetch(`/recording/${idUsuario}`, {
    method: "GET",
    headers: {
      "X-Requested-With": "XMLHttpRequest",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error en la solicitud fetch: " + response.statusText);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Datos obtenidos:", data);
      return data;
    })
    .catch((error) => {
      console.error("Error al obtener datos JSON:", error);
      throw error;
    });
}

// Evento que se dispara cuando el contenido HTML se ha cargado completamente
document.addEventListener("DOMContentLoaded", () => {
  // Obtener el ID de usuario del elemento HTML
  // Esta es la solucion que se me ocurrio para no depender de una
  // funcion asincrona
  const id_user = document.getElementById("id_user").textContent;
  console.log("ID de usuario:", id_user);

  // Variables de grabación
  let mediaRecorder;
  let chunks = [];
  let audio_condition = true;
  let error_message = "";
  let audio_duration;
  let audio = document.querySelector("audio"); // <audio>

  // Botones
  const deleteBtn = document.getElementById("borrarGrabacion"); // borrarGrabacion
  const sendBtn = document.getElementById("enviarGrabacion"); // enviarGrabacion
  const autorSelector = document.getElementById("autorSelection"); // autorSelection
  // Como tenemos el boton de escritorio y el boton de celular, tenemos que agarrar 2 elementos
  const recordingButtonDesktop = document.getElementsByClassName(
    "contenedor-microfono"
  )[0];
  const recordingButtonMobile = document.getElementsByClassName(
    "contenedor-microfono"
  )[1];

  // Inicializamos Plyr (no aparece en la pagino sino)
  const player = new Plyr("audio", {
    controls: [
      "play",
      "progress",
      "current-time",
      "mute",
      "volume",
      "fullscreen",
    ],
  });

  // Elementos de interfaz de usuario
  let counterDisplay = document.getElementById("contador"); //contador
  let fraseLeerElement = document.querySelector(".frases-leer"); //frases-leer
  let autorTextDisplay = document.querySelector(".nombre-texto"); //Es el texto de Grabación
  let grabacionResultado = document.querySelector(".contenedor-grabacion");
  let loaderGrabacion = document.querySelector("#loader-recording");
  let loaderEnvio = document.querySelector("#loader-send");
  let textoEnvio = document.getElementById("texto-envio");

  // Backend var
  var pathnameURL = window.location.pathname;

  function borrarGrabacion() {
    chunks = [];
    audio.src = "";
  }

  // Alternamos entre icono de 'empezar a grabar' e icono de 'grabando'
  function cambiarIcono(img) {
    const root = document.querySelector(":root");
    if (!recording) {
      img.src = "../static/img/grabando.jpg";
      root.style.setProperty("--background-mic", "#FF0000");
      root.style.setProperty("--color-animacion", "red");
      img.style.height = "33px";
    } else {
      img.src = "../static/SVG/microfono.svg";
      root.style.setProperty("--background-mic", "#FFF");
      root.style.setProperty("--color-animacion", "white");
      img.style.height = "50px";
    }
  }

  // Deshabilitamos y habilitamos botón para grabar
  function deshabilitarGrabar() {
    recordingButtonDesktop.style.pointerEvents = "none";
    recordingButtonDesktop.style.opacity = "0.5";
    recordingButtonMobile.style.pointerEvents = "none";
    recordingButtonMobile.style.opacity = "0.5";
  }

  function habilitarGrabar() {
    recordingButtonDesktop.style.pointerEvents = "all";
    recordingButtonDesktop.style.opacity = "1";
    recordingButtonMobile.style.pointerEvents = "all";
    recordingButtonMobile.style.opacity = "1";
  }

  function iniciarLoaderGrabacion() {
    loaderGrabacion.style.display = "flex";
    loaderGrabacion.scrollIntoView({ block: "center", behavior: "smooth" });
  }

  function mostrarAudioResultado() {
    loaderGrabacion.style.display = "none";
    grabacionResultado.style.display = "flex";
    grabacionResultado.scrollIntoView({ block: "end", behavior: "smooth" });
  }

  function iniciarLoaderEnvio() {
    textoEnvio.style.display = "none";
    loaderEnvio.style.display = "flex";
  }

  function detenerLoaderEnvio() {
    textoEnvio.style.display = "flex";
    loaderEnvio.style.display = "none";
  }

  function ocultarAudioResultado() {
    grabacionResultado.style.display = "none";
  }

  function actualizarFrase(frase) {
    fraseLeerElement.textContent = frase;
  }

  function actualizarNombreDeTexto(name) {
    // autorTextDisplay.textContent = name;
  }

  function actualizarContador(numRecordings) {
    counterDisplay.textContent = numRecordings;
  }

  function measureNoiseLevel(audioBlob) {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const reader = new FileReader();

    reader.onload = async function () {
      const buffer = await audioContext.decodeAudioData(reader.result);
      const dataArray = buffer.getChannelData(0);

      // Calculate average amplitude as a measure of noise level
      const sumOfSquares = dataArray.reduce((acc, val) => acc + val * val, 0);
      const rms = Math.sqrt(sumOfSquares / dataArray.length);
      const rms_db = 20 * Math.log10(rms);

      // Audio error conditions
      audio_condition = true;
      error_message = "";
      audio_duration = buffer.duration; // In seconds

      // Noise control
      let threshold_db = -45;
      if (rms_db < threshold_db) {
        audio_condition = false;
        error_message =
          "El audio grabado no tiene el suficiente volúmen para reconocer una voz. Asegúrate de que tu micrófono esta conectado. Si esta correctamente conectado, intenté hablar mas fuerte o mas cerca del micrófono.";
      }

      // Control audio length
      if (buffer.duration > 60) {
        audio_condition = false;
        error_message =
          "La grabación supero el tiempo máximo. Asegúrate de leer la oración en pantalla en menos de 60 segundos.";
      }
    };

    reader.readAsArrayBuffer(audioBlob);
  }

  // Obtener datos del usuario desde el backend
  obtenerDatos(id_user)
    .then((data) => {
      console.log("Valores actualizados:");
      console.log(data.num_recordings);
      console.log(data.text_to_display);
      console.log(data.name_of_text);

      actualizarContador(data.num_recordings); // Numero de grabaciones
      actualizarFrase(data.text_to_display); ///Texto aleatorio
      actualizarNombreDeTexto(data.name_of_text); //Archivoz
    })
    .catch((error) => {
      console.error("Error en la solicitud:", error);
    });

  // Inicialización del objeto mediaRecorder para manejar la grabación
  // Recomiendo no modificar mucho, en el caso de que se necesite grabar a una
  // cierta tasa de bits o cambiar la tasa de muestreo, entonces agregar lo siguiente:
  /* 
     const audioConstraints = {
         audio: {
             sampleRate: 44100,  
             channelCount: 1,    // 1 mono, 2 estereo
             bitrate: 128000     
         }
     };
    */

  // Remplazar la linea [ navigator.mediaDevices.getUserMedia({ audio: true }) ] por:

  /*
    navigator.mediaDevices.getUserMedia(audioConstraints)
    */

  // Data de los constrains: https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints
  // Configuración de la grabación
  const audioConstraints = {
    audio: {
      sampleRate: 44100,
      sampleSize: 16,
      channelCount: 1, // 1 mono, 2 estereo
      echoCancellation: true, // Para testear
    },
  };

  // Evento para controlar la entrada de audio
  navigator.mediaDevices
    .getUserMedia(audioConstraints)
    .then((stream) => {
      // No soporta mp3 para real time recording
      // const options = {
      //     audioBitsPerSecond:320000,
      //     mimeType:"audio/mpeg",
      // };

      mediaRecorder = new MediaRecorder(stream);

      // Cuando nota que empezamos a grabar
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data); //Ingresa los datos al chunk
      };

      // Cuando paramos de grabar, es decir, de meter audio
      mediaRecorder.onstop = () => {
        // Mostramos loader
        iniciarLoaderGrabacion();
        // Crea un Blob con el resultado
        const audioBlob = new Blob(chunks, { type: "audio/wav" });
        // Lo convierte en una URL
        const audioURL = URL.createObjectURL(audioBlob);
        // Y lo pasa al reproductor
        audio.src = audioURL;
        // Calcular valor RMS del audio
        measureNoiseLevel(audioBlob);

        // TODO: delete timeout for deploy
        // Mostramos resultado
        setTimeout(mostrarAudioResultado, 1);
      };
    })
    .catch((err) => {
      console.error("Permiso denegado o no se soporta la grabación:", err);
    });

  // EVENTOS DE CADA BOTÓN

  let recording = false;
  recordingButtonDesktop.addEventListener("click", (e) => {
    if (!recording) {
      //Si no estamos grabando
      // cambiarAnimacion(); // Alternar entre animaciones
      borrarGrabacion();
      mediaRecorder.start(); //Empezamos a grabar
      deleteBtn.disabled = true;
      sendBtn.disabled = true;
      cambiarIcono(e.srcElement.children[0]);
      recording = true;
    } else {
      //Si estamos grabando
      // cambiarAnimacion();
      mediaRecorder.stop(); //Paramos de grabar
      deleteBtn.disabled = false;
      sendBtn.disabled = false;
      deshabilitarGrabar();
      cambiarIcono(e.srcElement.children[0]);
      recording = false;
    }
  });

  recordingButtonMobile.addEventListener("click", (e) => {
    if (!recording) {
      //Si no estamos grabando
      // cambiarAnimacion(); // Alternar entre animaciones
      borrarGrabacion();
      mediaRecorder.start(); //Empezamos a grabar
      deleteBtn.disabled = true;
      sendBtn.disabled = true;
      cambiarIcono(e.srcElement.children[0]);
      recording = true;
    } else {
      //Si estamos grabando
      // cambiarAnimacion();
      mediaRecorder.stop(); //Paramos de grabar
      deleteBtn.disabled = false;
      sendBtn.disabled = false;
      deshabilitarGrabar();
      cambiarIcono(e.srcElement.children[0]);
      recording = false;
    }
  });

  deleteBtn.addEventListener("click", () => {
    deleteBtn.disabled = true;
    sendBtn.disabled = true;
    borrarGrabacion();
    ocultarAudioResultado();
    habilitarGrabar();
  });

  let clicked = false;
  sendBtn.addEventListener("click", () => {
    if (!clicked) {
      clicked = true;
      let author = autorSelector.value;

      // Realizar una solicitud POST al backend con el audio y el ID del texto
      const audioBlob2 = new Blob(chunks, { type: mediaRecorder.mimeType }); // Antes 'audio/mpeg-3'
      // Aca en type yo puedo poner lo que quiera en type, eso no significa que me lo guarda
      // como mp3, es una referencia para el que recibe el blob. Es un standar called MIME.
      // Con la línea que puse, me muestra el formato real en el que se esta grabando, que es webM,
      // tendría que encontrar la forma de pasar de webM a valid mp3 desde acá o hacerlo después desde
      // el back.
      console.log("Este es el blob");
      console.log(audioBlob2);

      var form = new FormData();
      form.append("file", audioBlob2, "data.webm");
      form.append("author", author);

      if (audio_condition) {
        iniciarLoaderEnvio();
        fetch(pathnameURL, {
          method: "POST",
          body: form,
          headers: {
            "X-Requested-With": "XMLHttpRequest",
          },
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(
                "Error en la solicitud fetch: " + response.statusText
              );
            }
            return response.json();
          })
          .then((data) => {
            // Actualizar la interfaz con el texto obtenido del backend
            actualizarFrase(data.text_to_display);
            actualizarNombreDeTexto(data.name_of_text);
            actualizarContador(data.num_recordings);
          })
          .catch((error) => {
            console.error("Error al obtener datos JSON:", error);
          })
          .finally(() => {
            borrarGrabacion();
            detenerLoaderEnvio();
            ocultarAudioResultado();
            deleteBtn.disabled = true;
            sendBtn.disabled = true;
            clicked = false;
            habilitarGrabar();
          });
      } else {
        // Warnings when audio is not good
        var modalElement = document.getElementById("errorModal");

        // Get the paragraph element within the modal body by its class
        var paragraphElement = modalElement.querySelector(
          ".modal-error-body p"
        );

        // Update the content of the paragraph
        paragraphElement.textContent = error_message;

        // Show the modal
        $(modalElement).modal("show");

        borrarGrabacion();
        detenerLoaderEnvio();
        ocultarAudioResultado();
        deleteBtn.disabled = true;
        sendBtn.disabled = true;
        clicked = false;
        habilitarGrabar();
      }
    }
  });
});
