const navegacion = document.querySelector(".nav-conteiner__navegacion")
const contenedorGeneralDeFormulario = document.getElementsByClassName('contenedor-externo-general')[0];
const footer = document.querySelector('.footer');

// Mira si la vista actual muestra el menu de hamburguesa (vista "movil")
const menuWatcher = window.matchMedia("(max-width: 1070px)");
let menuIsActive = menuWatcher.matches;

function handleMenuChange(e) {
    menuIsActive = e.matches;
    // Si el menu de la navbar está abierto en vista "movil", habilita los enlaces del navbar, bloquea el resto
    if(e.matches && navegacion.classList.contains("nav-conteiner__navegacion-visible")) {
        navegacion.querySelectorAll("a").forEach(el => el.inert = false);
        if(contenedorGeneralDeFormulario) contenedorGeneralDeFormulario.inert = true;
        if(footer) footer.inert = true;    
    } 
    // Si el menu de la navbar está cerrado en vista "movil", bloquea los enlaces del navbar, habilita el resto
    else if(e.matches && !navegacion.classList.contains("nav-conteiner__navegacion-visible")) {
        navegacion.querySelectorAll("a").forEach(el => el.inert = true);
        if(contenedorGeneralDeFormulario) contenedorGeneralDeFormulario.inert = false;
        if(footer) footer.inert = false;    
    } 

    // Si no es vista "movil", habilita todo
    else {
      navegacion.querySelectorAll("a").forEach(el => el.inert = false);
      if(contenedorGeneralDeFormulario) contenedorGeneralDeFormulario.inert = false;
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
    if(contenedorGeneralDeFormulario) contenedorGeneralDeFormulario.inert = true;
    if(footer) footer.inert = true;
  } else{ // Si el menu se cierra, que rehabilite el scroll, bloquee los enlaces del navbar y habilite el resto de la pagina para ser navegada por tabulador
    navegacion.querySelectorAll("a").forEach(el => el.inert = true);
    if(contenedorGeneralDeFormulario) contenedorGeneralDeFormulario.inert = false;
    if(footer) footer.inert = false;
    document.body.style.overflow = 'initial';
  }

});