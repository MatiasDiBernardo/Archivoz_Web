let numRecordings = 0;
let textToRead = "";
let textToDisplay = "";

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
    // Get the text element by its ID
    var textElement = document.getElementById("dynamicText");

    // Change the text content
    textElement.textContent = content;
}

document.addEventListener('DOMContentLoaded', () => {
    const id_user = document.getElementById('id_user').textContent;
    console.log('ID de usuario:', id_user);

    // Recording variables
    let mediaRecorder;
    let chunks = [];
    let audio = document.querySelector('audio');

    // Buttons
    const startBtn = document.getElementById('iniciarGrabacion');
    const stopBtn = document.getElementById('detenerGrabacion');
    const deleteBtn = document.getElementById('borrarGrabacion');
    const sendBtn = document.getElementById('enviarGrabacion');
    const autorSelector = document.getElementById('autorSelection');

    // Inicializar Plyr
    const player = new Plyr('audio', {
        controls: ['play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
    });

    // UI display
    const circulo = document.querySelector('section .contenedor-grab-cant .esta-grabando .circulo-rojo');
    let counterDisplay = document.getElementById('contador');
    let fraseLeerElement = document.querySelector('.frases-leer');
    let autorTextDisplay = document.querySelector('.nombre-texto');

    // Backend var
    var pathnameURL = window.location.pathname;

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

    function actualizarTextDisplay(name){
        autorTextDisplay.textContent = name;
    }

    function actualizarContador(numRecordings) {
        counterDisplay.textContent = numRecordings;
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

    obtenerDatos(id_user)
        .then(data => {
            console.log('Valores actualizados:');
            console.log(numRecordings);
            console.log(textToRead);
            console.log(textToDisplay);

            // Aquí puedes realizar otras acciones que dependan de los valores actualizados
            actualizarContador(numRecordings);
            actualizarFrase(textToDisplay);
            actualizarTextDisplay(textToRead);
        })
        .catch(error => {
            console.error('Error en la solicitud:', error);
        });


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
        // POST to backend 
        let author = autorSelector.value;
        const audioBlob2 = new Blob(chunks, { type: 'audio/mpeg-3' });
        var form = new FormData();
        form.append('file', audioBlob2, 'data.mp3');
        form.append('author', author);
        //Chrome inspector shows that the post data includes a file and a title.
        $.ajax({
            type: 'POST',
            url: pathnameURL,
            data: form,
            cache: false,
            processData: false,
            contentType: false
        }).done(function (data) {
            console.log(data);
            actualizarFrase(data.text_to_display);
            actualizarTextDisplay(data.name_of_text);
            clearRecording();
        });

        // Visual update
        clearRecording();
        numRecordings++;
        actualizarContador(numRecordings);
        startBtn.disabled = false;
        stopBtn.disabled = true;
        deleteBtn.disabled = true;
        sendBtn.disabled = true;
    });
});