let submit = document.querySelector("#submit-TTS");
let selectContainer = document.getElementById("select-container");
let textArea = document.getElementById("textarea-TTS");
let select = document.getElementById("select-model");
let error = document.getElementById("error-TTS");
let audioContainer = document.getElementById("audio-container");
let audioWrapper = document.getElementById("audio-wrapper");
let loader = document.getElementById("loader-wrapper");

// Devuelve un string vacio o con el error del textarea
function validateTextArea() {
  if (!textArea.value) return "Agregue texto e intentelo de nuevo!";
  if (textArea.value.length < 2)
    return "El texto debe tener un minimo de 2 caracteres!";
  return "";
}

// Devuelve un string vacio o con el error del select
function validateSelect() {
  if (!select.value) return "Selecciona una voz e intentelo de nuevo!";
  return "";
}

function validateFields() {
  let wasError = false;

  // Si hay un problema con el textarea, lo mostramos
  let textAreaError = validateTextArea();
  if (textAreaError) {
    textArea.style.outline = "1px solid red";
    error.textContent = textAreaError; // Muestro el span con el error
    error.scrollIntoView({ block: "nearest", behavior: "smooth" });
    wasError = true;
  } else {
    textArea.style.outline = "none";
  }

  // Si hay un problema con el select, lo mostramos
  let selectError = validateSelect();
  if (selectError) {
    selectContainer.style.borderColor = "red";
    error.textContent = selectError; // Muestro el span con el error
    error.scrollIntoView({ block: "nearest", behavior: "smooth" });
    wasError = true;
  } else {
    selectContainer.style.borderColor = "black";
  }

  if (wasError) return false;
  error.textContent = "";
  return true;
}

submit.addEventListener("click", function (e) {
  e.preventDefault();

  if (!validateFields()) return;

  // Creo un objeto FormData para enviar datos al servidor
  var formData = new FormData();
  formData.append("textToAudio", textArea.value);
  formData.append("modeloTTS", select.value);

  // Elimino el audioContainer (esto porque puede ser la segunda vez que se procesa el audio)
  audioContainer.style.display = "none";
  loader.style.display = "flex"; // Muestro el loader
  audioWrapper.scrollIntoView({ block: "end", behavior: "smooth" });

  fetch("/text-to-speech", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.blob())
    .then((blob) => {
      // Creo un URL para el Blob de audio
      var blobUrl = URL.createObjectURL(blob);

      var audioElement = document.getElementById("tts-audio");

      // Asignar el URL del Blob al atributo source del elemento de audio
      audioElement.src = blobUrl;

      // Elimino el loader y muestro el resultado
      loader.style.display = "none";
      audioContainer.style.display = "flex";
    });
});
