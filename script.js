(function () {
  var buttons = document.querySelectorAll('.seg');
  var today = document.getElementById('viewToday');
  var after = document.getElementById('viewAfter');
  var tabTitle = document.getElementById('tabTitle');
  var urlBar = document.getElementById('urlBar');
  var note = document.getElementById('demoNote');
  if (!buttons.length || !today || !after) return;

  var copy = {
    today: {
      tab: 'Mysite',
      url: 'mybusiness.wixsite.com/mysite',
      note: 'The red numbers match the list below. Switch views to see the same page fixed.'
    },
    after: {
      tab: 'Sample Painting Co. | Painters in Oakville',
      url: 'samplepainting.ca',
      note: 'A sample layout, not a real business. Yours would use your name, photos and number.'
    }
  };

  function show(view) {
    var isToday = view === 'today';
    today.hidden = !isToday;
    after.hidden = isToday;
    document.querySelectorAll('.mk-chrome').forEach(function (m) { m.hidden = !isToday; });
    tabTitle.textContent = copy[view].tab;
    urlBar.textContent = copy[view].url;
    note.textContent = copy[view].note;
    buttons.forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.view === view));
    });
  }

  buttons.forEach(function (b) {
    b.addEventListener('click', function () { show(b.dataset.view); });
  });
})();
