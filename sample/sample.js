(function () {
  /* mobile menu */
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('site-nav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        btn.focus();
      }
    });
  }

  /* "Try a colour": repaints the drawn room */
  var tryBox = document.getElementById('try');
  if (tryBox) {
    var wall = tryBox.querySelector('.room-wall');
    var sofas = tryBox.querySelectorAll('.room-sofa');
    var label = document.getElementById('try-name');
    var chips = tryBox.querySelectorAll('.chip');
    Array.prototype.forEach.call(chips, function (chip) {
      chip.addEventListener('click', function () {
        Array.prototype.forEach.call(chips, function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
        wall.setAttribute('fill', chip.getAttribute('data-wall'));
        Array.prototype.forEach.call(sofas, function (s) { s.setAttribute('fill', chip.getAttribute('data-sofa')); });
        label.textContent = chip.getAttribute('data-name');
      });
    });
  }

  /* the quote form on this sample never sends anything */
  var form = document.getElementById('quote');
  var note = document.getElementById('form-note');
  if (form && note) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      note.textContent = 'Thanks. This is a sample site, so nothing was sent. On a real site this goes straight to the business’s email.';
      form.reset();
    });
  }
})();
