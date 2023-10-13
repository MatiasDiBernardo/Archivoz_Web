let waveforms = []
let wavesurfer = []
let contenedor = document.querySelector('.audios')
let comenzar = document.querySelector('.miBtn')
let numVoces = 2;
let playEnable = false;
var ttsModal = $('#ttsModal')
let yOff = window.pageYOffset
var parametters_="";

//ttsvars
let loading_message = document.getElementById('loader_message')
let cargandotxt = document.getElementById('cargandotxt')
let loader = document.getElementById('loader')
let url;
let link;
let w;


for (let i = 0; i < vocesIntro.length; i++) {
    let x = Math.floor(Math.random() * (contenedor.offsetWidth * 0.8))
    let y = Math.floor(Math.random() * (contenedor.offsetHeight))
    waveforms.push(document.createElement('div'))
    waveforms[i].id = vocesIntro[i].nombre + i
    waveforms[i].className = 'onda'

   
    /*var wWidth = window.screen.width

    if(wWidth > 810){
      waveforms[i].style.marginLeft = x + 'px'
      waveforms[i].style.marginTop = (y) + 'px'
    }*/

    

    contenedor.appendChild(waveforms[i])

    wavesurfer[i] = WaveSurfer.create({
        container: `#${vocesIntro[i].nombre + i}`,
        waveColor: 'violet',
        progressColor: 'purple',
        barWidth:1,
        barHeight: 2,
        hideScrollbar: true,
        cursorWidth: 0
    });
    

    wavesurfer[i].load(vocesIntro[i].audio);
    wavesurfer[i].backend.ac.resume()

    waveforms[i].addEventListener('mouseenter', function (e) {
        if (playEnable) {
            wavesurfer[i].play();
        }
    })

    waveforms[i].addEventListener('mouseleave', function (e) {
        wavesurfer[i].stop();
    })

    waveforms[i].addEventListener('click', function (e) {
        
        //window.location.href = `src/tts/tts.html?${wavesurfer[i].container.id}`;
        //window.location.href = `?${wavesurfer[i].container.id}`;
        parametters_ = `?${wavesurfer[i].container.id}`;
        ttsModal.modal({
            keyboard:false,
            backdrop : 'static',
            focus:true,
        });
        ttsModal.on("hidden.bs.modal", function() {
           restart();
          });
        
    })
}

function restart(){
    //console.log("hidden.bs.modal");
    $(".form-control").val('');
    parametters_ = "";
    loader.style.opacity = 0; 
    loading_message.textContent = "Estamos procesando tu voz..."
    link.href="";
    w.src="";
}

comenzar.addEventListener('click', function (e) {

    playEnable = true;
    contenedor.style.opacity = 1;
    comenzar.style.display = 'none';
})
