document.addEventListener('DOMContentLoaded', () => {
    if(error.innerText){ //Si hay un error, muestra el modal
        const errorModal = document.getElementById('errorModal')
        $(errorModal).modal('show');
    }
})