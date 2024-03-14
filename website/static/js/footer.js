let linkInicio = document.getElementById("a-inicio");
let linkObjetivos = document.getElementById("a-objetivos");
let linkParticipar = document.getElementById("a-participar");
let linkTTS = document.getElementById("a-TTS");
let linkMapa = document.getElementById("a-mapa");
let linkInfo = document.getElementById("a-info");
let hero = null;
let objetivos = null;
let participar = null;
let TTS = null;
let mapa = null;
let info = null;

linkInicio.addEventListener("click", (e) => {
  e.preventDefault();
  hero = document.getElementById("hero");
  hero.scrollIntoView({ block: "center", behavior: "smooth" });
});

linkObjetivos.addEventListener("click", (e) => {
  e.preventDefault();
  objetivos = document.getElementById("objectives");
  objetivos.scrollIntoView({ block: "center", behavior: "smooth" });
});

linkParticipar.addEventListener("click", (e) => {
  e.preventDefault();
  participar = document.getElementById("voice-archive");
  participar.scrollIntoView({ block: "center", behavior: "smooth" });
});

linkTTS.addEventListener("click", (e) => {
  e.preventDefault();
  TTS = document.getElementById("text-to-speech");
  TTS.scrollIntoView({ block: "center", behavior: "smooth" });
});

linkMapa.addEventListener("click", (e) => {
  e.preventDefault();
  hero.scrollIntoView({ block: "center", behavior: "smooth" });
});

linkInfo.addEventListener("click", (e) => {
  e.preventDefault();
  info = document.getElementById("infosection");
  info.scrollIntoView({ block: "center", behavior: "smooth" });
});
