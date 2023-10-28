document.addEventListener('DOMContentLoaded', function () {
    const botonCambioFormulario = document.getElementById('boton');
    const formularioRegistrarse = document.getElementById('Registrarse');
    const formularioIniciarSesion = document.getElementById('Iniciar-sesion');
  
    botonCambioFormulario.addEventListener('click', function () {
      formularioRegistrarse.classList.toggle('formulario-activo');
      formularioIniciarSesion.classList.toggle('formulario-activo');
    });
  });