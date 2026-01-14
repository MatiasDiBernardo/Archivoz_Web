let fraseALeer = ''
let errorOcurred = null

function mostrarError(error){
    // Accessible custom modal show/hide without Bootstrap so it stays inert when hidden
    const modalElement = document.getElementById("errorModal");
    if (!modalElement) return;

    // Get the paragraph element within the modal body by its class
    const paragraphElement = modalElement.querySelector(".modal-error-body p");
    if (paragraphElement) paragraphElement.textContent = error;

    // Keep track of previously focused element so we can restore focus after closing
    const previouslyFocused = document.activeElement;

    // Elements to make inert while modal is open
    const contenedorGeneralDeGrabacion = document.getElementsByClassName('contenedor-contenido')[0];
    const instrucciones = document.getElementById('instrucciones');
    const navbar = document.querySelector('.nav-conteiner');
    const footer = document.querySelector('.footer');

    // Aparecer overlay
    let backdrop = document.getElementById('custom-modal-backdrop');
    backdrop.style.display = 'block';

    // Hacer modal visible e interactuable
    modalElement.style.display = 'block';
    modalElement.classList.add('show');
    modalElement.style.zIndex = '1050';
    modalElement.inert = false;
    modalElement.setAttribute('aria-hidden', 'false');

    const errorTitle = modalElement.querySelector('.modal-title');
    errorTitle.focus();

    if (contenedorGeneralDeGrabacion) contenedorGeneralDeGrabacion.inert = true;
    if (instrucciones && instrucciones.style.display != 'none') instrucciones.inert = true; 
    if (navbar) navbar.inert = true;
    if (footer) footer.inert = true;


    

    // Selecciono botones de cierre
    const closeButton = modalElement.querySelectorAll('[data-modal-close]');

    // Cerrar el modal restaurando inertness y visibilidad
    function closeModal() {
        modalElement.style.display = 'none';
        modalElement.classList.remove('show');
        modalElement.inert = true;
        modalElement.setAttribute('aria-hidden', 'true');
        backdrop.style.display = 'none';

        if(contenedorGeneralDeGrabacion && instrucciones.style.display == 'none'){
            contenedorGeneralDeGrabacion.inert = false;
        }
        if (instrucciones && instrucciones.style.display != 'none') instrucciones.inert = false;
        if (navbar) navbar.inert = false;
        if (footer) footer.inert = false;

        if (previouslyFocused) previouslyFocused.focus();

        if (closeButton[0]) closeButton[0].removeEventListener('click', closeModal);
        if (closeButton[1]) closeButton[1].removeEventListener('click', closeModal);

        document.removeEventListener('keydown', keyHandler);
    }

    function keyHandler(e) {
        if (e.key === 'Escape') closeModal();
    }

    if (closeButton[0]) closeButton[0].addEventListener('click', closeModal);
    if (closeButton[1]) closeButton[1].addEventListener('click', closeModal);
    document.addEventListener('keydown', keyHandler);
}

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
            // console.log('Datos obtenidos:', data);
            return data;
        })
        .catch(error => {
            throw error;
        });
}

let ultimaInteraccionFueConTeclado = false; 

document.addEventListener("keydown", e => {
  if (e.key === "Tab" || e.key === "Enter" || e.key === " ") {
    ultimaInteraccionFueConTeclado = true;
  }
});

document.addEventListener("mousedown", () => {
  ultimaInteraccionFueConTeclado = false;
});

// Evento que se dispara cuando el contenido HTML se ha cargado completamente
document.addEventListener('DOMContentLoaded', () => {
    const segmentos = window.location.pathname.split('/')
    const id_user = segmentos[segmentos.length - 1];

    
    // Variables de grabación
    let mediaRecorder;
    let chunks = [];
    let audio_duration;
    let audio = document.querySelector('audio'); // <audio>
    let noise_db;
    let audioType = 'noise';
    
    // Botones
    const deleteBtn = document.getElementById('borrarGrabacion'); // borrarGrabacion
    const sendBtn = document.getElementById('enviarGrabacion'); // enviarGrabacion
    
    // Como tenemos el boton de escritorio y el boton de celular, tenemos que agarrar 2 elementos
    const recordingButtonDesktop = document.getElementsByClassName('contenedor-microfono')[0]
    const recordingButtonMobile = document.getElementsByClassName('contenedor-microfono')[1]
    
    // Inicializamos Plyr (no aparece en la pagino sino)
    const player = new Plyr('audio', {
        controls: ['play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
        invertTime: false
    });

    // Aseguramos que el contenedor sea no-focusable por teclado
    if (player && player.elements && player.elements.container) {
        player.elements.container.setAttribute('tabindex', '-1');
    }

    // // Fijar aria-label del botón de reproducir de forma robusta.
    // // Plyr puede recrear controles internamente, por lo que usamos
    // // el evento 'ready' y además manejadores 'play'/'pause'.
    function setPlayButtonLabel(label) {
        try {
            const controls = player && player.elements && player.elements.controls;
            if (!controls) return;
            const playBtn = controls.querySelector('.plyr__control');
            if (playBtn) playBtn.setAttribute('aria-label', label);
        } catch (e) {
            // silencioso en caso de error
        }
    }

    player.on && player.on('ready', () => {
        setPlayButtonLabel('Reproducir');

        // MutationObserver de respaldo: si otra cosa intenta sobreescribir
        // el aria-label lo restauramos según el estado del reproductor.
        try {
            const controls = player.elements && player.elements.controls;
            const playBtn = controls && controls.querySelector('.plyr__control');
            if (playBtn) {
                const mo = new MutationObserver(mutations => {
                    mutations.forEach(m => {
                        if (m.type === 'attributes' && m.attributeName === 'aria-label') {
                            const expected = player.playing ? 'Pausar' : 'Reproducir';
                            if (playBtn.getAttribute('aria-label') !== expected) {
                                playBtn.setAttribute('aria-label', expected);
                            }
                        }
                    });
                });
                mo.observe(playBtn, { attributes: true, attributeFilter: ['aria-label'] });
                // Guardar referencia por si necesitamos desconectar en el futuro
                player._playButtonObserver = mo;
            }
        } catch (e) {}
    });

    // Mantener aria-label sincronizado con eventos de reproducción
    player.on && player.on('play', () => setPlayButtonLabel('Pausar'));
    player.on && player.on('pause', () => setPlayButtonLabel('Reproducir'));

    // Hacer que la barra de progreso y el control de volumen no sean seleccionables por teclado
    (function setNonFocusableControls(){
        try{
            const controls = player.elements && player.elements.controls;
            if (!controls) return;
            const progress = controls.querySelector('.plyr__progress');
            if (progress) {
                progress.setAttribute('tabindex', '-1');
                progress.setAttribute('aria-hidden', 'true');
            }
            const volume = controls.querySelector('.plyr__volume');
            if (volume) {
                volume.setAttribute('tabindex', '-1');
                volume.setAttribute('aria-hidden', 'true');
            }
            const volumeInput = controls.querySelector('input[type="range"]');
            if (volumeInput) volumeInput.setAttribute('tabindex', '-1');
        } catch(e){}
    })();

    // Gestionar aria-label del botón de silenciar/activar sonido
    function setMuteButtonLabel() {
        try {
            const controls = player && player.elements && player.elements.controls;
            if (!controls) return;
            const muteBtn = controls.querySelector('.plyr__control--mute, button[data-plyr="mute"], button[aria-label*="Mute"], button[aria-label*="Silenciar"]');
            if (!muteBtn) return;
            const label = player && player.muted ? 'Activar sonido' : 'Silenciar sonido';
            muteBtn.setAttribute('aria-label', label);
        } catch (e) {}
    }

    player.on && player.on('ready', setMuteButtonLabel);
    player.on && player.on('volumechange', setMuteButtonLabel);
    
    


    // Elementos de interfaz de usuario
    let counter = document.getElementsByClassName('contador'); //contadores
    let contenedorFrases = document.getElementById('contenedor-frases')
    let fraseLeerElement = document.querySelector('.frases-leer'); //frases-leer
    let grabacionResultado = document.querySelector('.contenedor-grabacion');
    let loaderGrabacion = document.querySelector('#loader-recording')
    let loaderEnvio = document.querySelector('#loader-send')
    let textoEnvio = document.getElementById('texto-envio')
    let detenerGrabacion = document.getElementById('detener-grabación')
    let grabando = document.getElementsByClassName('grabando')[1];
    let cronometro = document.getElementById('cronometro')
    let microfono = document.getElementsByClassName('contenedor-microfono')
    let contenedorInstrucciones = document.getElementsByClassName('instruccion')[0]
    let instruccionesControl = document.getElementById('instruccion-controles')
    let nextInstruction = document.querySelector('.instruccion #next')
    let prevInstruction = document.querySelector('.instruccion #prev')
    let instruccionFrase = document.getElementById('texto-instruccion')
    let temporizador = document.getElementById('temporizador')
    let instruccionLista = document.querySelector('.instruccion ul');
    let instruccionGrabando = document.getElementsByClassName('grabando')[0];
    let instruccionPermiso = document.getElementById('permiso');
    let contenedorGeneralDeGrabacion = document.getElementsByClassName('contenedor-contenido')[0];
    let queresEscucharTuGrabacion = document.getElementsByClassName('nombre-texto')[0];
    
    // Al cargar la página, el contenedor general de grabación está inerte (no puede ser seleccionado navegando con teclado)
    contenedorGeneralDeGrabacion.inert = true;
    
    // Backend var
    var pathnameURL = window.location.pathname;

    // Lista de frases de instrucciones
    const instrucciones = 
        ["Esta es la grabadora de Archivoz. El objetivo es donar tu voz para construir una base de datos de voces argentinas con el propósito de desarrollar tecnología para nuestro país.",
        "Permitenos el acceso a tu micrófono para poder grabar tu voz.",
        "Trata de:",
        "Si te trabas o te equivocas leyendo el texto, borra la grabación.",
        "En el siguiente paso vas a grabar 10 segundos de ruido de fondo para calibrar audio. Quedate en silencio y esperá a que finalice la grabación.",
        "Espera en silencio.",
        "En el siguiente paso vas a grabar 10 segundos de tu voz para calibrar audio. Prepárate para leer en voz alta el texto que verás. No importa si no llegás a leer todo.",        
        "Este es un texto de prueba que se utiliza para verificar si hay ruido en tu micrófono."
    ];

    // Instruccio actual
    let instruccionActual = 0;

    function borrarGrabacion() {
        chunks = [];
        audio.src = '';
    }

    function iniciarLoaderGrabacion(){
        loaderGrabacion.style.display = 'flex';
        loaderGrabacion.scrollIntoView({ block: "center", behavior: "smooth" });
    }

    function mostrarAudioResultado(){
        loaderGrabacion.style.display = 'none';
        grabacionResultado.style.display = 'flex';
        grabacionResultado.scrollIntoView({ block: "end", behavior: "smooth" });
        queresEscucharTuGrabacion.focus(); //Si usuario esta usando teclado, foco en escuchar grabacion
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

    function establecerFraseALeer(frase) {
        fraseLeerElement.textContent = frase;
    }

    function actualizarContador(numRecordings) {
        counter[0].innerHTML = `${numRecordings} / 20`
        counter[1].innerHTML = `${numRecordings} / 20`
    }

    function iniciarTemporizador(){
        temporizador.style.display = 'flex';
        let segundos = 10;
        let intervalo = setInterval(actualizarTemporizador, 1000)
        function actualizarTemporizador(){
            segundos--;
            temporizador.innerHTML = segundos;
            if(segundos == 0){
                clearInterval(intervalo);
                temporizador.innerHTML = 10;
                temporizador.style.display = 'none';
                mediaRecorder.stop();
            }
        }
    }

    let intervalo = null
    function iniciarCronometro(){
        let minutos = 0;
        let segundos = 0;
        let tiempo = '00:00'
        cronometro.style.display = 'block';
        document.getElementById("cronometro").innerHTML = tiempo;
        
        function actualizarCronometro() {
            segundos++;
            if (segundos === 60) {
                segundos = 0;
                minutos++;
            }

            if (minutos === 100) {
                //Error con modal y lo mando al paso anterior?
                clearInterval(intervalo);
                return;
            }

            if(minutos < 10){
                if(segundos < 10) tiempo = `0${minutos}:0${segundos}`
                else tiempo = `0${minutos}:${segundos}`
            } 
            else{
                if(segundos < 10) tiempo = `${minutos}:0${segundos}`
                else tiempo = `${minutos}:${segundos}`
            }

            document.getElementById("cronometro").innerHTML = tiempo;
        }
        
        intervalo = setInterval(actualizarCronometro, 1000);
    }

    function detenerCronometro(){
        document.getElementById("cronometro").style.display = 'none';
        clearInterval(intervalo);
    }

    async function measureSoundLevel(audioBlob, type) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        const arrayBuffer = await new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => {
                resolve(reader.result);
            };

            reader.onerror = reject;
            reader.readAsArrayBuffer(audioBlob); 
        });
        
        const buffer = await audioContext.decodeAudioData(arrayBuffer);
        const dataArray = buffer.getChannelData(0);
        
        clippíngThreshold = 0.95;
        sampleClipCountThreshold = 3;
        //isClipping = dataArray.some(sample => Math.abs(sample) >= clippíngThreshold);
        let clipCount = dataArray.filter(sample => Math.abs(sample) >= clippíngThreshold).length;
        if (clipCount >= sampleClipCountThreshold) {
            if (instruccionActual == 5) errorOcurred = {mensaje: "El audio grabado detectó un exceso de volumen. Por favor, busque un lugar silencioso y permanezca en silencio durante la grabación del sonido ambiente.", tipo: "ClippingControl"};
            if (instruccionActual == 7) errorOcurred = {mensaje: "El audio grabado detectó un exceso de volumen. Por favor, intente hablar un poco más bajo o más lejos del micrófono.", tipo: "ClippingControl"};
            mostrarError(errorOcurred.mensaje);
            instruccionActual -= 1;
            cambiarInstruccion();
            return;
        }

        // Calculate average amplitude as a measure of noise level
        const sumOfSquares = dataArray.reduce((acc, val) => acc + (val * val), 0);
        const rms = Math.sqrt(sumOfSquares / dataArray.length);
        const rms_db = 20 * Math.log10(rms);

        //console.log(rms_db);
        
        audio_duration = buffer.duration;  // In seconds
        let threshold_db;
        
        // Noise control
        switch (type) {
            case 'signal':
                threshold_db = -45;
                if (rms_db < threshold_db){
                    errorOcurred = {mensaje: "El audio grabado no tiene suficiente volumen para reconocer una voz. Asegúrate de que tu micrófono esté conectado. Si está correctamente conectado, intenta hablar más fuerte o más cerca del micrófono.\n\nEn cualquier caso, recarga la página e inténtalo de nuevo.", tipo: "NoiseControl"};
                    mostrarError(errorOcurred.mensaje)
                    instruccionActual--;
                    cambiarInstruccion();
                    return;
                }    
            break;
            case 'noise':
                threshold_db = -30;
                if (rms_db > threshold_db){
                    errorOcurred = {mensaje: "Se detectó mucho ruido en la grabación. Buscá un lugar más silencioso para continuar.", tipo: "NoiseControl"};
                    mostrarError(errorOcurred.mensaje)
                    instruccionActual--;
                    cambiarInstruccion();
                    return;
                } else{
                    instruccionActual++;
                    cambiarInstruccion();
                }              
            break;
        }

        // Control audio length
        if (buffer.duration > 60){
            errorOcurred = {mensaje: "La grabación superó el tiempo máximo.\n\nBorra la grabación y asegúrate de leer la oración en pantalla en menos de 60 segundos. ", tipo: "AudioLength"}
            mostrarError(errorOcurred.mensaje)
            return;
        }
        
        // console.log('fin reader onload');
        return rms_db;       
    }

    function measureSNR(signal_db, noise_db, min_snr_threshold_db = 20) {
        // console.log('ini SNR');
        let snr = signal_db - noise_db;
        /*console.log('S:', signal_db);
        console.log('N:', noise_db);
        console.log('SNR:', snr);*/
        if (snr < min_snr_threshold_db) {
            errorOcurred = {mensaje: "El audio grabado no tiene suficiente volumen para reconocer una voz por encima del ruido, intenta hablar más fuerte, más cerca del micrófono o buscá un lugar más silencioso.", tipo: "SNRControl"};
            mostrarError(errorOcurred.mensaje)
            audioType = 'noise'; //Cambio el tipo de audio porque se reinicia el proceso
            instruccionActual = 4; //Vuelvo al primer paso del chequeo
            cambiarInstruccion();
        } else{
            document.getElementById('instrucciones').style.display = 'none';
            contenedorGeneralDeGrabacion.inert = false;
            audioType = 'recording';
            errorOcurred = null;
            fraseLeerElement.focus(); //Si usuario esta usando teclado, foco en instrucción previa a grabar
        }
        // console.log('fin SNR');
    }

    // Obtener datos del usuario desde el backend
    obtenerDatos(id_user)
        .then(data => {
            fraseALeer = data.text_to_display
            actualizarContador(data.num_recordings)
        })
        .catch(error => {
            // Mostrar modal ademas de cambiar la frase
            // Deberia chequear si ya se leyeron todas las frases, si es asi, inhabilito el boton
            // Habria que inhabilitar desde el back tambien
            errorOcurred = {mensaje: 'Ocurrió un error inesperado.\n\nRecarga la página o inténtalo más tarde.', tipo: 'datosIniciales'}
            fraseALeer = 'Ocurrió un error inesperado.\n\nRecarga la página o inténtalo más tarde.'
            actualizarContador('0')
            mostrarError(errorOcurred.mensaje)
            console.error('Error:', error);
        })
        .finally(() => {
            microfono[0].style.pointerEvents = 'all'
            microfono[1].style.pointerEvents = 'all'
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
             channelCount: 1,    // 1 mono, 2 estereo
             echoCancellation: true,  // Para testear
         }
     };
   
    // Evento para controlar la entrada de audio
    navigator.mediaDevices.getUserMedia(audioConstraints)
        .then(stream => {
            // No soporta mp3 para real time recording
            // const options = {
            //     audioBitsPerSecond:320000,
            //     mimeType:"audio/mpeg",
            // };
            mediaRecorder = new MediaRecorder(stream);
            
            // Cuando nota que empezamos a grabar
            mediaRecorder.ondataavailable = event => {
                chunks.push(event.data); //Ingresa los datos al chunk
            };
            
            // Cuando paramos de grabar, es decir, de meter audio
            mediaRecorder.onstop = async () => {
                if(audioType == 'recording'){
                    // Mostramos loader
                    iniciarLoaderGrabacion();
                }
                // // Mostramos loader
                // iniciarLoaderGrabacion();
                // Crea un Blob con el resultado
                const audioBlob = new Blob(chunks, { type: 'audio/wav' });
                // Lo convierte en una URL
                const audioURL = URL.createObjectURL(audioBlob);
                // Y lo pasa al reproductor
                audio.src = audioURL;

                if(audioType == 'recording'){
                    mostrarAudioResultado()
                    return;
                }

                // Calcular valor RMS del audio
                let rms_db = await measureSoundLevel(audioBlob, audioType);                
                // console.log('post measure');

                if (!rms_db) return;

                // Si ya se midió el ruido, se calcula la SNR.
                if(audioType == 'signal'){
                    measureSNR(rms_db, noise_db);                    
                } else{
                    noise_db = rms_db;
                    audioType = 'signal';
                }
            };
        })
        .catch(err => {
            console.error('Error: ' + err);
            switch(err.name){
                case "NotAllowedError":
                    errorOcurred = {mensaje: 'Permiso de micrófono denegado.\n\nPermita su uso y recargue la página.', tipo: err.name}
                    return mostrarError(errorOcurred.mensaje);
                case "NotReadableError":
                    errorOcurred = {mensaje: 'El micrófono está siendo usado por otra aplicación.\n\nDesconéctelo y recargue la página.', tipo: err.name}
                    return mostrarError(errorOcurred.mensaje);
                case "NotFoundError":
                    errorOcurred = {mensaje: 'No hay ningún micrófono conectado.\n\nConéctelo y recargue la página.', tipo: err.name}
                    return mostrarError(errorOcurred.mensaje);
                default:
                    errorOcurred = {mensaje: 'Ocurrió un error inesperado.\n\nRecarga la página o inténtalo más tarde.', tipo: 'Desconocido'}
                    return mostrarError(errorOcurred.mensaje)
            }
        });

    async function cambiarInstruccion(){
        // console.log(instruccionActual)
        if(instruccionActual == -1) return;
        instruccionFrase.innerHTML = instrucciones[instruccionActual]
        
        
        if(instruccionActual == 0){
            prevInstruction.style.visibility = 'hidden';
        } else{
            prevInstruction.style.visibility = 'visible';
        }

        if(instruccionActual == 1){
            navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            .catch(err => {
                errorOcurred = { mensaje: 'Permiso de micrófono denegado.\n\nPermita su uso y recargue la página.', tipo: err.name };
                mostrarError(mensaje);
            })
            instruccionFrase.style.display = 'none';
            instruccionPermiso.style.display = 'block';
            instruccionPermiso.focus();
        } else{
            instruccionFrase.style.display = 'block';
            instruccionFrase.focus()
            instruccionPermiso.style.display = 'none';
        }

         if(instruccionActual == 2){
            instruccionLista.style.display = 'block';
            instruccionFrase.style.flex = '0';
            instruccionFrase.style.alignSelf = 'start';
            instruccionFrase.focus();
            
        } else{
            instruccionLista.style.display = 'none';
            instruccionFrase.style.flex = '1';
            instruccionFrase.style.alignSelf = 'center';
        }

        if(instruccionActual == 3){
            instruccionFrase.focus();
        }

        if(instruccionActual == 4 || instruccionActual == 6){
            instruccionGrabando.style.display = 'none'
            contenedorInstrucciones.style.border = 'none';
            instruccionesControl.style.display = 'flex';
            instruccionFrase.focus();
        }

        if(instruccionActual == 4){
            prevInstruction.style.visibility = 'visible';
        }

        if(instruccionActual == 6){
            prevInstruction.style.visibility = 'hidden';
        }

        if(instruccionActual == 5 || instruccionActual == 7){
            instruccionGrabando.style.display = 'flex'
            contenedorInstrucciones.style.border = '5px solid red';
            instruccionesControl.style.display = 'none';
            borrarGrabacion();
            mediaRecorder.start();
            iniciarTemporizador();
            instruccionFrase.focus();
        }
    }
    
    nextInstruction.addEventListener('click', (e) => {
        instruccionActual++;
        cambiarInstruccion();
    })

    prevInstruction.addEventListener('click', (e) => {
        instruccionActual--;
        cambiarInstruccion();
    })

    let recording = false;
    recordingButtonDesktop.addEventListener('click', (e) => {
        if(!errorOcurred){
            borrarGrabacion();
            establecerFraseALeer(fraseALeer)
            mediaRecorder.start(); //Empezamos a grabar
            deleteBtn.disabled = true;
            sendBtn.disabled = true;

            detenerGrabacion.style.display = 'block';
            detenerGrabacion.scrollIntoView({ block: "end", behavior: "smooth" });
            grabando.style.display = 'flex';
            contenedorFrases.style.border = '5px solid red';
            recordingButtonDesktop.style.display = 'none';
            document.getElementsByClassName('cantidad-grabaciones')[0].style.display = 'none';
            grabando.focus(); //Si usuario esta usando teclado, foco en grabando
            iniciarCronometro();
        } else{
            return mostrarError(`No puede continuar con el proceso porque ocurrió un error:\n\n${errorOcurred.mensaje}`)
        }
    });

    detenerGrabacion.addEventListener('click', (e) => {
            mediaRecorder.stop(); //Paramos de grabar
            deleteBtn.disabled = false;
            sendBtn.disabled = false;
            detenerGrabacion.style.display = 'none';
            grabando.style.display = 'none';
            contenedorFrases.style.border = 'none';
            recordingButtonDesktop.style.display = 'none';
            detenerCronometro();
        })

    recordingButtonMobile.addEventListener('click', (e) => {
       
        if(!recording){ //Si no estamos grabando
            // cambiarAnimacion(); // Alternar entre animaciones
            borrarGrabacion();
            mediaRecorder.start(); //Empezamos a grabar
            deleteBtn.disabled = true;
            sendBtn.disabled = true;
            cambiarIcono(e.srcElement.children[0]);
            recording = true;
        } else{ //Si estamos grabando
            // cambiarAnimacion();
            mediaRecorder.stop(); //Paramos de grabar
            deleteBtn.disabled = false;
            sendBtn.disabled = false;
            deshabilitarGrabar()
            cambiarIcono(e.srcElement.children[0]);
            recording = false;
        }
    });

    let clicked = false;
    deleteBtn.addEventListener('click', () => {
        if(!clicked){  // Para que el usuario no borre el mismo audio multiples veces, clickeando el boton repetidas veces
            clicked = true;
            if(!errorOcurred || errorOcurred.tipo === "AudioLength"){
                deleteBtn.disabled = true;
                sendBtn.disabled = true;
                borrarGrabacion();
    
                var form = new FormData();
                form.append("errorOcurred", "True");  
        
                fetch(pathnameURL, {
                    method: 'POST',
                    body: form,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                    }
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Error en la solicitud fetch: ' + response.statusText);
                    }
                    return response.json();
                })
                .then(data => {
                    errorOcurred = null; // Para que pueda seguir grabando en caso de que haya borrado un audio largo.
                    fraseALeer = data.text_to_display
                    establecerFraseALeer(fraseALeer);
                    ocultarAudioResultado();
                    establecerFraseALeer("Cuando estés listo, pulsa el botón para empezar a grabar");
                    document.getElementsByClassName('cantidad-grabaciones')[0].style.display = 'flex';
                    recordingButtonDesktop.style.display = 'flex';
                    recordingButtonDesktop.scrollIntoView({ block: "end", behavior: "smooth" });
                    recordingButtonDesktop.focus(); //Si usuario esta usando teclado, foco en grabar
                })
                .catch(error => {
                    errorOcurred = {mensaje:'Ocurrió un error durante el borrado del audio.\n\nInténtalo de nuevo.', tipo: 'AudioDeleted' }
                    mostrarError(errorOcurred.mensaje)
                    console.error('Error:', error);
                })
                .finally(() => {
                    clicked = false;
                })
            } else{
                mostrarError(`No puede continuar con el proceso porque ocurrió un error:\n\n${errorOcurred.mensaje}`)
                clicked = false;
            }
        }
        
    });

    sendBtn.addEventListener('click', () => {
        if(!clicked){ // Para que el usuario no mande el mismo audio multiples veces, clickeando el boton repetidas veces
            clicked = true;
            if(!errorOcurred){
               
                // Realizar una solicitud POST al backend con el audio y el ID del texto
                const audioBlob2 = new Blob(chunks, { type: mediaRecorder.mimeType });  // Antes 'audio/mpeg-3'
                // Aca en type yo puedo poner lo que quiera en type, eso no significa que me lo guarda
                // como mp3, es una referencia para el que recibe el blob. Es un standar called MIME.
                // Con la línea que puse, me muestra el formato real en el que se esta grabando, que es webM,
                // tendría que encontrar la forma de pasar de webM a valid mp3 desde acá o hacerlo después desde
                // el back.
                // console.log("Este es el blob")
                // console.log(audioBlob2)
    
                var form = new FormData();
                form.append('file', audioBlob2, 'data.webm');
                form.append("duration", audio_duration);
                form.append("errorOcurred", "False");  

                iniciarLoaderEnvio();
                fetch(pathnameURL, {
                        method: 'POST',
                        body: form,
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest',
                        }
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Error en la solicitud fetch: ' + response.statusText);
                        }
                        return response.json();
                    })
                    .then(data => {
                        // Actualizar la interfaz con el texto obtenido del backend
                        fraseALeer = data.text_to_display
                        establecerFraseALeer("Cuando estés listo, pulsa el botón para empezar a grabar");
                        actualizarContador(data.num_recordings);
                        borrarGrabacion();
                        detenerLoaderEnvio();
                        ocultarAudioResultado();
                        deleteBtn.disabled = true;
                        sendBtn.disabled = true;
                        document.getElementsByClassName('cantidad-grabaciones')[0].style.display = 'flex';
                        recordingButtonDesktop.style.display = 'flex';
                        recordingButtonDesktop.scrollIntoView({ block: "end", behavior: "smooth" });
                        recordingButtonDesktop.focus(); //Si usuario esta usando teclado, foco en grabar

                    })
                    .catch(error => {
                        errorOcurred = {mensaje:'Ocurrió un error durante el envió del audio.\n\nInténtalo de nuevo.', tipo: 'AudioDeleted' }
                        mostrarError(errorOcurred.mensaje)
                        console.error('Error:', error);
                    })
                    .finally(() => {
                        clicked = false;
                    })
            } else {
                if(errorOcurred.type == 'AudioLength') mostrarError(`No puede enviar el audio porque ocurrió un error:\n\n${errorOcurred.mensaje}`)
                else mostrarError(`No puede continuar con el proceso porque ocurrió un error:\n\n${errorOcurred.mensaje}`)
                clicked = false;
            }
        }
      }
    );
});
