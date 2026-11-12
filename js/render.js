/* render.js — подстановка данных из Google Sheets в страницы. Разметка и классы — те же, что в дизайне сайта. */
(function () {
  'use strict';
  var CB = window.CB, C = window.CB_CONFIG, esc = CB.esc, has = CB.has;
  function q(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  // ---------- состояния ----------
  function Loading() { return '<div class="cb-state cb-loading" role="status" aria-live="polite"><span></span><span></span><span></span><em class="sr">Загрузка…</em></div>'; }
  function ErrorBox() { return '<div class="cb-state cb-error" role="alert"><p>Не удалось загрузить данные. Проверьте соединение и попробуйте ещё раз.</p><button type="button" class="btn o" data-retry>Повторить</button></div>'; }
  function Empty(t) { return '<div class="cb-state cb-empty"><p>' + esc(t) + '</p></div>'; }
  CB.ui = { Loading: Loading, ErrorBox: ErrorBox, Empty: Empty };

  var ICON = {
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".8" fill="currentColor"/></svg>',
    telegram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M21 4 3 11l6 2.2L11 20l3-4.2 4.5 3.4z"/><path d="m9 13.2 9-6.7"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M4 20l1.2-4.2A8 8 0 1 1 8.4 19z"/><path d="M9 8.5c.5 3 2.5 5 6 6.2l1.2-1.4-2-1-1 .6c-.8-.4-1.6-1.2-2-2l.6-1-1-2z"/></svg>',
    vk: '<svg viewBox="0 0 24 24"><text x="12" y="16" font-size="10" font-weight="700" text-anchor="middle" fill="currentColor" font-family="Arial">VK</text><rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>',
    channel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M4 10v4h3l7 4V6L7 10z"/><path d="M17.5 9.5a4 4 0 0 1 0 5"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.700l1-1"/></svg>'
  };
  var TYPE_LABEL = { services: 'Услуги', education: 'Обучение' };
  var curOf = function (meta) { return (meta && meta.currency) || C.CURRENCY_FALLBACK; };
  var li = function (a) { return CB.list(a).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join(''); };

  // ---------- привязка текстов ----------
  function get(d, key) { var p = key.split('.'); return d[p[0]] ? d[p[0]][p[1]] : undefined; }
  function bindAll(d) {
    q('[data-bind]').forEach(function (el) {
      var v = get(d, el.getAttribute('data-bind'));
      if (typeof v === 'string' && has(v)) { if (el.hasAttribute('data-rich')) el.innerHTML = CB.rich(v); else el.textContent = v; el.hidden = false; }
      else if (el.hasAttribute('data-hide-empty')) el.hidden = true;
    });
    q('[data-bind-text]').forEach(function (el) { var v = get(d, el.getAttribute('data-bind-text')); if (typeof v === 'string' && has(v)) el.textContent = v; });
    q('[data-bind-href]').forEach(function (el) { var v = get(d, el.getAttribute('data-bind-href')); if (typeof v === 'string' && has(v)) el.setAttribute('href', CB.siteUrl(v)); });
    q('[data-bind-paras]').forEach(function (el) { var v = get(d, el.getAttribute('data-bind-paras')); el.innerHTML = typeof v === 'string' && has(v) ? CB.paras(v) : ''; el.hidden = !(typeof v === 'string' && has(v)); });
    q('[data-show-if]').forEach(function (el) { el.hidden = !has(get(d, el.getAttribute('data-show-if'))); });
    // «Тексты карточек»: одна строка = описание одной карточки направлений (по порядку: услуги, обучение)
    var lines = String(d.home.directionCards || '').split(/\n/).map(function (x) { return x.trim(); }).filter(Boolean);
    q('[data-card]').forEach(function (el) { var t = lines[+el.getAttribute('data-card')]; if (t) el.textContent = t; });
  }

  // ---------- услуги ----------
  function groups(services, cur) {
    var map = {}, order = [];
    services.forEach(function (s) {
      if (!has(s.title)) return;
      var name = (has(s.category) && String(s.category).trim()) || 'Услуги';
      if (!map[name]) { map[name] = { name: name, items: [] }; order.push(name); }
      map[name].items.push(s);
    });
    return order.map(function (n, i) {
      var g = map[n], nums = [];
      g.items.forEach(function (s) { if (CB.isNum(s.priceFrom)) nums.push(s.priceFrom); if (CB.isNum(s.priceTo)) nums.push(s.priceTo); });
      g.slug = 'cat-' + (CB.slug(n) || i);
      g.img = CB.pick(C.SERVICE_IMAGES, n + ' ' + g.items[0].title, C.SERVICE_IMAGE_DEFAULT[i % C.SERVICE_IMAGE_DEFAULT.length]);
      g.range = nums.length ? CB.priceText({ priceFrom: Math.min.apply(null, nums), priceTo: Math.max.apply(null, nums) }, cur) : '';
      return g;
    });
  }
  function svcRow(s, cur) {
    var price = CB.priceText(s, cur), sub = [];
    if (has(s.description)) sub.push(esc(s.description));
    if (has(s.duration)) sub.push('Длительность: ' + esc(s.duration));
    return '<li' + (price ? '' : ' class="np"') + '><span>' + esc(s.title) + (sub.length ? '<small>' + sub.join(' · ') + '</small>' : '') + '</span>' +
      (price ? '<i></i><b>' + price + '</b>' : '') + '</li>' + (has(s.priceNote) ? '<li class="pn">' + esc(s.priceNote) + '</li>' : '');
  }
  function feat(g, cur) {
    var svc = g.items.length === 1 ? g.items[0].title : g.name;
    return '<article class="feat rv" id="' + g.slug + '"><div class="fimg">' + CB.img(g.img, { sizes: '(min-width:900px) 45vw,100vw', alt: 'Иллюстрация: ' + g.name, pos: '50% 25%' }) + '</div><div class="ftxt">' +
      (g.range ? '<div class="tag">' + g.range + '</div>' : '') + '<h2>' + esc(g.name) + '</h2><ul class="pl">' + g.items.map(function (s) { return svcRow(s, cur); }).join('') +
      '</ul><a class="btn" href="' + CB.leadUrl('service', svc) + '">Записаться</a></div></article>';
  }

  // ---------- обучение ----------
  function courseId(c) { return c.id || CB.slug(c.title); }
  function courseMeta(c, cur) {
    var m = [];
    if (has(c.audience)) m.push('Для кого: ' + esc(c.audience));
    if (has(c.format)) m.push('Формат: ' + esc(c.format));
    if (has(c.duration)) m.push('Длительность: ' + esc(c.duration));
    if (CB.isNum(c.price)) m.push('Стоимость: ' + CB.money(c.price, cur));
    if (has(c.groupType)) m.push('Группа / индивидуально: ' + esc(c.groupType));
    if (has(c.certificate)) m.push('Сертификат: ' + esc(c.certificate));
    return m;
  }
  function courseCard(c, cur) {
    var id = courseId(c), url = CB.courseUrl(id), m = courseMeta(c, cur);
    return '<article class="ccard rv"><a class="cimg" href="' + url + '">' + CB.img(C.COURSE_IMAGES[id] || C.COURSE_IMAGE_DEFAULT, { sizes: '(min-width:900px) 33vw,100vw', alt: 'Иллюстрация: ' + c.title }) + '</a><div><h3>' + esc(c.title) + '</h3>' +
      (has(c.description) ? '<p>' + esc(c.description) + '</p>' : '') + (m.length ? '<ul class="meta"><li>' + m.join('</li><li>') + '</li></ul>' : '') + '<a class="btn o" href="' + url + '">Подробнее</a></div></article>';
  }
  function courseDetail(d, meta, el) {
    var id = el.getAttribute('data-course-id') || new URLSearchParams(location.search).get('id'), cur = curOf(meta);
    var c = d.education.filter(function (x) { return has(x.title) && courseId(x) === id; })[0];
    if (!c) { document.title = 'Курс — CHUPROVA BEAUTY'; return '<section class="sec"><div class="w">' + Empty('Этот курс не найден или пока не опубликован.') + '</div></section>'; }
    document.title = c.title + ' — обучение, CHUPROVA BEAUTY';
    var info = [['Формат', c.format], ['Продолжительность', c.duration], ['Группа / индивидуально', c.groupType], ['Стоимость', CB.isNum(c.price) ? CB.money(c.price, cur) : null], ['Сертификат', c.certificate]]
      .filter(function (r) { return has(r[1]); }).map(function (r) { return '<li><span>' + r[0] + '</span><b>' + esc(r[1]) + '</b></li>'; }).join('');
    var blocks = '';
    if (has(c.audience)) blocks += '<section class="blk"><h3>Для кого</h3>' + CB.paras(c.audience) + '</section>';
    if (CB.list(c.program).length) blocks += '<section class="blk"><h3>Программа</h3><ul class="tl">' + li(c.program) + '</ul></section>';
    return '<section class="phead dark"><div class="w pg"><div><div class="tag">Программа обучения</div><h1>' + esc(c.title) + '</h1>' + (has(c.description) ? '<p>' + esc(c.description) + '</p>' : '') + '</div>' +
      '<div class="ph-img">' + CB.img(C.COURSE_IMAGES[id] || C.COURSE_IMAGE_DEFAULT, { sizes: '(min-width:900px) 45vw,100vw', alt: 'Иллюстрация: ' + c.title, eager: true }) + '</div></div></section>' +
      '<section class="sec"><div class="w cpage"><div>' + (blocks || '<div class="blk"></div>') + '</div><aside class="side"><h3>О курсе</h3>' + (info ? '<ul class="pl">' + info + '</ul>' : '') +
      '<a class="btn" href="' + CB.leadUrl('education', c.title) + '">Оставить заявку</a></aside></div>' +
      '<div class="w cg">' + [13, 14, 15].map(function (n) { return '<figure>' + CB.img(n, { sizes: '(min-width:900px) 33vw,100vw', alt: 'Иллюстрация: обучение в студии' }) + '</figure>'; }).join('') + '</div></section>';
  }

  // ---------- наставничество / обо мне ----------
  function mentorshipBody(d) {
    var m = d.mentorship, h = '', inc = CB.list(m.includes), res = CB.list(m.results);
    if (has(m.audience)) h += '<section class="sec"><div class="w two"><div class="rv"><div class="tag">Кому подходит</div><h2>Для кого <em>наставничество</em></h2></div><div class="rv">' + CB.paras(m.audience) + '</div></div></section>';
    if (inc.length) h += '<section class="sec dark"><div class="w two"><div class="rv">' + CB.img(17, { sizes: '(min-width:900px) 40vw,100vw', alt: 'Иллюстрация: мастер в рабочем пространстве', pos: '50% 20%' }) + '</div><div class="rv"><div class="tag">Что входит</div><h2>Состав <em>программы</em></h2><ul class="tl">' + li(inc) + '</ul></div></div></section>';
    if (has(m.format)) h += '<section class="sec sand"><div class="w two"><div class="rv"><div class="tag">Формат</div><h2>Как <em>проходит</em></h2></div><div class="rv">' + CB.paras(m.format) + '</div></div></section>';
    if (res.length) h += '<section class="sec"><div class="w two"><div class="rv"><div class="tag">Результат</div><h2>Что получит <em>ученик</em></h2></div><div class="rv"><ul class="tl one">' + li(res) + '</ul></div></div></section>';
    if (has(m.price)) h += '<section class="sec carm"><div class="w two"><div class="rv"><div class="tag">Стоимость</div><h2>Цена и <em>условия</em></h2></div><div class="rv">' + CB.paras(m.price) + '</div></div></section>';
    return h || '<section class="sec"><div class="w">' + Empty('Подробности о наставничестве скоро появятся.') + '</div></section>';
  }
  function aboutBody(d) {
    var a = d.about, c = [];
    if (has(a.story)) c.push('<div class="fact wide rv"><b>О себе</b>' + CB.paras(a.story) + '</div>');
    if (has(a.experience)) c.push('<div class="fact rv"><b>Стаж работы</b>' + esc(a.experience) + '</div>');
    if (CB.list(a.education).length) c.push('<div class="fact rv"><b>Курсы и квалификации</b><ul class="tl one">' + li(a.education) + '</ul></div>');
    if (CB.list(a.principles).length) c.push('<div class="fact rv"><b>Принципы работы</b><ul class="tl one">' + li(a.principles) + '</ul></div>');
    if (has(a.cities)) c.push('<div class="fact rv"><b>Города работы</b>' + esc(a.cities) + '</div>');
    return c.length ? '<div class="facts">' + c.join('') + '</div>' : Empty('Рассказ о мастере скоро появится.');
  }

  // ---------- портфолио ----------
  function portfolio(d) {
    var real = d.portfolio.map(function (it) { return { src: CB.photoSrc(it.photo), cat: has(it.category) ? String(it.category).trim() : 'Работы', cap: it.caption, desc: it.description }; }).filter(function (x) { return x.src; });
    var cats = [], seen = {};
    function addCat(n) { var s = CB.slug(n); if (!seen[s]) { seen[s] = 1; cats.push([s, n]); } }
    real.forEach(function (r) { addCat(r.cat); }); C.ILLUSTRATIONS.forEach(function (i) { addCat(i[1]); });
    var f = '<div class="filters" role="group" aria-label="Категории"><button class="on" data-f="all">Все</button>' + (real.length ? '<button data-f="real">Реальные работы</button>' : '') +
      cats.map(function (c) { return '<button data-f="' + c[0] + '">' + esc(c[1]) + '</button>'; }).join('') + '</div>';
    var g = real.length ? real.map(function (r, i) {
      var alt = [r.cap, r.desc].filter(has).join('. ') || r.cat;
      return '<figure class="gi rv' + (i % 4 === 0 ? ' tall' : '') + '" data-k="real" data-c="' + CB.slug(r.cat) + '"><button class="zoom" data-full="' + esc(r.src) + '" data-alt="' + esc(alt) + '" aria-label="Увеличить"><img data-real src="' + esc(r.src) + '" alt="' + esc(alt) + '" loading="lazy" decoding="async"></button><figcaption>' + esc(r.cap || r.cat) + '</figcaption></figure>';
    }).join('') : [1, 2, 3].map(function () { return '<div class="gi ph" data-k="real"><span>Реальная работа — фото будет добавлено</span></div>'; }).join('');
    g += C.ILLUSTRATIONS.map(function (i, k) {
      var alt = 'Иллюстрация: ' + i[1];
      return '<figure class="gi' + (k % 4 === 0 ? ' tall' : '') + '" data-k="ill" data-c="' + CB.slug(i[1]) + '"><button class="zoom" data-full="' + CB.root + 'images/web/' + ('0' + i[0]).slice(-2) + '.webp" data-alt="' + alt + '" aria-label="Увеличить">' + CB.img(i[0], { sizes: '(min-width:900px) 25vw,50vw', alt: alt }) + '</button><figcaption>Иллюстрация · ' + esc(i[1]) + '</figcaption></figure>';
    }).join('');
    return f + '<div class="gal">' + g + '</div>';
  }

  // ---------- график ----------
  function upcoming(d) { return d.schedule.filter(function (s) { return has(s.city) && !CB.isPast(s.dateFrom, s.dateTo); }); }
  function typeLabel(t) { return has(t) ? (TYPE_LABEL[t] || String(t)) : ''; }
  function scheduleCards(d) {
    var list = upcoming(d);
    if (!list.length) return Empty('Ближайшие поездки появятся здесь, как только будут запланированы.');
    return '<div class="tgrid">' + list.map(function (s) {
      var lines = [CB.fmtRange(s.dateFrom, s.dateTo), s.time, s.place, s.howToBook].filter(has).map(esc);
      return '<article class="tcard rv">' + (has(s.type) ? '<div class="tag">' + esc(typeLabel(s.type)) + '</div>' : '') + '<h3>' + esc(s.city) + '</h3>' + (lines.length ? '<p>' + lines.join('<br>') + '</p>' : '') +
        '<a class="btn o" href="' + CB.leadUrl(s.type === 'education' ? 'education' : 'service', '', s.city) + '">Записаться</a></article>';
    }).join('') + '</div>';
  }
  function scheduleRows(d) {
    var list = upcoming(d).slice(0, 3);
    if (!list.length) return Empty('Расписание поездок скоро появится.');
    return list.map(function (s) {
      return '<div class="city"><span class="d">' + esc(CB.fmtRange(s.dateFrom, s.dateTo) || typeLabel(s.type)) + '</span><h3>' + esc(s.city) + '</h3><span>' + esc([s.place, s.time].filter(has).join(' · ')) + '</span></div>';
    }).join('');
  }

  // ---------- модели ----------
  function availableModels(d) {
    return d.models.filter(function (m) { return has(m.procedure) && !(CB.isNum(m.seats) && m.seats <= 0) && !CB.isPast(m.date); });
  }
  function modelCard(m) {
    var dt = CB.parseDate(m.date), time = has(m.time) ? m.time : '', seats = CB.isNum(m.seats) ? 'Свободных мест: ' + m.seats : (has(m.seats) ? 'Свободные места: ' + m.seats : '');
    var req = [['Кого ищем', m.requirements], ['Исходное состояние волос', m.hairState], ['Что планируется', m.plan], ['Место', m.place], ['Условия', m.terms], ['', seats], ['Как откликнуться', m.howToRespond]]
      .filter(function (r) { return has(r[1]); }).map(function (r) { return '<li>' + (r[0] ? '<b>' + r[0] + ':</b> ' : '') + esc(r[1]) + '</li>'; }).join('');
    var hasDate = dt || time;
    return '<article class="mcard rv' + (hasDate ? '' : ' nodate') + '"><div class="mimg2">' + CB.img(CB.pick(C.MODEL_IMAGES, m.procedure, C.MODEL_IMAGE_DEFAULT), { sizes: '(min-width:900px) 25vw,100vw', alt: 'Иллюстрация: ' + m.procedure, pos: '50% 25%' }) + '</div>' +
      '<div class="mbody"><h3>' + esc(m.procedure) + '</h3>' + (req ? '<ul class="req">' + req + '</ul>' : '') + '<a class="btn" href="#apply" data-offer="' + esc(m.procedure) + '" data-city="' + esc(m.place || '') + '">Откликнуться</a></div>' +
      (hasDate ? '<div class="mdate">' + (dt ? '<small>Дата</small><b>' + CB.fmtDay(dt) + '</b>' : '') + (time ? '<small>Время</small><b>' + esc(time) + '</b>' : '') + '</div>' : '') + '</article>';
  }
  function modelsList(d) {
    var l = availableModels(d);
    return l.length ? l.map(modelCard).join('') : Empty('Сейчас нет открытых предложений для моделей. Оставьте заявку, и мастер свяжется с вами, когда появится подходящая работа.');
  }
  /** Модели и обучение на одни даты — основа будущей связки расписания. */
  function timeline(d) {
    var ms = availableModels(d).filter(function (m) { return CB.parseDate(m.date); });
    if (!ms.length) return '';
    var dates = []; ms.forEach(function (m) { if (dates.indexOf(m.date) < 0) dates.push(m.date); }); dates.sort();
    var edu = upcoming(d).filter(function (s) { return s.type === 'education' && CB.parseDate(s.dateFrom); });
    var cols = dates.slice(0, 6).map(function (dt) {
      var mm = ms.filter(function (m) { return m.date === dt; }).map(function (m) { return esc(m.procedure) + (has(m.place) ? ' (' + esc(m.place) + ')' : ''); });
      var ee = edu.filter(function (s) { var a = s.dateFrom, b = has(s.dateTo) && CB.parseDate(s.dateTo) ? s.dateTo : s.dateFrom; return a <= dt && dt <= b; }).map(function (s) { return esc(s.city) + (has(s.place) ? ', ' + esc(s.place) : ''); });
      return '<div class="tcol"><div class="tdate">' + CB.fmtDay(CB.parseDate(dt)) + '</div><div class="tcell m"><small>Модели и процедуры</small>' + mm.join('<br>') + '</div>' + (ee.length ? '<div class="tcell e"><small>Обучение</small>' + ee.join('<br>') + '</div>' : '') + '</div>';
    }).join('');
    return '<div class="w"><div class="tag">Как это связано с обучением</div><h2>Одни даты — для моделей и <em>учеников</em></h2><p style="max-width:640px;margin-top:14px;color:#e2d3c2">Запланированные модели определяют дни, на которые назначается обучение.</p><div class="tline">' + cols + '</div>' +
      '<div class="btns" style="margin-top:20px"><a class="btn" href="' + CB.root + 'education/index.html">Программы обучения</a><a class="btn o" href="' + CB.root + 'schedule/index.html">Города и расписание</a></div></div>';
  }

  // ---------- контакты ----------
  function socialLinks(d, full) {
    var out = d.socials.filter(function (s) { return /^(https?:\/\/|mailto:|tel:)/i.test(String(s.url || '')); }).map(function (s) {
      var label = has(s.label) ? s.label : (s.platform || 'Ссылка');
      return '<a class="si" href="' + esc(s.url) + '"' + (/^https?:/i.test(s.url) ? ' target="_blank" rel="noopener noreferrer"' : '') + ' aria-label="' + esc(label) + '" title="' + esc(label) + '">' + (ICON[s.id] || ICON.link) + (full ? '<span>' + esc(label) + '</span>' : '') + '</a>';
    }).join('');
    return out ? '<div class="socs' + (full ? ' full' : '') + '">' + out + '</div>' : '';
  }
  var tel = function (p) { return String(p).replace(/[^\d+]/g, ''); };
  function contactsInfo(d) {
    var c = d.contacts, h = '', rows = [];
    if (has(c.intro)) h += CB.paras(c.intro);
    if (has(c.primaryContact)) rows.push('<li>Основной способ связи: ' + esc(c.primaryContact) + '</li>');
    if (has(c.phone)) rows.push('<li>Телефон: <a href="tel:' + esc(tel(c.phone)) + '">' + esc(c.phone) + '</a></li>');
    if (has(c.geography)) rows.push('<li>' + esc(c.geography) + '</li>');
    if (has(c.responseTime)) rows.push('<li>Время ответа: ' + esc(c.responseTime) + '</li>');
    if (rows.length) h += '<ul class="cl">' + rows.join('') + '</ul>';
    var soc = socialLinks(d, true);
    if (soc) h += '<h3 style="margin:8px 0 12px">Мессенджеры и соцсети</h3>' + soc;
    return h || Empty('Контактные данные скоро появятся. Пока можно оставить заявку в форме.');
  }
  function footerContacts(d) {
    var c = d.contacts, r = [];
    if (has(c.phone)) r.push('<li><a href="tel:' + esc(tel(c.phone)) + '">' + esc(c.phone) + '</a></li>');
    if (has(c.geography)) r.push('<li>' + esc(c.geography) + '</li>');
    return r.join('');
  }
  function options(items) { return items.filter(has).filter(function (v, i, a) { return a.indexOf(v) === i; }).map(function (v) { return '<option value="' + esc(v) + '">'; }).join(''); }

  // ---------- реестр ----------
  var SOFT = ['footer-contacts', 'socials', 'dl-services', 'dl-courses', 'dl-models', 'home-benefits', 'services-chips', 'home-courses'];
  var R = {
    'home-benefits': function (d) { return li(d.home.benefits); },
    'home-services': function (d, m) {
      var g = groups(d.services, curOf(m)).slice(0, 3);
      return g.length ? g.map(function (x) { return '<a class="pop rv" href="' + CB.root + 'services/index.html#' + x.slug + '">' + CB.img(x.img, { sizes: '(min-width:900px) 33vw,100vw', alt: 'Иллюстрация: ' + x.name }) + '<div><h3>' + esc(x.name) + '</h3>' + (x.range ? '<span>' + x.range + '</span>' : '') + '</div></a>'; }).join('') : Empty('Каталог услуг скоро появится.');
    },
    'home-courses': function (d) { var l = d.education.filter(function (c) { return has(c.title); }); return l.map(function (c) { return '<a href="' + CB.courseUrl(courseId(c)) + '">' + esc(c.title) + '</a>'; }).join(''); },
    'home-schedule': scheduleRows,
    'services-chips': function (d, m) { return groups(d.services, curOf(m)).map(function (g) { return '<a href="#' + g.slug + '">' + esc(g.name) + '</a>'; }).join(''); },
    'services-feats': function (d, m) { var g = groups(d.services, curOf(m)); return g.length ? g.map(function (x) { return feat(x, curOf(m)); }).join('') : Empty('Каталог услуг и прайс скоро появятся.'); },
    'education-list': function (d, m) { var l = d.education.filter(function (c) { return has(c.title); }); return l.length ? l.map(function (c) { return courseCard(c, curOf(m)); }).join('') : Empty('Программы обучения скоро появятся.'); },
    'course': courseDetail,
    'mentorship-body': mentorshipBody,
    'about-body': aboutBody,
    'portfolio': portfolio,
    'schedule-list': scheduleCards,
    'models-list': modelsList,
    'models-timeline': timeline,
    'contacts-info': contactsInfo,
    'footer-contacts': footerContacts,
    'socials': function (d) { return socialLinks(d, false); },
    'dl-services': function (d) { return options(d.services.map(function (s) { return s.title; }).concat(d.services.map(function (s) { return s.category; }))); },
    'dl-courses': function (d) { return options(d.education.map(function (c) { return c.title; })); },
    'dl-models': function (d) { return options(availableModels(d).map(function (m) { return m.procedure; })); }
  };

  CB.render = function (state) {
    if (state.status === 'ready') bindAll(state.data);
    q('[data-cb]').forEach(function (el) {
      var name = el.getAttribute('data-cb'), fn = R[name]; if (!fn) return;
      var soft = SOFT.indexOf(name) >= 0, wrapper = el.hasAttribute('data-wrapper');
      if (state.status !== 'ready') {
        if (wrapper) { el.hidden = true; return; }
        el.innerHTML = soft ? '' : (state.status === 'loading' ? Loading() : ErrorBox());
        return;
      }
      try {
        var html = fn(state.data, state.meta, el);
        el.innerHTML = html;
        if (wrapper) el.hidden = !html;
        if (CB.reveal) CB.reveal(el);
        if (name === 'portfolio') q('img[data-real]', el).forEach(function (i) { i.addEventListener('error', function () { var f = i.closest('.gi'); if (f) f.remove(); }); });
      } catch (e) { console.error('Ошибка отрисовки «' + name + '»:', e); el.innerHTML = soft ? '' : ErrorBox(); }
    });
    document.dispatchEvent(new CustomEvent('cb:rendered', { detail: state }));
  };
  document.addEventListener('click', function (e) { if (e.target.closest('[data-retry]')) CB.content.load(true); });
})();
