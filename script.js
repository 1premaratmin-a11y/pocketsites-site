(function () {
  var phone = document.getElementById('phone');
  var steps = Array.prototype.slice.call(document.querySelectorAll('.step'));
  var fixables = Array.prototype.slice.call(phone ? phone.querySelectorAll('[data-fix]') : []);
  var markers = Array.prototype.slice.call(phone ? phone.querySelectorAll('[data-mk]') : []);
  var ticks = Array.prototype.slice.call(document.querySelectorAll('.progress i'));
  var note = document.getElementById('demoNote');
  if (!phone || !steps.length) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TOTAL = 7;
  var lastKey = null;
  var queued = false;

  // after the entrance sequence, markers stop popping and only stamp when their fix lands
  window.setTimeout(function () { phone.classList.add('ready'); }, 2800);

  // the highlighter sweep: restart the animation each time an element is newly fixed
  function flash(el) {
    if (reduce) return;
    el.classList.remove('flash');
    void el.offsetWidth;
    el.classList.add('flash');
    window.setTimeout(function () { el.classList.remove('flash'); }, 1000);
  }

  function render() {
    queued = false;
    var line = window.innerHeight * 0.55;
    var active = 0;
    steps.forEach(function (s, i) {
      if (s.getBoundingClientRect().top < line) active = i + 1;
    });
    var fixes = Math.min(active, TOTAL);
    var key = active + ':' + fixes;
    if (key === lastKey) return;
    lastKey = key;

    fixables.forEach(function (el) {
      var shouldFix = Number(el.getAttribute('data-fix')) <= fixes;
      var wasFixed = el.classList.contains('fixed');
      el.classList.toggle('fixed', shouldFix);
      var skip = el.closest('.t-hero') || el.classList.contains('banner');
      if (shouldFix && !wasFixed && !skip) flash(el);
    });
    markers.forEach(function (m) {
      var n = Number(m.getAttribute('data-mk'));
      m.classList.toggle('fixed', n <= fixes);
      m.classList.toggle('active', n === active);
    });
    steps.forEach(function (s, i) {
      s.classList.toggle('on', i + 1 === active);
      s.classList.toggle('done', i + 1 < active);
    });
    ticks.forEach(function (t, i) {
      t.classList.toggle('on', i < fixes);
      t.classList.toggle('latest', fixes > 0 && i === fixes - 1);
    });
    if (note) {
      note.textContent = fixes === 0
        ? 'A sample page, not a real business. Scroll to fix it.'
        : fixes < TOTAL
          ? 'Fixed ' + fixes + ' of ' + TOTAL
          : 'All seven fixed. Still a sample, not a real business.';
    }
  }

  function queue() {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(render);
  }

  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue);
  render();
})();
