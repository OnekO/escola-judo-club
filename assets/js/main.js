/* =========================================================
   Escola Judo Club · interacciones
   ========================================================= */
(function () {
  "use strict";
  // La clase "js" en <html> ya la pone un script en el <head> (src/layout/head.html)

  var reduceMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
  var reduced = reduceMQ.matches;

  /* ---------- Menú móvil ---------- */
  var menuBtn = document.querySelector(".menu-toggle");
  var menu = document.getElementById("menu");
  function closeMenu() {
    menu.classList.remove("is-open");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-label", "Abrir menú");
  }
  menuBtn.addEventListener("click", function () {
    var open = menu.classList.toggle("is-open");
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  });
  menu.addEventListener("click", function (e) { if (e.target.closest("a")) closeMenu(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menu.classList.contains("is-open")) { closeMenu(); menuBtn.focus(); }
  });

  /* ---------- Aparición al hacer scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduced) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObs.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { revealObs.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Pestañas accesibles (flechas, Inicio, Fin) ---------- */
  function setupTabs(list) {
    var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
    var useHash = list.hasAttribute("data-hash-tabs");
    function activate(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
      });
      if (focus) tab.focus();
    }
    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () {
        activate(tab, false);
        if (useHash) history.replaceState(null, "", "#" + tab.getAttribute("aria-controls"));
      });
      tab.addEventListener("keydown", function (e) {
        var next = null;
        if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
        else if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === "Home") next = tabs[0];
        else if (e.key === "End") next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); activate(next, true); }
      });
    });
    // Estado inicial: la pestaña marcada (o la del hash en la URL)
    var initial = tabs.filter(function (t) { return t.getAttribute("aria-selected") === "true"; })[0] || tabs[0];
    if (useHash && location.hash) {
      var fromHash = tabs.filter(function (t) { return "#" + t.getAttribute("aria-controls") === location.hash; })[0];
      if (fromHash) initial = fromHash;
    }
    activate(initial, false);
    return { tabs: tabs, activate: activate };
  }
  var techTabs = null;
  document.querySelectorAll('[role="tablist"]').forEach(function (list) {
    var api = setupTabs(list);
    if (list.hasAttribute("data-hash-tabs")) techTabs = api;
  });

  // Los enlaces (o la URL) a #tachi-waza, #ne-waza y #shime-waza abren su pestaña
  function techTabFor(hash) {
    if (!techTabs) return null;
    return techTabs.tabs.filter(function (t) { return "#" + t.getAttribute("aria-controls") === hash; })[0] || null;
  }
  function openTechTab(tab) {
    techTabs.activate(tab, false);
    tab.parentElement.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    tab.focus({ preventScroll: true });
  }
  document.addEventListener("click", function (e) {
    var link = e.target.closest('a[href^="#"]');
    var tab = link && techTabFor(link.getAttribute("href"));
    if (!tab) return;
    e.preventDefault();
    history.replaceState(null, "", link.getAttribute("href"));
    openTechTab(tab);
  });
  window.addEventListener("hashchange", function () {
    var tab = techTabFor(location.hash);
    if (tab) openTechTab(tab);
  });

  /* ---------- Demos animadas: pausa individual y global ---------- */
  var demos = Array.prototype.slice.call(document.querySelectorAll(".demo"));
  var motionBtn = document.querySelector(".motion-toggle");

  function setDemo(demo, playing) {
    demo.classList.toggle("is-playing", playing);
    demo.classList.toggle("is-paused", !playing);
    var btn = demo.querySelector(".demo-btn");
    var name = btn.getAttribute("data-name");
    btn.setAttribute("aria-label", (playing ? "Pausar" : "Reproducir") + " la animación de " + name);
  }
  function setGlobal(paused) {
    motionBtn.setAttribute("aria-pressed", String(paused));
    motionBtn.setAttribute("title", paused ? "Reanudar animaciones" : "Pausar animaciones");
    document.body.classList.toggle("motion-paused", paused);
    demos.forEach(function (d) { setDemo(d, !paused); });
  }

  demos.forEach(function (demo) {
    demo.querySelector(".demo-btn").addEventListener("click", function () {
      setDemo(demo, !demo.classList.contains("is-playing"));
    });
  });
  // La preferencia del botón global se recuerda al cambiar de página (solo en este navegador)
  var MOTION_KEY = "ejc-motion-paused";
  function savedPause() {
    try { var v = localStorage.getItem(MOTION_KEY); return v === null ? null : v === "1"; } catch (e) { return null; }
  }
  motionBtn.addEventListener("click", function () {
    var paused = motionBtn.getAttribute("aria-pressed") !== "true";
    setGlobal(paused);
    try { localStorage.setItem(MOTION_KEY, paused ? "1" : "0"); } catch (e) { /* sin almacenamiento: no pasa nada */ }
  });
  // Con movimiento reducido todo empieza en pausa (fotograma representativo), salvo que se haya elegido otra cosa
  var stored = savedPause();
  setGlobal(stored === null ? reduced : stored);
  reduceMQ.addEventListener && reduceMQ.addEventListener("change", function (e) { reduced = e.matches; setGlobal(e.matches); });

  // Ahorro: las demos fuera de pantalla no se animan
  if ("IntersectionObserver" in window) {
    var demoObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle("is-offscreen", !entry.isIntersecting);
      });
    }, { rootMargin: "80px 0px" });
    demos.forEach(function (d) { demoObs.observe(d); });
  }

  /* ---------- Parallax suave del Pico Sacro + cinta de cinturones ---------- */
  var mountain = document.querySelector(".hero-art .mountain");
  var hero = document.querySelector(".hero");
  var techSection = document.getElementById("tecnicas");
  var belt = document.querySelector(".belt-progress");
  var ticking = false;

  function onScroll() {
    var y = window.scrollY;
    if (mountain && !reduced && y < hero.offsetHeight) {
      mountain.style.transform = "translateY(" + (y * 0.12).toFixed(1) + "px)";
    }
    if (belt) {
      // 0 cuando la sección llega bajo la cabecera, 1 cuando su final llega abajo
      var r = techSection.getBoundingClientRect();
      var vh = window.innerHeight;
      var headerH = document.querySelector(".site-header").offsetHeight;
      var p = (headerH - r.top) / Math.max(1, r.height - vh + headerH);
      belt.style.setProperty("--p", Math.max(0, Math.min(1, p)).toFixed(3));
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- Año actual en el pie ---------- */
  var year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
})();
