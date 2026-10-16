(function () {
  var form = document.getElementById('intake');
  var review = document.getElementById('review');
  var preview = document.getElementById('preview');
  var sendlink = document.getElementById('sendlink');
  var copyBtn = document.getElementById('copy');
  var editBtn = document.getElementById('edit');
  var copied = document.getElementById('copied');
  if (!form) return;

  var TO = '1premaratmin@gmail.com';
  var MAILTO_LIMIT = 1800; // many email apps cut longer mailto links

  function collect() {
    var lines = [];
    var biz = '';
    var els = form.querySelectorAll('input, select, textarea');
    Array.prototype.forEach.call(els, function (el) {
      var name = el.name;
      if (!name) return;
      var value = '';
      if (el.type === 'checkbox') {
        value = el.checked ? 'Yes' : 'No';
      } else {
        value = (el.value || '').trim();
      }
      if (name === 'Business name') biz = value;
      if (value === '') value = '(not answered)';
      lines.push(name + ': ' + value.replace(/\r?\n/g, '\n    '));
    });
    return { text: lines.join('\n'), biz: biz };
  }

  function show(msg) { copied.textContent = msg; }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    // use the browser's own validation messages, but without relying on novalidate being off
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    var data = collect();
    var subject = 'Onboarding form: ' + (data.biz || 'new customer');
    var body = 'Hi Minuka,\n\nHere are my answers for the free mockup.\n\n' + data.text + '\n';
    var href = 'mailto:' + TO + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    if (href.length > MAILTO_LIMIT) {
      var short = 'Hi Minuka,\n\nMy answers are too long for this link, so I have copied them. I will paste them below.\n\n';
      href = 'mailto:' + TO + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(short);
      show('Your answers are long, so I copied them for you. Paste them into the email when it opens.');
      copyText(data.text);
    } else {
      show('');
    }
    preview.textContent = data.text;
    sendlink.setAttribute('href', href);
    form.hidden = true;
    review.hidden = false;
    review.focus();
    review.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return false; });
    }
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'absolute';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
    document.body.removeChild(ta);
    return Promise.resolve(ok);
  }

  copyBtn.addEventListener('click', function () {
    copyText(preview.textContent).then(function (ok) {
      show(ok ? 'Copied. Paste it into an email to ' + TO + '.' : 'Copying was blocked. Select the answers above and copy them by hand.');
    });
  });

  editBtn.addEventListener('click', function () {
    review.hidden = true;
    form.hidden = false;
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
})();
