/* script.js — интерфейс сайта: меню, появление блоков, фильтры, просмотр фото, вкладки; запуск загрузки контента. */
(function () {
  var CB = window.CB = window.CB || {};
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

  // Плавное появление; CB.reveal вызывается и для динамически добавленных блоков
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } });
  }, { threshold: 0.1 }) : null;
  CB.reveal = function (root) {
    (root || document).querySelectorAll('.rv:not(.on)').forEach(function (el) { io ? io.observe(el) : el.classList.add('on'); });
  };
  CB.reveal();

  // Портфолио: фильтры (кнопки создаются динамически — делегирование)
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.filters button'); if (!b) return;
    var fl = b.closest('.filters'), f = b.getAttribute('data-f');
    fl.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); });
    document.querySelectorAll('.gal .gi').forEach(function (g) { g.hidden = !(f === 'all' || g.getAttribute('data-k') === f || g.getAttribute('data-c') === f); });
  });

  // Просмотр фото
  var lb = document.getElementById('lb'), lbi = lb.querySelector('img'), lbp = lb.querySelector('p');
  function close() { lb.hidden = true; document.body.style.overflow = ''; }
  document.addEventListener('click', function (e) {
    var z = e.target.closest('.zoom');
    if (z) { lbi.src = z.getAttribute('data-full'); lbi.alt = z.getAttribute('data-alt') || ''; lbp.textContent = z.getAttribute('data-alt') || ''; lb.hidden = false; document.body.style.overflow = 'hidden'; }
    else if (e.target === lb || e.target.closest('.lbx')) close();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

  // Вкладки форм на странице контактов
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.tabs button'); if (!b) return;
    var tabs = b.closest('.tabs');
    tabs.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); });
    document.querySelectorAll('[data-p]').forEach(function (p) { p.hidden = p.getAttribute('data-p') !== b.getAttribute('data-t'); });
  });

  // Контент из Google Sheets: один общий источник для всех блоков страницы
  CB.content.subscribe(CB.render);
  CB.content.load();
})();
