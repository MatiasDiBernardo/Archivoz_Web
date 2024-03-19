let linkInicio = document.getElementById("a-inicio");
let linkObjetivos = document.querySelectorAll(".a-objetivos");
let linkParticipar = document.querySelectorAll(".a-participar");
let linkTTS = document.querySelectorAll(".a-TTS");
let linkMapa = document.querySelectorAll(".a-mapa");
let linkInfo = document.querySelectorAll(".a-info");
let navbar = null;
let objetivos = null;
let participar = null;
let TTS = null;
let mapa = null;
let info = null;

linkInicio.addEventListener("click", (e) => {
  e.preventDefault();
  navbar = document.getElementsByClassName("nav-conteiner")[0];
  navbar.scrollIntoView({ block: "start", behavior: "smooth" });
});

linkObjetivos.forEach((i) => {
  i.addEventListener("click", (e) => {
    e.preventDefault();
    objetivos = document.getElementById("objectives");
    objetivos.scrollIntoView({ block: "start", behavior: "smooth" });
  })
})

linkParticipar.forEach((i) => {
  i.addEventListener("click", (e) => {
    e.preventDefault();
    participar = document.getElementById("voice-archive").firstElementChild
    participar.scrollIntoView({ block: "start", behavior: "smooth" });
  })
})

linkTTS.forEach((i) => {
  i.addEventListener("click", (e) => {
    e.preventDefault();
    TTS = document.getElementById("text-to-speech").firstElementChild;
    TTS.scrollIntoView({ block: "start", behavior: "smooth" });
  })
})

linkMapa.forEach((i) => {
  i.addEventListener("click", (e) => {
    e.preventDefault();
    hero.scrollIntoView({ block: "start", behavior: "smooth" });
  })
})

linkInfo.forEach((i) => {
  i.addEventListener("click", (e) => {
    e.preventDefault();
    info = document.getElementById("infosection").firstElementChild;
    info.scrollIntoView({ block: "start", behavior: "smooth" });
  })
})
