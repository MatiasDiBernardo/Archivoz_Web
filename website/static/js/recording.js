// Variables globales para almacenar información de grabación y texto
let numRecordings = 0;
let textToRead = "";
let textToDisplay = "";

// Función para obtener datos del usuario desde el backend
function obtenerDatos(idUsuario) {
    return fetch(`/recording/${idUsuario}`, {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la solicitud fetch: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            numRecordings = data.num_recordings;
            textToRead = data.name_of_text;
            textToDisplay = data.text_to_display;
            console.log('Datos obtenidos:', data);
            return data;
        })
        .catch(error => {
            console.error('Error al obtener datos JSON:', error);
            throw error;
        });
}

function updateText(content) {
    var textElement = document.getElementById("dynamicText");
    textElement.textContent = content;
}

// Evento que se dispara cuando el contenido HTML se ha cargado completamente
document.addEventListener('DOMContentLoaded', () => {
    // Obtener el ID de usuario del elemento HTML
    // Esta es la solucion que se me ocurrio para no depender de una
    // funcion asincrona
    const id_user = document.getElementById('id_user').textContent;
    console.log('ID de usuario:', id_user);

    // Variables de grabación
    let mediaRecorder;
    let chunks = [];
    let audio = document.querySelector('audio');

    // Botones
    const startBtn = document.getElementById('iniciarGrabacion');
    const stopBtn = document.getElementById('detenerGrabacion');
    const deleteBtn = document.getElementById('borrarGrabacion');
    const sendBtn = document.getElementById('enviarGrabacion');
    const autorSelector = document.getElementById('autorSelection');

    // Inicializar Plyr
    const player = new Plyr('audio', {
        controls: ['play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
    });

    // Elementos de interfaz de usuario
    const circulo = document.querySelector('section .contenedor-grab-cant .esta-grabando .circulo-rojo');
    let counterDisplay = document.getElementById('contador');
    let fraseLeerElement = document.querySelector('.frases-leer');
    let autorTextDisplay = document.querySelector('.nombre-texto');

    // Backend var
    var pathnameURL = window.location.pathname;

    // Contador de envíos de audio
    var audioSentCount = 0;
    counterDisplay.textContent = audioSentCount;

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

    function actualizarFrase(frase) {
        fraseLeerElement.textContent = frase;
    }

    function actualizarTextDisplay(name) {
        autorTextDisplay.textContent = name;
    }

    function actualizarContador(numRecordings) {
        counterDisplay.textContent = numRecordings;
    }

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

    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.ondataavailable = event => {
                chunks.push(event.data);
                toggleDeleteButton();
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(chunks, { type: 'audio/wav' });
                const audioURL = URL.createObjectURL(audioBlob);
                audio.src = audioURL;
                toggleDeleteButton();
            };
        })
        .catch(err => {
            console.error('Permiso denegado o no se soporta la grabación:', err);
        });

    // Obtener datos del usuario desde el backend
    obtenerDatos(id_user)
        .then(data => {
            console.log('Valores actualizados:');
            console.log(numRecordings);
            console.log(textToRead);
            console.log(textToDisplay);

            actualizarContador(numRecordings);
            actualizarFrase(textToDisplay);
            actualizarTextDisplay(textToRead);
        })
        .catch(error => {
            console.error('Error en la solicitud:', error);
        });

    // Configuración inicial de la interfaz de usuario
    clearRecording();
    startBtn.disabled = false;
    stopBtn.disabled = true;
    deleteBtn.disabled = true;
    sendBtn.disabled = true;


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
        mediaRecorder.stop();
        startBtn.disabled = false;
        stopBtn.disabled = true;
        deleteBtn.disabled = true;
        sendBtn.disabled = true;
        clearRecording();
    });

    sendBtn.addEventListener('click', () => {
        let author = autorSelector.value;
        // Acá se podría implementar una fución que en base al valor rms que esta almacenado en el array chunks
        // me deje guardar o no el audio. Es mas rápido hacerlo desde acá que guardarlo, mandarlo y recién ahi
        // decidir si ese audio eso bueno o no.

        // Realizar una solicitud POST al backend con el audio y el ID del texto
        const audioBlob2 = new Blob(chunks, { type: 'audio/mpeg-3' });
        var form = new FormData();
        form.append('file', audioBlob2, 'data.mp3');
        form.append('author', author);

        $.ajax({
            type: 'POST',
            url: pathnameURL,
            data: form,
            cache: false,
            processData: false,
            contentType: false
        }).done(function (data) {
            console.log(data);

            // Actualizar la interfaz con el texto obtenido del backend
            actualizarFrase(data.text_to_display);
            actualizarTextDisplay(data.name_of_text);
            clearRecording();
        });

        clearRecording();

        // Visual update
        numRecordings++;
        actualizarContador(numRecordings);
        startBtn.disabled = false;
        stopBtn.disabled = true;
        deleteBtn.disabled = true;
        sendBtn.disabled = true;
    });
});