/* «Клиника Здоровье» — landing interactions (демо-версия) */
(function () {
  'use strict';
  var doc = document;

  /* ---------- mobile menu ---------- */
  var burger = doc.getElementById('burger');
  var scrim = doc.getElementById('navScrim');
  var nav = doc.getElementById('nav');
  function setMenu(open) {
    doc.body.classList.toggle('nav-open', open);
    burger && burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (scrim) scrim.hidden = !open;
  }
  burger && burger.addEventListener('click', function () {
    setMenu(!doc.body.classList.contains('nav-open'));
  });
  scrim && scrim.addEventListener('click', function () { setMenu(false); });
  nav && nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });
  doc.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });

  /* ---------- reveal on scroll ---------- */
  var reveals = doc.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- demo: внешние ссылки и звонки отключены ---------- */
  var toast = doc.getElementById('toast');
  var toastText = doc.getElementById('toastText');
  var toastTimer = 0;
  function showToast(msg) {
    if (!toast) return;
    toastText.textContent = msg;
    toast.classList.remove('is-out');
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.add('is-out');
      toastTimer = setTimeout(function () { toast.hidden = true; }, 300);
    }, 3400);
  }
  doc.addEventListener('click', function (e) {
    var a = e.target.closest('[data-demo]');
    if (!a) return;
    e.preventDefault();
    var what = a.getAttribute('data-demo');
    showToast(what === 'звонок'
      ? 'Демо-версия: звонки отключены. Оставьте заявку в форме — так работает запись.'
      : 'Демо-версия: ' + what + ' — переход отключён.');
  });

  /* ---------- phone mask: +7 (999) 123-45-67 ---------- */
  function digits(v) {
    var d = v.replace(/\D/g, '');
    if (d.length > 10 && (d[0] === '7' || d[0] === '8')) d = d.slice(1);
    else if (d[0] === '7' && v.indexOf('+7') === 0) d = d.slice(1);
    return d.slice(0, 10);
  }
  function formatPhone(d) {
    if (!d) return '';
    var out = '+7 (' + d.slice(0, 3);
    if (d.length >= 3) out += ') ' + d.slice(3, 6);
    if (d.length >= 6) out += '-' + d.slice(6, 8);
    if (d.length >= 8) out += '-' + d.slice(8, 10);
    return out;
  }
  doc.querySelectorAll('[data-phone]').forEach(function (inp) {
    inp.addEventListener('input', function () {
      inp.value = formatPhone(digits(inp.value));
      inp.closest('.fld').classList.remove('is-invalid');
      inp.removeAttribute('aria-invalid');
    });
    inp.addEventListener('focus', function () { if (!inp.value) inp.value = '+7 ('; });
    inp.addEventListener('blur', function () { if (inp.value === '+7 (') inp.value = ''; });
  });

  /* ---------- validation: ошибка рядом с полем, фокус на первое ---------- */
  function validate(scope) {
    var first = null;
    scope.querySelectorAll('input, select').forEach(function (el) {
      var bad;
      if (el.type === 'checkbox') {
        bad = el.required && !el.checked;
        el.closest('.consent').classList.toggle('is-invalid', bad);
      } else {
        bad = el.hasAttribute('data-phone') ? digits(el.value).length !== 10 : (el.required && !el.value.trim());
        var f = el.closest('.fld');
        if (f) f.classList.toggle('is-invalid', bad);
      }
      if (bad) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
      if (bad && !first) first = el;
    });
    if (first) first.focus();
    return !first;
  }
  doc.addEventListener('change', function (e) {
    var el = e.target;
    if (el.type === 'checkbox' && el.checked && el.closest('.consent')) el.closest('.consent').classList.remove('is-invalid');
    if ((el.tagName === 'SELECT' || el.type === 'text') && el.value) {
      var f = el.closest('.fld'); if (f) f.classList.remove('is-invalid');
    }
  });

  /* ---------- quiz / calculator ---------- */
  var quiz = doc.getElementById('quiz');
  if (quiz) {
    var steps = quiz.querySelectorAll('.quiz__step');
    var bar = doc.getElementById('quizBar');
    var count = doc.getElementById('quizCount');
    var form = doc.getElementById('quizForm');
    var done = doc.getElementById('quizDone');
    var cur = 0;
    function show(i, focus) {
      steps.forEach(function (s, n) { s.classList.toggle('is-active', n === i); });
      if (bar) bar.style.transform = 'scaleX(' + ((i + 1) / steps.length).toFixed(3) + ')';
      if (count) count.textContent = 'Шаг ' + (i + 1) + ' из ' + steps.length;
      cur = i;
      if (focus) {
        var f = steps[i].querySelector('.chip, input');
        if (f) f.focus({ preventScroll: true });
      }
    }
    quiz.addEventListener('click', function (e) {
      if (e.target.closest('[data-next]') && cur < steps.length - 1) show(cur + 1, true);
      if (e.target.closest('[data-back]') && cur > 0) show(cur - 1, true);
    });
    form && form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(steps[cur])) return;
      steps.forEach(function (s) { s.classList.remove('is-active'); });
      if (bar) bar.style.transform = 'scaleX(1)';
      if (count) count.textContent = 'Готово';
      if (done) done.hidden = false;
    });
    show(0);
  }

  /* ---------- before / after sliders ---------- */
  doc.querySelectorAll('.ba__stage').forEach(function (stage) {
    var input = stage.querySelector('input[type=range]');
    if (!input) return;
    function sync() { stage.style.setProperty('--pos', input.value + '%'); }
    input.addEventListener('input', sync);
    sync();
  });

  /* ---------- works filter ---------- */
  var fltrs = doc.querySelectorAll('.fltr');
  fltrs.forEach(function (b) {
    b.addEventListener('click', function () {
      var cat = b.getAttribute('data-filter');
      fltrs.forEach(function (o) {
        var on = o === b;
        o.classList.toggle('is-on', on);
        o.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      doc.querySelectorAll('#worksGrid .ba').forEach(function (f) {
        f.classList.toggle('is-hidden', cat !== 'all' && f.getAttribute('data-cat') !== cat);
      });
    });
  });

  /* ---------- FAQ: single open ---------- */
  var acc = doc.getElementById('acc');
  if (acc) {
    acc.querySelectorAll('details').forEach(function (d) {
      d.addEventListener('toggle', function () {
        if (d.open) {
          acc.querySelectorAll('details').forEach(function (o) { if (o !== d) o.open = false; });
        }
      });
    });
  }

  /* ---------- booking form ---------- */
  var book = doc.getElementById('bookForm');
  var bookDone = doc.getElementById('bookDone');
  book && book.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate(book)) return;
    if (bookDone) bookDone.hidden = false;
    book.reset();
  });
  var again = doc.getElementById('bookAgain');
  again && again.addEventListener('click', function () {
    bookDone.hidden = true;
    var n = doc.getElementById('bName'); if (n) n.focus();
  });

  /* ---------- header shadow on scroll ---------- */
  var hdr = doc.querySelector('.hdr');
  if (hdr) {
    var onScroll = function () { hdr.classList.toggle('is-scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- nav: подсветка текущего раздела ---------- */
  var navLinks = nav ? nav.querySelectorAll('a[href^="#"]') : [];
  if (navLinks.length && 'IntersectionObserver' in window) {
    var byId = {};
    navLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.remove('is-current'); });
        var a = byId[en.target.id];
        if (a) a.classList.add('is-current');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(byId).forEach(function (id) {
      var el = doc.getElementById(id);
      if (el) spy.observe(el);
    });
  }

  /* ---------- hero: kinetic «живая вода» ---------- */
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // rotating word
  var rotWord = doc.querySelector('.rotator__word');
  if (rotWord && !reduce) {
    var words = ['Здоровая улыбка', 'Крепкие зубы', 'Красивая улыбка', 'Спокойствие'];
    var wi = 0;
    setInterval(function () {
      if (doc.hidden) return;
      rotWord.classList.add('is-out');
      setTimeout(function () {
        wi = (wi + 1) % words.length;
        rotWord.textContent = words[wi];
        rotWord.classList.remove('is-out');
        rotWord.classList.add('is-in');
        setTimeout(function () { rotWord.classList.remove('is-in'); }, 640);
      }, 470);
    }, 2800);
  }

  var heroEl = doc.querySelector('.hero');
  var heroOnScreen = true;
  var lightStart = function () {}, lightStop = function () {};

  // living water light (soft caustics on canvas)
  var cv = doc.querySelector('.hero__light');
  if (cv && cv.getContext) {
    var ctx = cv.getContext('2d'), host = cv.parentElement;
    var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2), raf = 0, blobs = [];
    var pal = [[120, 205, 240], [31, 166, 222], [150, 215, 180], [95, 185, 225]];
    function sizeCv() {
      var r = host.getBoundingClientRect(); W = r.width; H = r.height;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function seed() {
      blobs = [];
      for (var i = 0; i < 5; i++) blobs.push({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.max(W, H) * (0.28 + Math.random() * 0.22),
        a: Math.random() * Math.PI * 2, sp: 0.5 + Math.random() * 0.8, col: pal[i % pal.length]
      });
    }
    function paint(move) {
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      for (var i = 0; i < blobs.length; i++) {
        var b = blobs[i]; if (move) b.a += 0.0012 * b.sp;
        var x = b.x + Math.cos(b.a) * W * 0.12, y = b.y + Math.sin(b.a * 0.8) * H * 0.14;
        var g = ctx.createRadialGradient(x, y, 0, x, y, b.r);
        g.addColorStop(0, 'rgba(' + b.col[0] + ',' + b.col[1] + ',' + b.col[2] + ',0.20)');
        g.addColorStop(1, 'rgba(' + b.col[0] + ',' + b.col[1] + ',' + b.col[2] + ',0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, b.r, 0, 6.2832); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    }
    function loop() { paint(true); raf = requestAnimationFrame(loop); }
    lightStop = function () { cancelAnimationFrame(raf); raf = 0; };
    lightStart = function () {
      if (reduce || raf || document.hidden || !heroOnScreen) return;
      loop();
    };
    sizeCv(); seed();
    if (reduce) { paint(false); } else { lightStart(); }
    window.addEventListener('resize', function () { sizeCv(); seed(); if (reduce) paint(false); }, { passive: true });
    doc.addEventListener('visibilitychange', function () {
      if (document.hidden) lightStop(); else lightStart();
    });
  }

  // hero off-screen → pause the water light and the logo loops
  if (heroEl && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      heroOnScreen = en[0].isIntersecting;
      heroEl.classList.toggle('is-paused', !heroOnScreen);
      if (heroOnScreen) lightStart(); else lightStop();
    }).observe(heroEl);
  }

  // logo docks into the header once the big hero logo scrolls away
  var root = doc.documentElement;
  var bsMark = doc.querySelector('.bs__mark');
  if (bsMark && 'IntersectionObserver' in window) {
    var hdrH = hdr ? hdr.offsetHeight : 74;
    new IntersectionObserver(function (en) {
      root.classList.toggle('brand-docked', en[0].intersectionRatio < 0.3);
    }, { rootMargin: '-' + hdrH + 'px 0px 0px 0px', threshold: [0, 0.3, 0.6, 1] }).observe(bsMark);
  } else {
    root.classList.add('brand-docked');
  }

  // the hero logo leans toward the pointer (fine pointers only)
  var tilt = doc.querySelector('.bs__tilt'), halo = doc.querySelector('.bs__halo');
  if (!reduce && heroEl && tilt && window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    heroEl.addEventListener('pointermove', function (e) {
      var r = heroEl.getBoundingClientRect();
      var cx = (e.clientX - r.left) / r.width - 0.5, cy = (e.clientY - r.top) / r.height - 0.5;
      tilt.style.transform = 'perspective(900px) rotateY(' + (cx * 16).toFixed(2) + 'deg) rotateX(' + (-cy * 12).toFixed(2) + 'deg)';
      if (halo) halo.style.transform = 'translate3d(' + (cx * -26).toFixed(1) + 'px,' + (cy * -18).toFixed(1) + 'px,0)';
    });
    heroEl.addEventListener('pointerleave', function () {
      tilt.style.transform = '';
      if (halo) halo.style.transform = '';
    });
  }
})();
