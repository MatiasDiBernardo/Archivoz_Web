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
            numRecordings = data.num_recordings; // Numero de grabaciones
            textToRead = data.name_of_text; //Archivoz
            textToDisplay = data.text_to_display; //Texto aleatorio
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
    let audio = document.querySelector('audio'); // <audio>
   
    // Botones
    // Como tenemos el boton de arriba y el boton de abajo, tenemos que agarrar 2 elementos
    const recordingButtonDesktop = document.getElementsByClassName('contenedor-microfono')[0]
    const recordingButtonMobile = document.getElementsByClassName('contenedor-microfono')[1]
    const deleteBtn = document.getElementById('borrarGrabacion'); // borrarGrabacion
    const sendBtn = document.getElementById('enviarGrabacion'); // enviarGrabacion
    const autorSelector = document.getElementById('autorSelection'); // autorSelection

    // Inicializar Plyr
    const player = new Plyr('audio', {
        controls: ['play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
    });

    // Elementos de interfaz de usuario
    const circulo = document.querySelector('section .contenedor-grab-cant .esta-grabando .circulo-rojo');
    let counterDisplay = document.getElementById('contador'); //contador
    let fraseLeerElement = document.querySelector('.frases-leer'); //frases-leer
    let autorTextDisplay = document.querySelector('.nombre-texto'); //Es el texto de Grabación
    let grabacionResultado = document.querySelector('.contenedor-grabacion');
    let loaderGrabacion = document.querySelector('#loader-recording')
    let loaderEnvio = document.querySelector('#loader-send')
    let textoEnvio = document.getElementById('texto-envio')

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

    // Alternamos entre icono de 'empezar a grabar' e icono de 'grabando'
    function cambiarIcono(img){
        const root = document.querySelector(":root");
        if(!recording){
            img.src = '../static/img/grabando2.jpg'
            root.style.setProperty("--background-mic", '#FF0000');
            root.style.setProperty("--color-animacion", 'red');
            img.style.height = "33px";
        } else{
            img.src = '../static/SVG/microfono.svg'
            root.style.setProperty("--background-mic", '#FFF');
            root.style.setProperty("--color-animacion", 'white');
            img.style.height = "50px";
        }
    }

    function deshabilitarGrabar() {
        recordingButtonDesktop.style.pointerEvents = 'none';
        recordingButtonDesktop.style.opacity = '0.5';
        recordingButtonMobile.style.pointerEvents = 'none';
        recordingButtonMobile.style.opacity = '0.5';
    }

    function habilitarGrabar() {
        recordingButtonDesktop.style.pointerEvents = 'all';
        recordingButtonDesktop.style.opacity = '1';
        recordingButtonMobile.style.pointerEvents = 'all';
        recordingButtonMobile.style.opacity = '1';
    }

    function iniciarLoaderGrabacion(){
        loaderGrabacion.style.display = 'flex';
        loaderGrabacion.scrollIntoView({ block: "center", behavior: "smooth" });
    }

    function mostrarAudioResultado(){
        loaderGrabacion.style.display = 'none';
        grabacionResultado.style.display = 'flex';
        grabacionResultado.scrollIntoView({ block: "end", behavior: "smooth" });
    }

    function iniciarLoaderEnvio(){
        textoEnvio.style.display = 'none';
        loaderEnvio.style.display = 'flex';
    }

    function detenerLoaderEnvio(){
        textoEnvio.style.display = 'flex';
        loaderEnvio.style.display = 'none';
    }

    function ocultarAudioResultado(){
        grabacionResultado.style.display = 'none';
    }


    function actualizarFrase(frase) {
        fraseLeerElement.textContent = frase;
    }

    function actualizarTextDisplay(name) {
        // autorTextDisplay.textContent = name;
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
            
            // Cuando nota que empezamos a grabar
            mediaRecorder.ondataavailable = event => {
                chunks.push(event.data); //Ingresa los datos al chunk
                toggleDeleteButton(); //Habilita el boton para detener
            };
            
            // Cuando paramos de grabar, es decir, de meter audio
            mediaRecorder.onstop = () => {
                // Mostramos loader
                iniciarLoaderGrabacion();
                // Crea un Blob con el resultado
                const audioBlob = new Blob(chunks, { type: 'audio/wav' });
                // Lo convierte en una URL
                const audioURL = URL.createObjectURL(audioBlob);
                // Y lo pasa al reproductor
                audio.src = audioURL;
                // Habilita el boton para borrar la pista
                toggleDeleteButton();
                // Mostramos resultado
                setTimeout(mostrarAudioResultado, 3000) //Agrego un tiemout para poder apreciar el loader
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
    deleteBtn.disabled = true;
    sendBtn.disabled = true;

    let recording = false;
    recordingButtonDesktop.addEventListener('click', (e) => {
        
        if(!recording){
            // cambiarAnimacion(); // Alternar entre animaciones
            clearRecording();
            mediaRecorder.start(); //Empezamos a grabar
            deleteBtn.disabled = true;
            sendBtn.disabled = true;
            cambiarIcono(e.srcElement.children[0]);
            recording = true;
        } else{
            // cambiarAnimacion();
            mediaRecorder.stop(); //Paramos de grabar
            deleteBtn.disabled = false;
            sendBtn.disabled = false;
            deshabilitarGrabar()
            cambiarIcono(e.srcElement.children[0]);
            recording = false;
        }
    });

    recordingButtonMobile.addEventListener('click', (e) => {
       
        if(!recording){
            // cambiarAnimacion(); // Alternar entre animaciones
            clearRecording();
            mediaRecorder.start(); //Empezamos a grabar
            deleteBtn.disabled = true;
            sendBtn.disabled = true;
            cambiarIcono(e.srcElement.children[0]);
            recording = true;
        } else{
            // cambiarAnimacion();
            mediaRecorder.stop(); //Paramos de grabar
            deleteBtn.disabled = false;
            sendBtn.disabled = false;
            deshabilitarGrabar()
            cambiarIcono(e.srcElement.children[0]);
            recording = false;
        }
    });

    deleteBtn.addEventListener('click', () => {
        deleteBtn.disabled = true;
        sendBtn.disabled = true;
        clearRecording();
        ocultarAudioResultado();
        habilitarGrabar();
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

        iniciarLoaderEnvio();
        setTimeout(() => {
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
                ocultarAudioResultado();
            });
    
            clearRecording();
            detenerLoaderEnvio();
            ocultarAudioResultado();
    
            // Visual update
            numRecordings++;
            actualizarContador(numRecordings);
            deleteBtn.disabled = true;
            sendBtn.disabled = true;
            habilitarGrabar();
        }, 3000)
    });
});