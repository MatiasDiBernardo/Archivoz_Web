
let texto = document.getElementById('exampleFormControlTextarea1')
let textoOld = null;
let hablar = document.getElementById('playBtn')
let descargar = document.getElementById('downloadBtn')
//Loader vars
let cargador = document.getElementById("carga")
var count = 30;
var closer = $('.close');



hablar.addEventListener('click', function () {
  var queryString = parametters_.substring(1);
  //var modelo = queryString.toLowerCase();
  var modeloFinal = queryString.slice(0, -1);
  //console.log(queryString);
  //console.log(modeloFinal);
  
    if (textoOld != texto.value) {
      closer.addClass('myDisable');
      count = 30;
      cargandotxt.textContent = "Cargando..."
      loader.style.width = "86vw";  
      loader.style.height = "27vh";  
      loader.style.opacity = 1;     
      move();
      
        let result = texto.value.split(' ');        
        for (let i = 0; i < result.length - 1; i++) {
            result[i] = result[i] + '%20'
        }
        let resultadoFinal = result.join('');

        //REQUEST

        axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';
        axios({
            url:"https://backend.archivoz.ai",
            method: "POST",
            data: {
              text: resultadoFinal,
              model: modeloFinal
            },
            responseType: "arraybuffer",
            onDownloadProgress: function (progressEvent) {
              // Do whatever you want with the native progress event
              count = 650;
              cargador.x2.baseVal.value = count;
              //console.log(progressEvent);

              
            }

          }).then((response) => {
           cargandotxt.textContent = "Cargando..."
           closer.removeClass('myDisable');
           count = 30;
           cargador.x2.baseVal.value = count;
           loader.style.width = "0%";  
           loader.style.height = "0%"; 
           loader.style.opacity = 0; 
           url = window.URL.createObjectURL(new Blob([response.data]));
           link = document.createElement('a');
           w = new Audio();
           w.src = url;
           w.play();
           link.href = url;

          }).catch(function(error){
            cargandotxt.textContent = "Upps!"
            count = 651;
            closer.removeClass('myDisable');
            //console.log(error);
            var mjs = " ¡ " + error + " ! "
            loading_message.textContent = mjs;
            loader.style.width = "86vw";  
            loader.style.height = "27vh"; 
            loader.style.opacity = 1;
            //console.log(loading_message.textContent); 
          })


        textoOld = texto.value
    }else{
      w.play();
    }

})

//Progresso del loader
function move(){
  
  var id = setInterval(frame, 1000);

  function frame(){
    //console.log(count)
    if(count >= 650){
      clearInterval(id);
    }else{
      count = count + 10;
      cargador.x2.baseVal.value = count;
    }
  }

}

// funcion descargar

descargar.addEventListener("click", function(){

  link.setAttribute('download', 'Archivoz.mp3'); //or any other extension
  document.body.appendChild(link);
  link.click();
  
})

