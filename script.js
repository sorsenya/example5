(function () {
  var hd = document.getElementById('hd'), nv = document.getElementById('nv'), bg = document.getElementById('bg');
  function sc() { hd.classList.toggle('s', window.scrollY > 20); }
  sc(); window.addEventListener('scroll', sc, { passive: true });
  function menu(open) {
    nv.classList.toggle('o', open); bg.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
  bg.addEventListener('click', function () { menu(!nv.classList.contains('o')); });
  nv.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { menu(false); }); });
  window.addEventListener('resize', function () { if (window.innerWidth > 1000) menu(false); });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } });
    }, { threshold: 0.1 });
    document.querySelectorAll('.rv').forEach(function (el) { io.observe(el); });
  } else document.querySelectorAll('.rv').forEach(function (el) { el.classList.add('on'); });

  // Портфолио: фильтры
  var fl = document.querySelector('.filters');
  if (fl) fl.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    fl.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); });
    var f = b.dataset.f;
    document.querySelectorAll('.gi').forEach(function (g) { g.hidden = !(f === 'all' || g.dataset.c === f); });
  });

  // Просмотр фото
  var lb = document.getElementById('lb'), lbi = lb.querySelector('img'), lbp = lb.querySelector('p');
  function close() { lb.hidden = true; document.body.style.overflow = ''; }
  document.addEventListener('click', function (e) {
    var z = e.target.closest('.zoom');
    if (z) { lbi.src = z.dataset.full; lbi.alt = z.dataset.alt; lbp.textContent = z.dataset.alt; lb.hidden = false; document.body.style.overflow = 'hidden'; }
    else if (e.target === lb || e.target.closest('.lbx')) close();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

  // Вкладки форм
  var tabs = document.querySelector('.tabs');
  if (tabs) tabs.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    tabs.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); });
    document.querySelectorAll('[data-p]').forEach(function (p) { p.hidden = p.dataset.p !== b.dataset.t; });
  });

  // Формы: только клиентская валидация, без отправки и без сообщения об успехе
  document.querySelectorAll('.form').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = 0;
      f.querySelectorAll('input[required]').forEach(function (i) {
        var empty = !i.value.trim(); i.classList.toggle('bad', empty); if (empty) bad++;
      });
      f.querySelector('.fmsg').textContent = bad ? 'Заполните обязательные поля: имя и контакт.' : 'Отправка пока не подключена: это визуальный прототип.';
    });
  });
})();
// Модели: «Откликнуться» подставляет процедуру в форму (без отправки данных)
document.querySelectorAll('[data-offer]').forEach(function (b) {
  b.addEventListener('click', function () {
    var i = document.querySelector('#apply input[name="f3"]'); if (i) i.value = b.dataset.offer;
  });
});
