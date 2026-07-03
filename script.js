/* Ericson Sombrea — Portfolio
   Shared behavior: mobile nav toggle + scroll-reveal + stat count-up. */

(function () {
  "use strict";

  /* ---------- Realistic night sky (stars, moon, shooting stars) ---------- */
  function starShadows(count, minAlpha) {
    var shadows = [];
    for (var i = 0; i < count; i++) {
      var x = (Math.random() * 100).toFixed(2);
      var y = (Math.random() * 100).toFixed(2);
      var a = (minAlpha + Math.random() * 0.5).toFixed(2);
      shadows.push(x + "vw " + y + "vh 0 rgba(255,255,255," + a + ")");
    }
    return shadows.join(",");
  }

  var sky = document.createElement("div");
  sky.className = "sky";
  sky.setAttribute("aria-hidden", "true");
  sky.innerHTML =
    '<div class="stars stars-sm"></div>' +
    '<div class="stars stars-md"></div>' +
    '<div class="stars stars-lg"></div>' +
    '<div class="moon"></div>' +
    '<div class="smoke"></div>' +
    '<div class="smoke smoke-2"></div>' +
    '<div class="flash"></div>' +
    '<div class="flash f2"></div>' +
    '<div class="flash f3"></div>' +
    '<div class="tracer t1"></div>' +
    '<div class="tracer t2"></div>' +
    '<div class="tracer t3"></div>' +
    '<div class="tracer t4"></div>' +
    '<div class="heli"></div>';
  document.body.prepend(sky);

  /* Foreground war layer: fog, rising embers, patrolling squad, film grain */
  function emberShadows(count) {
    var shadows = [];
    for (var i = 0; i < count; i++) {
      var x = (Math.random() * 100).toFixed(2);
      var y = (Math.random() * 30).toFixed(2);
      var warm = Math.random() < 0.7;
      var color = warm ? "rgba(251,191,36," : "rgba(248,113,113,";
      var a = (0.35 + Math.random() * 0.45).toFixed(2);
      shadows.push(x + "vw " + y + "vh 0 " + (Math.random() < 0.3 ? "1px " : "0 ") + color + a + ")");
    }
    return shadows.join(",");
  }

  var front = document.createElement("div");
  front.className = "warfront";
  front.setAttribute("aria-hidden", "true");
  front.innerHTML =
    '<div class="fog"></div>' +
    '<div class="fog fog-2"></div>' +
    '<div class="embers"></div>' +
    '<div class="embers e2"></div>' +
    '<div class="squad"></div>' +
    '<div class="vignette"></div>' +
    '<div class="grain"></div>';
  document.body.prepend(front);

  front.querySelector(".embers").style.boxShadow = emberShadows(14);
  front.querySelector(".embers.e2").style.boxShadow = emberShadows(11);

  sky.querySelector(".stars-sm").style.boxShadow = starShadows(95, 0.25);
  sky.querySelector(".stars-md").style.boxShadow = starShadows(45, 0.35);
  sky.querySelector(".stars-lg").style.boxShadow = starShadows(16, 0.5);

  /* ---------- Mobile nav toggle ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.querySelector(".nav-links");

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var isOpen = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Close the dropdown after a link is chosen.
    menu.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Scroll-reveal (IntersectionObserver) ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    // Show everything immediately; no animation.
    revealEls.forEach(function (el) {
      el.classList.add("visible");
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  revealEls.forEach(function (el) {
    observer.observe(el);
  });

  /* ---------- Stat count-up ---------- */
  var statEls = document.querySelectorAll(".stat-number");

  function countUp(el) {
    var raw = el.textContent.trim();
    var match = raw.match(/^(\d+)(.*)$/);
    if (!match) return;
    var target = parseInt(match[1], 10);
    var suffix = match[2] || "";
    var duration = 1200;
    var start = null;

    function step(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = raw;
      }
    }

    window.requestAnimationFrame(step);
  }

  if (statEls.length) {
    var statObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            countUp(entry.target);
            statObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    statEls.forEach(function (el) {
      statObserver.observe(el);
    });
  }
})();
