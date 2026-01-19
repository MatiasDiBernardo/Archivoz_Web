const navegacion = document.querySelector(".nav-conteiner__navegacion")
const contenedorGeneralDeGrabacion = document.getElementsByClassName('contenedor-contenido')[0];
const instrucciones = document.getElementById('instrucciones');
const footer = document.querySelector('.footer');

// Mira si la vista actual muestra el menu de hamburguesa (vista "movil")
const menuWatcher = window.matchMedia("(max-width: 1070px)");
let menuIsActive = menuWatcher.matches;

//Esto tuve que añadirlo para lidiar con la navegación por tabulador basicamente
function handleMenuChange(e) {
    menuIsActive = e.matches;
    // Si el menu de la navbar está abierto en vista "movil", habilita los enlaces del navbar, bloquea el resto
    if(e.matches && navegacion.classList.contains("nav-conteiner__navegacion-visible")) {
        navegacion.querySelectorAll("a").forEach(el => el.inert = false);
        if(contenedorGeneralDeGrabacion && instrucciones.style.display == 'none') contenedorGeneralDeGrabacion.inert = true;
        if(instrucciones) instrucciones.inert = true;
        if(footer) footer.inert = true;    
    } 
    // Si el menu de la navbar está cerrado en vista "movil", bloquea los enlaces del navbar, habilita el resto
    else if(e.matches && !navegacion.classList.contains("nav-conteiner__navegacion-visible")) {
        navegacion.querySelectorAll("a").forEach(el => el.inert = true);
        if(contenedorGeneralDeGrabacion && instrucciones.style.display == 'none') contenedorGeneralDeGrabacion.inert = false;
        if(instrucciones) instrucciones.inert = false;
        if(footer) footer.inert = false;
    } 

    // Si no es vista "movil", habilita todo
    else {
      navegacion.querySelectorAll("a").forEach(el => el.inert = false);
      if(contenedorGeneralDeGrabacion && instrucciones.style.display == 'none') contenedorGeneralDeGrabacion.inert = false;
      if(instrucciones) instrucciones.inert = false;
      if(footer) footer.inert = false;
      document.body.style.overflow = 'initial';
    }
}    

menuWatcher.addEventListener('change', (e) => { handleMenuChange(e) });

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  handleMenuChange(menuWatcher);
});

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
    if(contenedorGeneralDeGrabacion) contenedorGeneralDeGrabacion.inert = true;
    if(instrucciones) instrucciones.inert = true;
    if(footer) footer.inert = true;
  } else{ // Si el menu se cierra, que rehabilite el scroll, bloquee los enlaces del navbar y habilite el resto de la pagina para ser navegada por tabulador
    navegacion.querySelectorAll("a").forEach(el => el.inert = true);
    if(contenedorGeneralDeGrabacion && instrucciones.style.display == 'none') contenedorGeneralDeGrabacion.inert = false;
    if(instrucciones) instrucciones.inert = false;
    if(footer) footer.inert = false;
    document.body.style.overflow = 'initial';
  }


});