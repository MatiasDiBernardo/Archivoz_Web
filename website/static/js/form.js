document.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('error')?.innerText){ //Si hay un error, muestra el modal

        const modalElement = document.getElementById("errorModal");
        if (!modalElement) return;

        console.log(modalElement)

        // Keep track of previously focused element so we can restore focus after closing
        const previouslyFocused = document.activeElement;

        // Elements to make inert while modal is open
        const navegacion = document.querySelector(".nav-conteiner")
        const jumbotron = document.getElementById('jumbo-canvas')
        const contenedorFormulario = document.getElementById('contenedor-formularios')
        const footer = document.querySelector('.footer');

        // Aparecer overlay
        let backdrop = document.getElementById('custom-modal-backdrop');
        backdrop.style.display = 'block';

        // Hacer modal visible e interactuable
        modalElement.style.display = 'block';
        modalElement.classList.add('show');
        modalElement.style.zIndex = '9999';
        modalElement.inert = false;
        modalElement.setAttribute('aria-hidden', 'false');

        console.log(modalElement.inert)

        const errorTitle = modalElement.querySelector('.modal-title');
        errorTitle.focus();

        
        if (contenedorFormulario) contenedorFormulario.inert = true;
        if (jumbotron) jumbotron.inert = true;
        if (navegacion) navegacion.inert = true;
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

            if (contenedorFormulario) contenedorFormulario.inert = false;
            if (jumbotron) jumbotron.inert = false;
            if (navegacion) navegacion.inert = false;
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
    
    document.querySelector('.jumbotron button').addEventListener('click', function(e) {
        
        const modalElement = document.getElementById("infoModal");
        if (!modalElement) return;

        // Keep track of previously focused element so we can restore focus after closing
        const previouslyFocused = document.activeElement;

        // Elements to make inert while modal is open
        const navegacion = document.querySelector(".nav-conteiner")
        const jumbotron = document.getElementById('jumbo-canvas')
        const contenedorFormulario = document.getElementById('contenedor-formularios')
        const footer = document.querySelector('.footer');

        // Aparecer overlay
        let backdrop = document.getElementById('custom-modal-backdrop');
        backdrop.style.display = 'block';

        // Hacer modal visible e interactuable
        modalElement.style.display = 'block';
        modalElement.classList.add('show');
        modalElement.style.zIndex = '9999';
        modalElement.inert = false;
        modalElement.setAttribute('aria-hidden', 'false');

        const infoTitle = modalElement.querySelector('.modal-title');
        infoTitle.focus();

        
        if (contenedorFormulario) contenedorFormulario.inert = true;
        if (jumbotron) jumbotron.inert = true;
        if (navegacion) navegacion.inert = true;
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

            if (contenedorFormulario) contenedorFormulario.inert = false;
            if (jumbotron) jumbotron.inert = false;
            if (navegacion) navegacion.inert = false;
            if (footer) footer.inert = false;

            if (previouslyFocused) previouslyFocused.focus();

            if (closeButton[0]) closeButton[0].removeEventListener('click', closeModal);

            document.removeEventListener('keydown', keyHandler);
        }

        function keyHandler(e) {
            if (e.key === 'Escape') closeModal();
        }

        if (closeButton[0]) closeButton[0].addEventListener('click', closeModal);
        document.addEventListener('keydown', keyHandler);
    });

    // Obtener todos los elementos focuseables del formulario
    const focusableElements = document.querySelectorAll(
        'input, select, textarea, span, button[type="submit"]'
    );

    focusableElements.forEach(function(element, index) {
        element.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {

                if (this.type === 'submit') {
                return; // No prevenir, dejar que funcione normal
                }   

                // Si es un select, dejarlo funcionar naturalmente (abre las opciones)
                if (this.tagName === 'SELECT') {
                    return;
                }

                e.preventDefault();
                
                // Para checkboxes, marcar/desmarcar
                if (this.type === 'checkbox') {
                    this.checked = !this.checked;
                }
                
                

                // Mover al siguiente elemento
                const nextIndex = index + 1;
                if (nextIndex < focusableElements.length) {
                    focusableElements[nextIndex].focus();
                } else {
                    // Estamos en el último elemento (botón), hacer submit
                    this.click();
                }
            }
        });
    });
})

