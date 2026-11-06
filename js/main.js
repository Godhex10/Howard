/* Howard Brass — site interactions. No libraries, kept small on purpose. */

(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Preloader, then the hero book opens ---------- */
  var heroBook = document.getElementById("heroBook");
  var minShow = reduceMotion ? 0 : 2600; // long enough for the name to be written
  var started = Date.now();
  var opened = false;

  function openBook() {
    if (opened) return;
    opened = true;
    root.classList.add("loaded");
    if (!heroBook) return;
    setTimeout(function () {
      heroBook.classList.add("is-open");
    }, reduceMotion ? 0 : 450);

    // After the cover has swung open, swap the 3D for a flat layout so the text stays sharp
    var cover = document.getElementById("heroCover");
    cover.addEventListener("transitionend", function (e) {
      if (e.target === cover && e.propertyName === "transform") heroBook.classList.add("is-settled");
    });
    setTimeout(function () { heroBook.classList.add("is-settled"); }, 3200);
  }

  window.addEventListener("load", function () {
    setTimeout(openBook, Math.max(0, minShow - (Date.now() - started)));
  });
  setTimeout(openBook, 6000); // never keep visitors waiting on a slow image

  /* ---------- Header state + reading ribbon ---------- */
  var ribbon = document.getElementById("ribbon");
  function onScroll() {
    var y = window.scrollY;
    root.classList.toggle("scrolled", y > 40);
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (ribbon && max > 0) ribbon.style.setProperty("--p", (y / max).toFixed(3));
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.getElementById("menuBtn");
  var nav = document.getElementById("nav");
  function setMenu(open) {
    document.body.classList.toggle("menu-open", open);
    menuBtn.setAttribute("aria-expanded", open);
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
  }
  menuBtn.addEventListener("click", function () {
    setMenu(!document.body.classList.contains("menu-open"));
  });
  nav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") setMenu(false);
  });

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Book: tilts toward the pointer ---------- */
  var book = document.getElementById("book3d");
  var canHover = window.matchMedia("(hover: hover)").matches;
  if (book && canHover && !reduceMotion) {
    var stage = book.parentElement;
    stage.addEventListener("pointermove", function (e) {
      var r = stage.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      book.style.transform = "rotateY(" + (-24 + x * 34) + "deg) rotateX(" + (4 - y * 16) + "deg)";
    });
    stage.addEventListener("pointerleave", function () {
      book.style.transform = "";
    });
  }

  /* ---------- Lightbox for the paintings ---------- */
  var plates = Array.prototype.slice.call(document.querySelectorAll(".plate"));
  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lbCap = document.getElementById("lbCap");
  var current = 0;
  var lastFocus = null;

  function showPlate(i) {
    current = (i + plates.length) % plates.length;
    var p = plates[current];
    lbImg.src = p.getAttribute("href");
    lbImg.alt = p.querySelector("img").alt;
    lbCap.innerHTML = "<b>" + p.dataset.plate + "</b>" + p.dataset.title;
  }
  function openLightbox(i) {
    lastFocus = document.activeElement;
    showPlate(i);
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(function () { lb.classList.add("is-open"); });
    document.getElementById("lbClose").focus();
  }
  function closeLightbox() {
    lb.classList.remove("is-open");
    document.body.style.overflow = "";
    setTimeout(function () { lb.hidden = true; }, reduceMotion ? 0 : 400);
    if (lastFocus) lastFocus.focus();
  }

  if (lb && plates.length) {
    plates.forEach(function (p, i) {
      p.addEventListener("click", function (e) {
        e.preventDefault();
        openLightbox(i);
      });
    });
    document.getElementById("lbClose").addEventListener("click", closeLightbox);
    document.getElementById("lbPrev").addEventListener("click", function () { showPlate(current - 1); });
    document.getElementById("lbNext").addEventListener("click", function () { showPlate(current + 1); });
    lb.addEventListener("click", function (e) {
      if (e.target === lb) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (lb.hidden) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showPlate(current - 1);
      if (e.key === "ArrowRight") showPlate(current + 1);
    });
  }

  /* ---------- Newsletter ---------- */
  var form = document.getElementById("nlForm");
  var msg = document.getElementById("nlMsg");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = form.email.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        msg.textContent = "Please enter a valid email address.";
        return;
      }
      // TODO: POST the email to the backend (e.g. /api/subscribe) once the admin dashboard is built.
      msg.textContent = "Thank you. Your name is on the list.";
      form.reset();
    });
  }

  /* ---------- Footer year ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
