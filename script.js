(function () {
  var $ = function (s) { return document.querySelector(s); };
  var phone = $('#phone');
  var screen = $('#screen');
  var page = $('#page');
  var cursor = $('#cursor');
  var fx = $('#fx');
  var menu = $('#menuSheet');
  var storyPhone = $('#storyPhone');
  var note = $('#demoNote');
  var steps = Array.prototype.slice.call(document.querySelectorAll('.step'));
  var ticks = Array.prototype.slice.call(document.querySelectorAll('.progress i'));
  var markers = Array.prototype.slice.call(document.querySelectorAll('.mk'));
  if (!phone || !steps.length) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TOTAL = 7;
  var VIEW_H = 594;       // logical height of the page area inside the phone
  var PHONE_W = 380, PHONE_H = 760;

  // what each step turns on (element ids). Step 8 is the finale.
  var FIX = {
    1: ['tabChip', 'mk1', 'rgHero'],
    2: ['urlBar', 'mk2'],
    3: ['rgBanner', 'mk3'],
    4: ['rgHeader', 'mk4'],
    5: ['rgContact', 'mk5'],
    6: ['rgSocial', 'mk6'],
    7: ['rgFoot', 'mk7'],
    8: ['rgServices', 'rgAreas', 'callbar']
  };

  // what the cursor does in each step: where it clicks, what it says, what it fixes
  var BEATS = {
    1: [
      { el: '#tabChip', label: 'Tab title fixed', fix: ['tabChip', 'mk1'] },
      { el: '#heroB', label: 'Says what you do', fix: ['rgHero'] }
    ],
    2: [{ el: '#urlBar', label: 'Your own address', fix: ['mk2'], type: true }],
    3: [{ el: '#bannerText', label: 'Banner removed', fix: ['rgBanner', 'mk3'] }],
    4: [
      { el: '#navLinks', label: 'A proper header', fix: ['rgHeader', 'mk4'] },
      { el: '#burger', label: 'Every page has its own address', menu: true }
    ],
    5: [{ el: '#phoneNum', label: 'One tap to call', fix: ['rgContact', 'mk5'] }],
    6: [{ el: '#socialB', label: 'Your own accounts', fix: ['rgSocial', 'mk6'] }],
    7: [{ el: '#footB', label: 'Your name, this year', fix: ['rgFoot', 'mk7'] }],
    8: [{ el: '#heroCta', label: 'Ready to launch', fix: ['rgServices', 'rgAreas', 'callbar'], finale: true }]
  };

  var COLORS = ['#FFC61A', '#FFC61A', '#121A2B', '#2C4A7A', '#5C7FB5', '#C8321F'];

  var current = 0;       // the step the page is showing
  var token = 0;         // bumps every time the target step changes, so old animations stop
  var cursorX = 290, cursorY = 560;
  var markerTimers = {};
  var menuTimer = null;

  function byId(id) { return document.getElementById(id); }
  function sleep(ms) { return new Promise(function (r) { window.setTimeout(r, ms); }); }
  function rand(a, b) { return a + Math.random() * (b - a); }

  /* ---------- layout: one scale for the whole phone ---------- */
  function layout() {
    var mobile = window.innerWidth <= 860;
    var availH = mobile ? window.innerHeight * 0.5 - 24 : window.innerHeight - 150;
    var availW = mobile ? window.innerWidth - 32 : storyPhone.clientWidth;
    var s = Math.max(0.4, Math.min(1, availH / PHONE_H, availW / PHONE_W));
    storyPhone.style.setProperty('--s', s.toFixed(3));
  }

  /* ---------- state ---------- */
  function setFixed(id, on, withFlash) {
    var el = byId(id);
    if (!el) return;
    var was = el.classList.contains('fixed');
    el.classList.toggle('fixed', on);
    if (el.classList.contains('mk')) {
      window.clearTimeout(markerTimers[id]);
      if (on && !withFlash) { el.classList.add('gone'); }
      else if (on) { markerTimers[id] = window.setTimeout(function () { el.classList.add('gone'); }, 1700); }
      else { el.classList.remove('gone'); }
    }
    if (on && !was && withFlash && !reduce && !el.classList.contains('mk') && id !== 'callbar') {
      el.classList.remove('flash');
      void el.offsetWidth;
      el.classList.add('flash');
      window.setTimeout(function () { el.classList.remove('flash'); }, 1100);
    }
  }

  function finalScroll() {
    var total = 0;
    Array.prototype.forEach.call(document.querySelectorAll('.rg'), function (r) {
      total += parseFloat(r.style.getPropertyValue('--ha')) || 0;
    });
    return Math.max(0, total - VIEW_H + 84); // 84 = the sticky call bar
  }

  function applyInstant(n) {
    for (var s = 1; s <= 8; s++) {
      FIX[s].forEach(function (id) { setFixed(id, s <= n, false); });
    }
    var u = byId('urlBar');
    u.classList.remove('typing');
    var a = byId('urlA');
    a.classList.remove('caret');
    a.innerHTML = '<i class="lock"></i>samplepainting.ca';
    menu.classList.remove('open');
    window.clearTimeout(menuTimer);
    page.classList.add('fast');
    page.style.setProperty('--py', n >= 8 ? '-' + finalScroll() + 'px' : '0px');
  }

  /* ---------- cursor ---------- */
  function toLocal(el, fx_, fy_) {
    var r = el.getBoundingClientRect();
    var sr = screen.getBoundingClientRect();
    var k = sr.width / screen.offsetWidth;
    return {
      x: (r.left - sr.left + r.width * (fx_ == null ? 0.5 : fx_)) / k,
      y: (r.top - sr.top + r.height * (fy_ == null ? 0.5 : fy_)) / k
    };
  }

  function placeCursor(x, y) {
    cursorX = x; cursorY = y;
    cursor.style.setProperty('--cx', (x - 3) + 'px');
    cursor.style.setProperty('--cy', (y - 2) + 'px');
  }

  function moveTo(sel) {
    var el = $(sel);
    if (!el) return Promise.resolve();
    var p = toLocal(el);
    placeCursor(p.x, p.y);
    return sleep(1000);
  }

  function showCursor(on) { cursor.classList.toggle('on', on && !reduce); }

  /* ---------- fanfare ---------- */
  function burst(x, y, count) {
    if (reduce) return;
    var ring = document.createElement('i');
    ring.className = 'ring'; ring.style.left = x + 'px'; ring.style.top = y + 'px';
    var ring2 = ring.cloneNode(); ring2.className = 'ring r2';
    fx.appendChild(ring); fx.appendChild(ring2);
    for (var i = 0; i < count; i++) {
      var p = document.createElement('i');
      var kind = Math.random();
      p.className = 'pt' + (kind < 0.3 ? ' round' : kind < 0.55 ? ' bar' : '');
      var ang = rand(0, Math.PI * 2), dist = rand(45, count > 20 ? 150 : 95);
      p.style.left = x + 'px'; p.style.top = y + 'px';
      p.style.setProperty('--c', COLORS[Math.floor(rand(0, COLORS.length))]);
      p.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
      p.style.setProperty('--dy', Math.sin(ang) * dist + 'px');
      p.style.setProperty('--r', rand(-300, 300) + 'deg');
      fx.appendChild(p);
    }
    window.setTimeout(function () {
      Array.prototype.slice.call(fx.querySelectorAll('.ring, .pt')).forEach(function (n) { n.remove(); });
    }, 1300);
  }

  function tip(x, y, text) {
    if (reduce) return;
    var t = document.createElement('div');
    t.className = 'tip';
    t.textContent = text;
    t.style.top = Math.max(y, 122) + 'px';
    t.style.left = x + 'px';
    fx.appendChild(t);
    // keep the label inside the screen whatever its length
    var half = t.offsetWidth / 2 + 8;
    t.style.left = Math.max(half, Math.min(screen.offsetWidth - half, x)) + 'px';
    window.setTimeout(function () { t.remove(); }, 2200);
  }

  /* ---------- one beat: click, then change the page ---------- */
  function typeUrl(my) {
    return new Promise(function (resolve) {
      var u = byId('urlBar'), a = byId('urlA');
      var full = 'samplepainting.ca', lock = '<i class="lock"></i>', i = 0;
      u.classList.add('typing');
      a.classList.add('caret');
      (function step() {
        if (my !== token || i > full.length) { finish(); return; }
        a.innerHTML = lock + full.slice(0, i);
        i++;
        window.setTimeout(step, 75);
      })();
      function finish() {
        a.innerHTML = lock + full;
        a.classList.remove('caret');
        u.classList.remove('typing');
        if (my === token) u.classList.add('fixed');
        resolve();
      }
    });
  }

  async function runBeat(b, my) {
    var p = { x: cursorX, y: cursorY };
    cursor.classList.add('press');
    await sleep(130);
    if (my !== token) { cursor.classList.remove('press'); return; }
    cursor.classList.remove('press');
    burst(p.x, p.y, b.finale ? 40 : 18);
    tip(p.x, p.y - 4, b.label);
    if (b.fix) b.fix.forEach(function (id) { setFixed(id, true, true); });
    if (b.type) await typeUrl(my);
    if (b.menu) {
      menu.classList.add('open');
      window.clearTimeout(menuTimer);
      menuTimer = window.setTimeout(function () { menu.classList.remove('open'); }, 2600);
      await sleep(2800);
    }
    if (b.finale) {
      await sleep(500);
      if (my !== token) return;
      page.classList.remove('fast');
      page.style.setProperty('--py', '-' + finalScroll() + 'px');
      await sleep(1800);
      if (my !== token) return;
      showCursor(false);   // the finished site gets the screen to itself
      await sleep(1500);
    }
  }

  async function animateStep(n, my) {
    applyInstant(n - 1);
    page.classList.remove('fast');
    showCursor(true);
    var beats = BEATS[n];
    for (var i = 0; i < beats.length; i++) {
      if (my !== token) return;
      await moveTo(beats[i].el);
      if (my !== token) return;
      await runBeat(beats[i], my);
      if (my !== token) return;
      await sleep(350);
    }
  }

  function goto(n) {
    var prev = current;
    current = n;
    token++;
    var my = token;
    if (reduce) { applyInstant(n); return; }
    if (n === 0) {
      applyInstant(0);
      showCursor(false);
    } else if (n === prev + 1) {
      animateStep(n, my);
    } else if (n > prev) {
      // jumped forward: snap everything before this step, then animate only this one
      animateStep(n, my);
    } else {
      // scrolled back up: undo quietly and park the cursor on the previous target
      applyInstant(n);
      var beats = BEATS[n];
      var el = $(beats[beats.length - 1].el);
      if (el) { var q = toLocal(el); placeCursor(q.x, q.y); }
    }
  }

  /* ---------- scroll drives everything ---------- */
  var queued = false;
  var lastActive = -1;

  function render() {
    queued = false;
    var line = window.innerHeight * 0.55;
    var active = 0;
    steps.forEach(function (s, i) {
      if (s.getBoundingClientRect().top < line) active = i + 1;
    });
    var fixes = Math.min(active, TOTAL);

    steps.forEach(function (s, i) {
      s.classList.toggle('on', i + 1 === active);
      s.classList.toggle('done', i + 1 < active);
    });
    ticks.forEach(function (t, i) {
      t.classList.toggle('on', i < fixes);
      t.classList.toggle('latest', fixes > 0 && i === fixes - 1);
    });
    markers.forEach(function (m) {
      m.classList.toggle('active', Number(m.getAttribute('data-mk')) === active);
    });
    if (note) {
      note.textContent = active === 0
        ? 'A sample page, not a real business. Scroll to fix it.'
        : active < TOTAL ? 'Fixed ' + active + ' of ' + TOTAL
        : active === TOTAL ? 'All seven fixed.'
        : 'The whole site, ready to launch. Still a sample.';
    }

    if (active !== lastActive) {
      lastActive = active;
      goto(active);
    }
  }

  function queue() {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(render);
  }

  layout();
  window.setTimeout(function () { phone.classList.add('ready'); }, 2800);
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', function () { layout(); queue(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  render();
})();
