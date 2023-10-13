const selectRegion = document.getElementById("Region");

selectRegion.addEventListener("focus", function () {
    this.setAttribute("size", "6");
});

selectRegion.addEventListener("blur", function () {
    this.setAttribute("size", "1");
});

selectRegion.addEventListener("change", function () {
    this.setAttribute("size", "1"); // Cierra automáticamente después de seleccionar una opción
});