// Al presionar el boton de navegacion en la vista de movil desplaza el menu para abrirlo o cerrarlo.
document.querySelector(".nav-conteiner__boton-menu").addEventListener("click", () => {
  
  // Elemento de navegacion donde se encuentran los enlaces del navbar.
  const navegacion = document.querySelector(".nav-conteiner__navegacion")
  navegacion.classList.toggle("nav-conteiner__navegacion-visible");
  
  // Si el menu está abierto, que bloquee el scroll
  if(navegacion.classList.contains("nav-conteiner__navegacion-visible")) {
    document.body.style.overflow = 'hidden';
  } else{ // Si el menu se cierra, que rehabilite el scroll
    document.body.style.overflow = 'initial';
  }
});