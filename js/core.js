/* core.js — общие функции, единый источник контента и отправка заявок. */
(function () {
  'use strict';
  var C = window.CB_CONFIG, CB = window.CB = window.CB || {};
  var body = document.body;
  CB.root = body.getAttribute('data-root') || '';
  CB.route = body.getAttribute('data-route') || '/';

  // ---------- текст ----------
  CB.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  /** Экранирует текст; *слово* выделяется курсивом (как в дизайне сайта). */
  CB.rich = function (s) { return CB.esc(s).replace(/\*([^*\n]+)\*/g, '<em>$1</em>'); };
  CB.paras = function (s) { return String(s).split(/\n{2,}/).map(function (p) { return '<p>' + CB.esc(p.trim()).replace(/\n/g, '<br>') + '</p>'; }).join(''); };
  CB.has = function (v) { return v !== null && v !== undefined && !(typeof v === 'string' && !v.trim()) && !(Array.isArray(v) && !v.length); };
  CB.slug = function (s) { return String(s || '').toLowerCase().replace(/[^a-z0-9а-яё]+/g, '-').replace(/^-+|-+$/g, ''); };
  CB.list = function (a) { return Array.isArray(a) ? a.filter(CB.has) : []; };

  // ---------- деньги и даты ----------
  CB.money = function (n, cur) { return (+n).toLocaleString('ru-RU').replace(/\s/g, '\u00a0') + '\u00a0' + (cur || C.CURRENCY_FALLBACK); };
  CB.isNum = function (v) { return typeof v === 'number' && isFinite(v); };
  /** Цена услуги: «от 1 000 ₽», «1 000 – 2 000 ₽» или '' (пустые цены не показываются). */
  CB.priceText = function (it, cur) {
    var a = CB.isNum(it.priceFrom) ? it.priceFrom : null, b = CB.isNum(it.priceTo) ? it.priceTo : null;
    var u = '\u00a0' + (cur || C.CURRENCY_FALLBACK), f = function (n) { return n.toLocaleString('ru-RU').replace(/\s/g, '\u00a0'); };
    if (a !== null && b !== null) return a === b ? f(a) + u : f(a) + '\u00a0–\u00a0' + f(b) + u;
    if (a !== null) return 'от\u00a0' + f(a) + u;
    if (b !== null) return 'до\u00a0' + f(b) + u;
    return '';
  };
  var MON = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  CB.parseDate = function (s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ''); if (!m) return null;
    var y = +m[1], mo = +m[2], d = +m[3], dt = new Date(y, mo - 1, d);
    return dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === d ? dt : null;
  };
  CB.fmtDay = function (dt) { return dt.getDate() + ' ' + MON[dt.getMonth()]; };
  CB.fmtRange = function (from, to) {
    var a = CB.parseDate(from), b = CB.parseDate(to);
    if (!a && !b) return '';
    if (!a) return CB.fmtDay(b) + ' ' + b.getFullYear();
    if (!b || +a === +b) return CB.fmtDay(a) + ' ' + a.getFullYear();
    if (b < a) return CB.fmtDay(a) + ' ' + a.getFullYear();                       // некорректный диапазон — только начало
    if (a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()) return a.getDate() + '–' + b.getDate() + ' ' + MON[a.getMonth()] + ' ' + a.getFullYear();
    return CB.fmtDay(a) + ' – ' + CB.fmtDay(b) + ' ' + b.getFullYear();
  };
  /** Событие прошло, если известна дата окончания (или начала) и она раньше сегодняшнего дня. */
  CB.isPast = function (from, to) {
    var e = CB.parseDate(to) || CB.parseDate(from); if (!e) return false;
    var t = new Date(); t.setHours(0, 0, 0, 0); return e < t;
  };

  // ---------- ссылки и изображения ----------
  /** Адрес из таблицы → рабочая ссылка. «/services/» превращается в путь внутри сайта. */
  CB.siteUrl = function (u) {
    u = String(u || '').trim(); if (!u) return '';
    if (/^(https?:\/\/|mailto:|tel:|#)/i.test(u)) return u;
    var parts = u.split('#'), path = parts[0].replace(/^\/+/, ''), hash = parts[1] ? '#' + parts[1] : '';
    if (!path) return CB.root + 'index.html' + hash;
    if (/\/$/.test(path)) path += 'index.html'; else if (!/\.[a-z0-9]+(\?|$)/i.test(path)) path += '/index.html';
    return CB.root + path + hash;
  };
  var SIZES = { land: [2, 11, 12, 13, 14, 15, 16, 18, 19, 20, 21] };
  CB.img = function (n, o) {
    o = o || {};
    var id = ('0' + n).slice(-2), w = 1120, h = 1390;
    if (SIZES.land.indexOf(n) >= 0) { w = 1400; h = 782; } else if (n === 3) { w = 1045; h = 1400; } else if (n === 17) { w = 1128; h = 1400; } else if (n === 22) { w = 640; h = 640; }
    var big = CB.root + 'images/web/' + id + '.webp', sm = CB.root + 'images/web/' + id + '-s.webp';
    return '<img src="' + big + '" srcset="' + sm + ' 640w, ' + big + ' ' + w + 'w" sizes="' + (o.sizes || '100vw') + '" width="' + w + '" height="' + h + '" alt="' + CB.esc(o.alt || '') + '" ' + (o.eager ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"') +
      (o.pos ? ' style="object-position:' + o.pos + '"' : '') + '>';
  };
  CB.pick = function (rules, text, dflt) { for (var i = 0; i < rules.length; i++) if (rules[i][0].test(text || '')) return rules[i][1]; return dflt; };
  /** Фото портфолио: URL как есть; «07.webp»/«7» — иллюстрации сайта; иначе файл из images/portfolio/. */
  CB.photoSrc = function (p) {
    p = String(p || '').trim(); if (!p) return '';
    if (/^https?:\/\//i.test(p)) return p;
    var m = /^0?(\d{1,2})(\.(webp|jpe?g|png))?$/i.exec(p);
    if (m && +m[1] >= 1 && +m[1] <= 22) return CB.root + 'images/web/' + ('0' + m[1]).slice(-2) + '.webp';
    return CB.root + C.PORTFOLIO_DIR + encodeURIComponent(p).replace(/%2F/g, '/');
  };
  CB.courseUrl = function (id) {
    return C.COURSE_PAGES.indexOf(id) >= 0 ? CB.root + 'education/' + id + '/index.html' : CB.root + 'education/course/index.html?id=' + encodeURIComponent(id);
  };
  /** Ссылка на форму заявки с предзаполнением (type, service, city). */
  CB.leadUrl = function (type, service, city) {
    var q = ['type=' + encodeURIComponent(type)];
    if (service) q.push('service=' + encodeURIComponent(service));
    if (city) q.push('city=' + encodeURIComponent(city));
    return CB.root + 'contacts/index.html?' + q.join('&') + '#form';
  };

  // ---------- единый источник контента ----------
  var OBJ = ['home', 'about', 'mentorship', 'contacts'], ARR = ['services', 'education', 'portfolio', 'schedule', 'models', 'socials'];
  function normalize(d) {
    var o = {};
    OBJ.forEach(function (k) { o[k] = d && d[k] && typeof d[k] === 'object' && !Array.isArray(d[k]) ? d[k] : {}; });
    ARR.forEach(function (k) { o[k] = d && Array.isArray(d[k]) ? d[k].filter(function (x) { return x && typeof x === 'object'; }) : []; });
    return o;
  }
  var state = { status: 'loading', data: null, meta: {}, stale: false }, subs = [], inflight = null;
  function emit() { subs.forEach(function (f) { try { f(state); } catch (e) { console.error(e); } }); }
  function readCache() { try { var o = JSON.parse(localStorage.getItem(C.CACHE_KEY)); return o && o.data ? o : null; } catch (e) { return null; } }
  function writeCache(data, meta) { try { localStorage.setItem(C.CACHE_KEY, JSON.stringify({ t: Date.now(), data: data, meta: meta })); } catch (e) {} }
  function timeoutFetch(url, opt, ms) {
    var ctl = typeof AbortController !== 'undefined' ? new AbortController() : null, timer;
    if (ctl) { opt.signal = ctl.signal; timer = setTimeout(function () { ctl.abort(); }, ms); }
    return fetch(url, opt).then(function (r) { clearTimeout(timer); return r; }, function (e) { clearTimeout(timer); throw e; });
  }
  function fetchContent() {
    return timeoutFetch(C.CONTENT_URL + '?action=content', { method: 'GET', redirect: 'follow' }, C.FETCH_TIMEOUT_MS)
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
      .then(function (t) {
        var j; try { j = JSON.parse(t); } catch (e) { throw new Error('Ответ API не является JSON'); }
        if (!j || j.success !== true || !j.data || typeof j.data !== 'object') throw new Error((j && j.error && j.error.message) || 'API вернул ошибку');
        return j;
      });
  }
  CB.content = {
    subscribe: function (f) { subs.push(f); f(state); },
    state: function () { return state; },
    /** force=true — игнорировать свежий кэш (кнопка «Повторить»). */
    load: function (force) {
      if (inflight) return inflight;
      var cache = readCache();
      if (cache) {
        var age = Date.now() - cache.t;
        state = { status: 'ready', data: normalize(cache.data), meta: cache.meta || {}, stale: age >= C.CACHE_FRESH_MS };
        emit();
        if (!force && age < C.CACHE_FRESH_MS) return Promise.resolve(state);
      } else if (force || state.status === 'error') { state = { status: 'loading', data: null, meta: {}, stale: false }; emit(); }
      inflight = fetchContent().then(function (j) {
        var before = JSON.stringify(state.data), data = normalize(j.data);
        writeCache(j.data, j.meta || {});
        state = { status: 'ready', data: data, meta: j.meta || {}, stale: false };
        if (before !== JSON.stringify(data) || cache === null) emit();
      }).catch(function (e) {
        console.warn('Контент не загружен:', e && e.message);
        if (state.data) { state.stale = true; emit(); }                      // остаёмся на последних сохранённых данных
        else { state = { status: 'error', data: null, meta: {}, stale: false, message: e && e.message }; emit(); }
      }).then(function () { inflight = null; return state; });
      return inflight;
    }
  };

  // ---------- отправка заявок ----------
  var NET_MSG = 'Не удалось связаться с сервером. Проверьте интернет и попробуйте ещё раз. Введённые данные сохранены.';
  /** Всегда возвращает {ok:true,data} или {ok:false,code,message}. Успех — только если API подтвердил success:true. */
  CB.leads = {
    submit: function (payload) {
      // text/plain — «простой» запрос без preflight; тело — JSON. no-cors не используется: ответ должен быть прочитан.
      return timeoutFetch(C.LEADS_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload), redirect: 'follow' }, C.SUBMIT_TIMEOUT_MS)
        .then(function (r) { return r.text().then(function (t) { return { r: r, t: t }; }); })
        .then(function (x) {
          var j; try { j = JSON.parse(x.t); } catch (e) { return { ok: false, code: 'BAD_RESPONSE', message: 'Не получили подтверждения от сервера. Данные сохранены в форме: проверьте соединение и повторите.' }; }
          if (j && j.success === true) return { ok: true, data: j.data || {} };
          var er = (j && j.error) || {};
          return { ok: false, code: er.code || 'API_ERROR', field: er.field, message: er.message || 'Не удалось отправить заявку. Попробуйте позже.' };
        })
        .catch(function (e) {
          return { ok: false, code: e && e.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK',
            message: e && e.name === 'AbortError' ? 'Сервер не ответил вовремя. Заявка могла не сохраниться — повторите отправку или напишите в мессенджер.' : NET_MSG };
        });
    }
  };
})();
