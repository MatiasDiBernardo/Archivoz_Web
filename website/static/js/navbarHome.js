// --------------------------------------------------------------------------------
// Código para el menú de navegación responsive (navbar)
// --------------------------------------------------------------------------------

const navegacion = document.querySelector(".nav-conteiner__navegacion")
const contenedorGeneral = document.getElementById('container-general');
const footer = document.querySelector('.footer');

// Mira si la vista actual muestra el menu de hamburguesa (vista "movil")
const menuWatcher = window.matchMedia("(max-width: 1070px)");
let menuIsActive = menuWatcher.matches;

function handleMenuChange(e) {
    menuIsActive = e.matches;
    // Si el menu de la navbar está abierto en vista "movil", habilita los enlaces del navbar, bloquea el resto
    if(menuIsActive && navegacion.classList.contains("nav-conteiner__navegacion-visible")) {
        navegacion.querySelectorAll("a").forEach(el => el.inert = false);
        if(contenedorGeneral) contenedorGeneral.inert = true;
        if(footer) footer.inert = true;    
    } 
    // Si el menu de la navbar está cerrado en vista "movil", bloquea los enlaces del navbar, habilita el resto
    else if(menuIsActive && !navegacion.classList.contains("nav-conteiner__navegacion-visible")) {
        navegacion.querySelectorAll("a").forEach(el => el.inert = true);
        if(contenedorGeneral) contenedorGeneral.inert = false;
        if(footer) footer.inert = false;    
    } 

    // Si no es vista "movil", habilita todo
    else {
      navegacion.querySelectorAll("a").forEach(el => el.inert = false);
      if(contenedorGeneral) contenedorGeneral.inert = false;
      if(footer) footer.inert = false;
      document.body.style.overflow = 'initial';
    }
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  handleMenuChange(menuWatcher);
});

//Esto tuve que añadirlo para lidiar con la navegación por tabulador basicamente
menuWatcher.addEventListener('change', (e) => { handleMenuChange(e) });

// Al presionar el boton de navegacion en la vista de movil desplaza el menu para abrirlo o cerrarlo.
document.querySelector(".nav-conteiner__boton-menu").addEventListener("click", () => {
  
  // Elemento de navegacion donde se encuentran los enlaces del navbar.
  const navegacion = document.querySelector(".nav-conteiner__navegacion")
  // Abre o cierra el menu de navegacion
  navegacion.classList.toggle("nav-conteiner__navegacion-visible");

  
  // Si el menu está abierto, que bloquee el scroll, habilite los enlaces del navbar y bloquee el resto de la pagina para ser navegada por tabulador
  if(navegacion.classList.contains("nav-conteiner__navegacion-visible")) {
    document.body.style.overflow = 'hidden';
    navegacion.querySelectorAll("a").forEach(el => el.inert = false);
    if(contenedorGeneral) contenedorGeneral.inert = true;
    if(footer) footer.inert = true;
  } else{ // Si el menu se cierra, que rehabilite el scroll, bloquee los enlaces del navbar y habilite el resto de la pagina para ser navegada por tabulador
    navegacion.querySelectorAll("a").forEach(el => el.inert = true);
    if(contenedorGeneral) contenedorGeneral.inert = false;
    if(footer) footer.inert = false;
    document.body.style.overflow = 'initial';
  }

});

// --------------------------------------------------------------------------------
// Código para la navegación suave al pulsar los enlaces del navbar
// --------------------------------------------------------------------------------

let linkInicio = document.getElementById("a-inicio");
let linkObjetivos = document.querySelectorAll(".a-objetivos");
let linkParticipar = document.querySelectorAll(".a-participar");
let linkTTS = document.querySelectorAll(".a-TTS");
let linkMapa = document.querySelectorAll(".a-mapa");
let linkInfo = document.querySelectorAll(".a-info");
let navbar = null;
let objetivos = null;
let participar = null;
let TTS = null;
let mapa = null;
let info = null;

// Si el menu de la navbar está abierto, que se cierre al pulsar un link
function ocultarNavbar(elemento){
    menuIsActive = menuWatcher.matches;
    if(menuIsActive && navegacion.classList.contains("nav-conteiner__navegacion-visible")) {
        navegacion.classList.toggle("nav-conteiner__navegacion-visible");
        navegacion.querySelectorAll("a").forEach(el => el.inert = true);
        if(contenedorGeneral) contenedorGeneral.inert = false;
        if(footer) footer.inert = false;
        document.body.style.overflow = 'initial';
    }

    elemento?.focus()
}


linkInicio.addEventListener("click", (e) => {
  e.preventDefault();
  navbar = document.getElementsByClassName("nav-conteiner")[0];
  navbar.scrollIntoView({ block: "start", behavior: "smooth" });
  ocultarNavbar(navbar.firstElementChild)
});

linkObjetivos.forEach((i) => {
  i.addEventListener("click", (e) => {
    e.preventDefault();
    objetivos = document.getElementById("objectives");
    objetivos.scrollIntoView({ block: "start", behavior: "smooth" });
    ocultarNavbar(objetivos.firstElementChild)
  })
})

linkParticipar.forEach((i) => {
  i.addEventListener("click", (e) => {
    e.preventDefault();
    participar = document.getElementById("voice-archive").firstElementChild
    participar.scrollIntoView({ block: "start", behavior: "smooth" });
    ocultarNavbar(participar)
  })
})

linkTTS.forEach((i) => {
  i.addEventListener("click", (e) => {
    e.preventDefault();
    TTS = document.getElementById("text-to-speech").firstElementChild;
    TTS.scrollIntoView({ block: "start", behavior: "smooth" });
    ocultarNavbar()
  })
})

linkMapa.forEach((i) => {
  i.addEventListener("click", (e) => {
    e.preventDefault();
    hero.scrollIntoView({ block: "start", behavior: "smooth" });
    ocultarNavbar()
  })
})

linkInfo.forEach((i) => {
  i.addEventListener("click", (e) => {
    e.preventDefault();
    info = document.getElementById("infosection").firstElementChild;
    info.scrollIntoView({ block: "start", behavior: "smooth" });
    ocultarNavbar(info)
  })
})


