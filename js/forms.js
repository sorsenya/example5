/* forms.js — единый механизм отправки всех форм сайта на API заявок. */
(function () {
  'use strict';
  var CB = window.CB;
  var BTN_BUSY = 'Отправляем…';

  function validContact(s) {
    s = String(s || '').trim();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s)) return true;
    if (/^(?:@|(?:https?:\/\/)?t\.me\/@?)[A-Za-z][A-Za-z0-9_]{4,31}$/.test(s)) return true;
    if (/^[+\d\s().\-]+$/.test(s)) { var d = s.replace(/\D/g, ''); return d.length >= 10 && d.length <= 15; }
    return false;
  }
  function msg(form, kind, text) {
    var err = form.querySelector('.fmsg'), ok = form.querySelector('.fok');
    if (err) err.textContent = kind === 'err' ? text : '';
    if (ok) ok.textContent = kind === 'ok' ? text : '';
  }
  function mark(el, bad) { if (el) { el.classList.toggle('bad', !!bad); el.setAttribute('aria-invalid', bad ? 'true' : 'false'); } }

  /** Собирает поля формы в объект для API. Пустые значения не отправляются. */
  function collect(form) {
    var o = { type: form.getAttribute('data-form'), source: CB.route };
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name || el.type === 'submit' || el.type === 'button') return;
      var v = String(el.value || '').trim();
      if (v) o[el.name] = v;
    });
    var fixed = form.getAttribute('data-service');
    if (fixed && !o.service) o.service = fixed;
    return o;
  }

  function submit(form) {
    if (form.getAttribute('data-busy') === '1') return;                  // защита от повторной отправки
    msg(form, '', '');
    var d = collect(form), bad = [];
    var name = form.elements.name, contact = form.elements.contact;
    mark(name, !d.name || d.name.length < 2); mark(contact, !validContact(d.contact));
    if (!d.name || d.name.length < 2) bad.push(name);
    if (!validContact(d.contact)) bad.push(contact);
    if (bad.length) {
      msg(form, 'err', !d.contact || !d.name ? 'Заполните имя и контакт для связи.' : 'Укажите телефон, e-mail или Telegram (@имя).');
      bad[0].focus(); return;
    }
    var btn = form.querySelector('button[type=submit]'), label = btn.textContent;
    form.setAttribute('data-busy', '1'); form.setAttribute('aria-busy', 'true'); btn.disabled = true; btn.textContent = BTN_BUSY;
    CB.leads.submit(d).then(function (r) {
      if (r.ok) {
        form.reset();
        Array.prototype.forEach.call(form.elements, function (el) { mark(el, false); });
        msg(form, 'ok', r.data && r.data.duplicate ? 'Эта заявка уже получена. Мастер свяжется с вами.'
          : 'Спасибо! Заявка принята' + (r.data && r.data.id ? ' (№ ' + r.data.id + ')' : '') + '. Мастер свяжется с вами.');
      } else {
        if (r.field && form.elements[r.field]) mark(form.elements[r.field], true);
        msg(form, 'err', r.message);                                      // введённые данные остаются в форме
      }
    }).then(function () {
      form.removeAttribute('data-busy'); form.removeAttribute('aria-busy'); btn.disabled = false; btn.textContent = label;
    });
  }

  document.addEventListener('submit', function (e) {
    var f = e.target.closest('form[data-form]'); if (!f) return;
    e.preventDefault(); submit(f);
  });
  document.addEventListener('input', function (e) { if (e.target.classList && e.target.classList.contains('bad')) mark(e.target, false); });

  CB.forms = {
    prefill: function (form, v) {
      if (!form) return;
      ['service', 'city'].forEach(function (k) { if (v[k] && form.elements[k]) form.elements[k].value = v[k]; });
    }
  };

  // «Откликнуться» на странице моделей: подставляет процедуру и город в форму
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-offer]'); if (!b) return;
    CB.forms.prefill(document.querySelector('#apply [data-form="model"]'), { service: b.getAttribute('data-offer'), city: b.getAttribute('data-city') });
  });

  // Предзаполнение по ссылке: contacts/?type=education&service=…&city=…
  document.addEventListener('DOMContentLoaded', function () {
    var p = new URLSearchParams(location.search), type = p.get('type');
    if (!type) return;
    var form = document.querySelector('form[data-form="' + type.replace(/[^a-z]/g, '') + '"]'); if (!form) return;
    var tab = document.querySelector('.tabs [data-t="' + type + '"]'); if (tab) tab.click();
    CB.forms.prefill(form, { service: p.get('service'), city: p.get('city') });
  });
})();
