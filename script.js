(function () {
  var phone = document.getElementById('phone');
  var steps = Array.prototype.slice.call(document.querySelectorAll('.step'));
  var fixables = Array.prototype.slice.call(phone ? phone.querySelectorAll('[data-fix]') : []);
  var markers = Array.prototype.slice.call(phone ? phone.querySelectorAll('[data-mk]') : []);
  var note = document.getElementById('demoNote');
  if (!phone || !steps.length) return;

  var TOTAL = 7;
  var lastKey = null;
  var queued = false;

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
      el.classList.toggle('fixed', Number(el.getAttribute('data-fix')) <= fixes);
    });
    markers.forEach(function (m) {
      var n = Number(m.getAttribute('data-mk'));
      m.classList.toggle('fixed', n <= fixes);
      m.classList.toggle('active', n === active);
    });
    steps.forEach(function (s, i) {
      s.classList.toggle('on', i + 1 === active);
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
