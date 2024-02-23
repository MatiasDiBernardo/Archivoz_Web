document.addEventListener('DOMContentLoaded', function () {
    const botonCambioFormulario = document.getElementById('boton');
    const formularioRegistrarse = document.getElementById('Registrarse');
    const formularioIniciarSesion = document.getElementById('Iniciar-sesion');
  
    botonCambioFormulario.addEventListener('click', function () {
      formularioRegistrarse.classList.toggle('formulario-activo');
      formularioIniciarSesion.classList.toggle('formulario-activo');
    });
  });

// Al presionar el boton de navegacion en la vista de movil desplaza el menu para abrirlo o cerrarlo.
document.querySelector(".nav-conteiner__boton-menu").addEventListener("click", () => {
  // Elemento de navegacion donde se encuentran los enlaces del navbar.
  const navegacion = document.querySelector(".nav-conteiner__navegacion")
  navegacion.classList.toggle("nav-conteiner__navegacion-visible");
  if(navegacion.classList.contains("nav-conteiner__navegacion-visible")) {
      boton.setAttribute("aria-label", "Cerrar menú")
  } else {
      boton.setAttribute("aria-label", "Abrir menú")
  }
});