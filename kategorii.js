/* kategorii.js – butona kategorish nën filtra.
   Nuk prek app.js: lexon dropdown-in e profesionit dhe e ndryshon si përdorues. */
(function () {
  var ICONS = {
    'Hidraulik': '🔧', 'Elektriçar': '⚡', 'Murator': '🧱', 'Moler': '🎨',
    'Dyer & Dritare': '🚪', 'Pastrim': '🧹', 'Kanalizim': '🚰',
    'Servis kaldajash': '🔥', 'Klima servis': '❄️', 'Bravatar': '🔑',
    'Mekanik': '🚗', 'Autoelektricist': '🔋', 'Parketar': '🪵',
    'Kopshtar': '🌿', 'Limar': '🏠', 'Izolues': '🧊', 'Saldues': '🔩',
    'Tapecier': '🛋️', 'Vulkanizer': '🛞'
  };
  var VISIBLE = 8; // sa kategori shfaqen para "Shiko të gjitha"

  var css = '' +
    '.kat{padding:22px 0 4px}' +
    '.kat h2{font-size:1.15rem;margin:0 0 12px;color:var(--ink)}' +
    '.kat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(128px,1fr));gap:10px}' +
    '.kat-btn{font:inherit;font-weight:600;font-size:.92rem;color:var(--ink);background:var(--card);' +
      'border:1.5px solid var(--line);border-radius:12px;padding:14px 8px;min-height:84px;cursor:pointer;' +
      'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;text-align:center}' +
    '.kat-btn i{font-style:normal;font-size:1.6rem;line-height:1}' +
    '.kat-btn:hover{border-color:var(--acc)}' +
    '.kat-btn[aria-pressed="true"]{border-color:var(--acc);box-shadow:inset 0 0 0 1px var(--acc)}' +
    '.kat-more{margin-top:10px;font:inherit;font-weight:600;color:var(--ink);background:transparent;' +
      'border:1.5px solid var(--line);border-radius:10px;padding:10px 16px;cursor:pointer}';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  var expanded = false;

  function getSelect() {
    return document.querySelector('.filters select');
  }

  function fire(sel) {
    ['input', 'change'].forEach(function (t) {
      sel.dispatchEvent(new Event(t, { bubbles: true }));
    });
  }

  function build() {
    var sel = getSelect();
    var hero = document.querySelector('.hero');
    if (!sel || !hero) return;

    var opts = Array.prototype.slice.call(sel.options).filter(function (o) { return o.value; });
    if (!opts.length) return;

    var box = document.getElementById('kat-box');
    if (!box) {
      box = document.createElement('section');
      box.id = 'kat-box';
      box.className = 'wrap kat';
      hero.parentNode.insertBefore(box, hero.nextSibling);
    }

    box.innerHTML = '<h2>Çfarë mjeshtri të duhet?</h2><div class="kat-grid" id="kat-grid"></div>';
    var grid = box.querySelector('#kat-grid');
    var list = expanded ? opts : opts.slice(0, VISIBLE);

    list.forEach(function (o) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'kat-btn';
      b.setAttribute('aria-pressed', String(sel.value === o.value));
      var ic = document.createElement('i');
      ic.textContent = ICONS[o.text.trim()] || '🛠️';
      b.appendChild(ic);
      b.appendChild(document.createTextNode(o.text.trim()));
      b.addEventListener('click', function () {
        var on = sel.value === o.value;
        sel.value = on ? '' : o.value; // klikim i dytë e heq filtrin
        fire(sel);
        sync();
      });
      grid.appendChild(b);
    });

    if (opts.length > VISIBLE) {
      var more = document.createElement('button');
      more.type = 'button';
      more.className = 'kat-more';
      more.textContent = expanded ? 'Shiko më pak' : 'Shiko të gjitha (' + opts.length + ')';
      more.addEventListener('click', function () { expanded = !expanded; build(); });
      box.appendChild(more);
    }
  }

  function sync() {
    var sel = getSelect();
    if (!sel) return;
    document.querySelectorAll('.kat-btn').forEach(function (b) {
      var o = Array.prototype.find.call(sel.options, function (x) { return x.text.trim() === b.textContent.trim(); });
      b.setAttribute('aria-pressed', String(!!o && sel.value === o.value));
    });
  }

  // Faqja ngarkon përmbajtjen me JavaScript, ndaj presim derisa dropdown-i të ekzistojë
  // dhe e rindërtojmë nëse app.js e rinderton faqen.
  var timer;
  var obs = new MutationObserver(function () {
    clearTimeout(timer);
    timer = setTimeout(function () {
      var sel = getSelect();
      if (sel && !document.getElementById('kat-box')) build();
      if (sel && !sel.dataset.katBound) {
        sel.dataset.katBound = '1';
        sel.addEventListener('change', sync);
      }
    }, 50);
  });
  obs.observe(document.getElementById('app') || document.body, { childList: true, subtree: true });
})();
