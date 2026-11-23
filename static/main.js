(function () {
  var doc = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // nav border on scroll
  var nav = document.querySelector(".nav");
  var darkZones = [].slice.call(document.querySelectorAll(".contact, .legal-footer"));
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle("scrolled", window.scrollY > 8);
    var h = nav.offsetHeight / 2, dark = false;
    darkZones.forEach(function (z) { var r = z.getBoundingClientRect(); if (r.top <= h && r.bottom > h) dark = true; });
    nav.classList.toggle("on-dark", dark);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // reveal on scroll (content stays visible if IntersectionObserver is missing)
  var items = [].slice.call(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("in"); });
  }

  // play loop videos only while visible
  var vids = [].slice.call(document.querySelectorAll("video[data-autoplay]"));
  if (reduce) return wire();
  if ("IntersectionObserver" in window) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) {
          if (v.preload === "none") { v.preload = "auto"; }
          var p = v.play(); if (p && p.catch) p.catch(function () {});
        } else { v.pause(); }
      });
    }, { threshold: 0.25 });
    vids.forEach(function (v) { vio.observe(v); });
  }
  wire();

  function wire() {
    // copy e-mail
    [].forEach.call(document.querySelectorAll("[data-copy]"), function (b) {
      b.addEventListener("click", function () {
        var text = b.getAttribute("data-copy");
        var label = b.textContent;
        function done() {
          b.classList.add("done"); b.textContent = b.getAttribute("data-done") || "✓";
          setTimeout(function () { b.classList.remove("done"); b.textContent = label; }, 1800);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, function () { window.prompt("", text); });
        } else { window.prompt("", text); }
      });
    });

    // brief form -> opens the visitor's mail app (no data stored on the site)
    var form = document.getElementById("brief");
    if (form) {
      form.addEventListener("submit", function (ev) {
        ev.preventDefault();
        var f = form.elements;
        var to = form.getAttribute("data-to");
        var subject = form.getAttribute("data-subject") + (f.company.value ? " — " + f.company.value : "");
        var lines = [
          f.message.value, "", "—",
          form.getAttribute("data-l-name") + ": " + f.name.value,
          form.getAttribute("data-l-company") + ": " + f.company.value,
          form.getAttribute("data-l-email") + ": " + f.email.value
        ];
        window.location.href = "mailto:" + to + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(lines.join("\n"));
      });
    }
  }
})();
