$(document).ready(function () {
  var title = $(".titleAnim");
  var sub = $(".subAnim");
  var comenzar = $(".miBtn");

  //tooltip
  $('[data-toggle="tooltip"]').tooltip();

  //Modal
  var tl = gsap.timeline({});
  tl.fromTo(
    title,
    { y: 1000, opacity: -2000 },
    { y: 0, opacity: 100, ease: "back.out(0.5)", duration: 1.1 }
  )
    .fromTo(
      sub,
      { y: 1000, opacity: -2000 },
      { y: 0, opacity: 100, ease: "back.out(0.5)", duration: 1.1 },
      ">-0.9"
    )
    .fromTo(
      comenzar,
      { y: 1000, opacity: -2000 },
      { y: 0, opacity: 100, ease: "back.out(0.5)", duration: 1.1 },
      ">-0.9"
    );

  //   var infoContainer = $(".info-container");
  //   var infoContainer2 = $(".svg-over");
  //   var info = $("#info");
  //   var tl2 = gsap.timeline({});
  //   tl2
  //     .fromTo(infoContainer, { x: -2500 }, { display: "grid", x: 0, duration: 1 })
  //     .fromTo(
  //       infoContainer2,
  //       { x: -2500 },
  //       { display: "grid", x: 0, duration: 1 },
  //       ">-1"
  //     );
  //   tl2.pause();

  //   //Info
  //   info.on("click", function () {
  //     tl2.play();
  //     var infoTop = infoContainer.offset().top;
  //     $("html,body").animate(
  //       {
  //         scrollTop: infoTop,
  //       },
  //       "slow"
  //     );

  //     //console.log("playy");
  //   });

  //   //Flor
  //   var capas = $(".capas");
  //   var tooltip_play = $("#lg_tooltip");

  //   var tl3 = new gsap.timeline({});
  //   tl3.fromTo(capas, { scale: 1 }, { scale: 0.5, stagger: "0.1" });
  //   tl3.pause();

  //   tooltip_play.mouseenter(function () {
  //     tl3.play();
  //     // console.log("hover");
  //   });

  //   tooltip_play.mouseleave(function () {
  //     tl3.reverse();
  //     //console.log("hover");
  //   });

  //   //Info Text

  //   var infoText = $(".info-text");

  //   var tl4 = new gsap.timeline({});
  //   tl4.to(infoText, { opacity: "100", duration: 1.5 });

  //   tl4.pause();

  //   tooltip_play.on("click", function () {
  //     //var localw = window.innerWidth;
  //     var el = $(".info-text");
  //     var sTop = el.offset().top;
  //     //console.log(sTop);
  //     //window.scroll(0, sTop);
  //     $("html,body").animate(
  //       {
  //         scrollTop: sTop,
  //       },
  //       "slow"
  //     );

  //     tl4.play();

  //     $(function () {
  //       $(".tlt").textillate({
  //         in: {
  //           effect: "fadeIn",
  //         },
  //         out: {
  //           effect: "fadeOut",
  //         },
  //         loop: true,
  //       });
  //     });
  //   });
});
