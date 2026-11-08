#!/usr/bin/env python3
"""Генератор страниц CHUPROVA BEAUTY. Запуск: python3 build.py"""
import os, html
from data import *

ROOT = os.path.dirname(os.path.abspath(__file__))
NAV = [("services","Услуги"),("education","Обучение"),("mentorship","Наставничество"),("models","Стать моделью"),("about","Обо мне"),("portfolio","Портфолио"),("contacts","Контакты")]
FAV = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%2330251F'/%3E%3Ctext x='32' y='43' font-size='32' text-anchor='middle' fill='%23C9A97C' font-family='Georgia'%3ECB%3C/text%3E%3C/svg%3E"

ICON = {
 "instagram":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".8" fill="currentColor"/></svg>',
 "telegram":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M21 4 3 11l6 2.2L11 20l3-4.2 4.5 3.4z"/><path d="m9 13.2 9-6.7"/></svg>',
 "whatsapp":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M4 20l1.2-4.2A8 8 0 1 1 8.4 19z"/><path d="M9 8.5c.5 3 2.5 5 6 6.2l1.2-1.4-2-1-1 .6c-.8-.4-1.600-1.200-2-2l.6-1-1-2z"/></svg>',
 "vk":'<svg viewBox="0 0 24 24"><text x="12" y="16" font-size="10" font-weight="700" text-anchor="middle" fill="currentColor" font-family="Arial">VK</text><rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>',
 "channel":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M4 10v4h3l7 4V6L7 10z"/><path d="M17.5 9.500a4 4 0 0 1 0 5"/></svg>',
}
def socials(p, full=False):
    out = ""
    for s in SOCIALS:
        ic = ICON[s["id"]]
        if s["url"]:
            out += f'<a class="si" href="{s["url"]}" target="_blank" rel="noopener" aria-label="{s["name"]}">{ic}{"<span>"+s["name"]+"</span>" if full else ""}</a>'
        else:
            out += f'<span class="si off" role="img" aria-label="{s["name"]}: ссылка будет добавлена" title="{s["name"]}: ссылка будет добавлена">{ic}{"<span>"+s["name"]+" — ссылка будет добавлена</span>" if full else ""}</span>'
    return f'<div class="socs{" full" if full else ""}">{out}</div>'

def url(p, key):  # p = префикс до корня
    if key == "index": return p + "index.html"
    if key.startswith("education/"): return p + key + "/index.html"
    return p + key + "/index.html"

def img(n, p, sizes="100vw", cls="", eager=False, pos=None):
    w, h = SIZES[n]
    st = f' style="object-position:{pos}"' if pos else ""
    big = f'{p}images/web/{n:02d}.webp'; sm = f'{p}images/web/{n:02d}-s.webp'
    sw = 640 if n != 22 else 640
    attrs = 'fetchpriority="high"' if eager else 'loading="lazy" decoding="async"'
    return (f'<img class="{cls}" src="{big}" srcset="{sm} {sw}w, {big} {w}w" sizes="{sizes}" '
            f'width="{w}" height="{h}" alt="{html.escape(ALT[n])}" {attrs}{st}>')

def btn(text, href, cls=""): return f'<a class="btn {cls}" href="{href}">{text}</a>'

def header(p, active):
    items = "".join(f'<li><a href="{url(p,k)}"{" aria-current=page" if k==active else ""}>{t}</a></li>' for k, t in NAV)
    return f'''<header id="hd"><div class="w nav"><a class="logo" href="{url(p,"index")}">CHUPROVA <b>BEAUTY</b></a>
<nav id="nv" aria-label="Основная навигация"><ul><li class="mob"><a href="{url(p,"index")}"{" aria-current=page" if active=="index" else ""}>Главная</a></li>{items}<li class="mob"><a href="{url(p,"schedule")}"{" aria-current=page" if active=="schedule" else ""}>Города и расписание</a></li></ul>
<a class="btn mob" href="{url(p,"contacts")}#form">Записаться</a></nav>
<a class="btn nbtn" href="{url(p,"contacts")}#form">Записаться</a>
<button class="bg" id="bg" aria-label="Открыть меню" aria-expanded="false" aria-controls="nv"><span></span><span></span></button></div></header>'''

def footer(p):
    nav = "".join(f'<li><a href="{url(p,k)}">{t}</a></li>' for k, t in NAV + [("schedule","Города и расписание")])
    dirs = f'<li><a href="{url(p,"services")}">Услуги мастера</a></li><li><a href="{url(p,"education")}">Обучение</a></li><li><a href="{url(p,"mentorship")}">Наставничество</a></li><li><a href="{url(p,"models")}">Стать моделью</a></li>'
    soc = socials(p)
    return f'''<footer><div class="w fgrid"><div><div class="logo">CHUPROVA <b>BEAUTY</b></div><p>Личный бренд парикмахера-колориста Алены Артемьевой: стрижки, окрашивания, очное обучение и наставничество.</p></div>
<div><h4>Навигация</h4><ul>{nav}</ul></div><div><h4>Направления</h4><ul>{dirs}</ul></div>
<div><h4>Контакты</h4><ul><li>Телефон: будет добавлен</li><li>Email: будет добавлен</li></ul>{soc}</div></div>
<div class="w copy">© 2026 CHUPROVA BEAUTY · Прототип: контакты, курсы и расписание — временные данные</div></footer>
<div class="lb" id="lb" role="dialog" aria-modal="true" hidden><button class="lbx" aria-label="Закрыть">✕</button><img alt=""><p></p></div>'''

def page(rel, title, desc, active, body, depth, og=None):
    p = "../" * depth
    doc = f'''<!DOCTYPE html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title><meta name="description" content="{desc}">
<meta property="og:title" content="{title}"><meta property="og:description" content="{desc}"><meta property="og:type" content="website">
<meta property="og:image" content="{p}images/web/{og or 1:02d}.webp"><link rel="icon" href="{FAV}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Manrope:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{p}style.css"></head><body>
{header(p, active)}<main id="top">{body}</main>{footer(p)}<a class="fab" href="{p}contacts/index.html#form">Записаться</a><script src="{p}script.js" defer></script></body></html>'''
    path = os.path.join(ROOT, rel); os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, "w", encoding="utf-8").write(doc)

def head(tag, h, text="", n=None, p="", dark=True, extra=""):
    pic = f'<div class="ph-img">{img(n,p,"(min-width:900px) 45vw,100vw",eager=True)}</div>' if n else ""
    return f'<section class="phead {"dark" if dark else "sand"}"><div class="w pg"><div class="rv"><div class="tag">{tag}</div><h1>{h}</h1><p>{text}</p>{extra}</div>{pic}</div></section>'

def rows(rs): return "".join(f'<li><span>{a}</span><i></i><b>{b}</b></li>' for a, b in rs)

def form(kind, p):
    f = {"service":[("Имя","text"),("Контакт (телефон или Telegram)","text"),("Город","text"),("Интересующая услуга","text"),("Желаемая дата","date")],
         "edu":[("Имя","text"),("Контакт (телефон или Telegram)","text"),("Интересующий курс","text"),("Уровень подготовки","text"),("Предпочтительный формат","text")],
         "model":[("Имя","text"),("Контакт (телефон или Telegram)","text"),("Город","text"),("Интересующая процедура","text"),("Длина и цвет волос сейчас","text")],
         "mentor":[("Имя","text"),("Контакт (телефон или Telegram)","text"),("Текущий уровень","text"),("Цели обучения","text")]}[kind]
    fields = "".join(f'<label>{l}<input type="{t}" name="f{i}" {"required" if i<2 else ""} autocomplete="off"></label>' for i, (l, t) in enumerate(f))
    return f'<form class="form" novalidate>{fields}<label class="full">Комментарий<textarea rows="3" name="c"></textarea></label><button class="btn full" type="submit">Отправить заявку</button><p class="fmsg full" aria-live="polite"></p><p class="note full">Форма пока визуальная: данные никуда не отправляются.</p></form>'

def cta(p, text="Готовы к преображению или хотите начать профессиональный путь?"):
    return f'<section class="cta"><div class="w"><h2>{text}</h2>{btn("Связаться со мной", url(p,"contacts")+"#form")}</div></section>'

def course_card(c, p):
    return f'''<article class="ccard rv"><a class="cimg" href="{p}education/{c["id"]}/index.html">{img(c["img"],p,"(min-width:900px) 33vw,100vw")}</a><div><h3>{c["title"]}</h3><p>{c["text"]}</p>
<ul class="meta"><li>Уровень: {c["level"]}</li><li>Длительность: {TBD}</li><li>Стоимость: {TBD}</li><li>Формат: очно</li></ul>{btn("Подробнее", f'{p}education/{c["id"]}/index.html', "o")}</div></article>'''

# ---------- ГЛАВНАЯ ----------
def home():
    p = ""
    pop = "".join(f'''<a class="pop rv" href="services/index.html#{s["id"]}">{img(s["img"],p,"(min-width:900px) 33vw,100vw")}<div><h3>{s["title"]}</h3><span>{s["price"]}</span></div></a>''' for s in [SERVICES[4], SERVICES[3], SERVICES[7]])
    works = "".join(f'<figure class="rv">{img(n,p,"(min-width:900px) 25vw,50vw")}</figure>' for n in (3, 8, 9, 5))
    cities = "".join(f'<div class="city"><span class="d">{c["dates"]}</span><h3>{c["city"]}</h3><span>{c["status"]}</span></div>' for c in CITIES)
    body = f'''<section class="hero"><div class="w hg"><div class="rv"><div class="chips"><span>HAIR ARTIST</span><span>COLOR EXPERT</span><span>EDUCATION</span></div>
<h1>Искусство преображения <em>волос</em> и профессионального развития</h1><p>Стрижки, окрашивания и обучение парикмахерскому искусству.</p>
<div class="btns">{btn("Услуги мастера","services/index.html")}{btn("Обучение","education/index.html","o")}</div></div>
<div class="col">{img(22,p,"(min-width:900px) 30vw,90vw","c1",True,"42% 30%")}{img(2,p,"(min-width:900px) 22vw,50vw","c2")}{img(3,p,"20vw","c3","","50% 20%")}<div class="cap"><b>Алена Артемьева</b><span>парикмахер-колорист · наставник</span></div></div></div></section>
<section class="sec"><div class="w intro"><div class="pic rv">{img(22,p,"(min-width:900px) 40vw,100vw","","","50% 25%")}</div><div class="rv"><div class="tag">Знакомство</div><h2>Алена Артемьева — парикмахер, колорист, <em>наставник</em></h2>
<p>Демонстрационный текст: Алена работает с клиентами в разных городах и обучает начинающих и действующих мастеров. Личная история и опыт будут добавлены позже.</p>{btn("Обо мне","about/index.html","o")}</div></div></section>
<section class="dirs"><a class="dir" href="services/index.html">{img(6,p,"(min-width:900px) 50vw,100vw","","","50% 30%")}<div><div class="tag">01</div><h2>Услуги мастера</h2><p>Стрижки, окрашивания, сложные техники, восстановление и уход.</p><span class="btn">Посмотреть услуги</span></div></a>
<a class="dir" href="education/index.html">{img(14,p,"(min-width:900px) 50vw,100vw")}<div><div class="tag">02</div><h2>Обучение</h2><p>Курсы для начинающих и действующих мастеров и наставничество.</p><span class="btn">Выбрать обучение</span></div></a></section>
<section class="sec sand"><div class="w"><div class="head rv"><div><div class="tag">Популярные услуги</div><h2>Каталог <em>мастера</em></h2></div>{btn("Весь прайс","services/index.html","o")}</div><div class="pops">{pop}</div></div></section>
<section class="sec dark"><div class="w"><div class="head rv"><div><div class="tag">Избранное</div><h2>Иллюстрации <em>услуг</em></h2></div>{btn("Портфолио","portfolio/index.html")}</div><div class="strip">{works}</div><p class="note">Это иллюстративные изображения, а не реальные работы. Реальные фото появятся в портфолио.</p></div></section>
<section class="sec carm"><div class="w edu"><div class="rv">{img(13,p,"(min-width:900px) 55vw,100vw")}</div><div class="rv"><div class="tag">Обучение</div><h2>Очные программы для <em>мастеров</em></h2><p>Пять направлений: от обучения с нуля до повышения квалификации.</p>{btn("Все программы","education/index.html")}</div></div></section>
<section class="ment"><div class="mimg">{img(16,p,"(min-width:900px) 50vw,100vw","","","50% 40%")}</div><div class="mtxt rv"><div class="tag">Premium · индивидуально</div><h2>Наставничество: путь к <em>профессии</em></h2><p>Индивидуальная помощь в профессиональном становлении под ваши цели.</p>{btn("Узнать больше","mentorship/index.html")}</div></section>
<section class="sec"><div class="w edu m2"><div class="rv"><div class="tag">Для моделей</div><h2>Стать <em>моделью</em></h2><p>Мастеру нужны модели для отработки техник и обучения. Посмотрите предстоящие работы.</p>{btn("Стать моделью","models/index.html")}</div><div class="rv">{img(12,p,"(min-width:900px) 55vw,100vw")}</div></div></section>
<section class="sec deep"><div class="w"><div class="head rv"><div><div class="tag">Города и даты</div><h2>Где принимает <em>мастер</em></h2></div>{btn("Расписание","schedule/index.html","o")}</div><div class="rv">{cities}</div><p class="note">Демонстрационные данные.</p></div></section>
<section class="sec sand"><div class="w"><div class="tag">Отзывы</div><h2 class="rv">Клиенты и <em>ученики</em></h2><div class="rev rv"><div><q>Отзыв клиента</q>Заглушка</div><div><q>Отзыв ученика</q>Заглушка</div><div><q>Отзыв клиента</q>Заглушка</div></div></div></section>{cta(p)}'''
    page("index.html", "CHUPROVA BEAUTY — стрижки, окрашивание и обучение парикмахеров", "Парикмахер-колорист Алена Артемьева: стрижки, сложные окрашивания, очное обучение и наставничество.", "index", body, 0, 22)

# ---------- УСЛУГИ ----------
def services():
    p = "../"
    chips = "".join(f'<a href="#{s["id"]}">{s["title"]}</a>' for s in SERVICES)
    feats = "".join(f'''<article class="feat rv" id="{s["id"]}"><div class="fimg">{img(s["img"],p,"(min-width:900px) 45vw,100vw","","","50% 25%")}</div><div class="ftxt"><div class="tag">{s["price"]}</div><h2>{s["title"]}</h2><p>{s["text"]}</p><ul class="pl">{rows(s["rows"])}</ul>{btn("Записаться", p+"contacts/index.html#form")}</div></article>''' for s in SERVICES)
    body = head("Услуги мастера", "Каталог <em>услуг</em>", "Стрижки, окрашивание, сложные техники, восстановление и диагностика.", 12, p) + \
        f'<section class="sec"><div class="w"><nav class="chipnav" aria-label="Категории">{chips}</nav></div><div class="w feats">{feats}<p class="snote">{SERVICE_NOTE}</p><div class="c">{btn("Записаться", p+"contacts/index.html#form")} {btn("Участвовать как модель", p+"models/index.html","o")}</div></div></section>'
    page("services/index.html", "Услуги и прайс — CHUPROVA BEAUTY", "Прайс на стрижки, окрашивание, сложные техники, блонд, выход из чёрного и уход.", "services", body, 1, 12)

# ---------- ОБУЧЕНИЕ ----------
def education():
    p = "../"
    cards = "".join(course_card(c, p) for c in COURSES)
    body = head("Очное обучение", "Обучение <em>парикмахеров</em>", "Очные программы для начинающих и действующих мастеров. Онлайн-формата нет.", 13, p) + \
        f'<section class="sec"><div class="w"><div class="cgrid">{cards}</div><p class="note">Описания, длительность и стоимость программ — временные, будут заменены.</p></div></section>' + \
        f'<section class="sec carm"><div class="w two"><div class="rv"><div class="tag">Для практики</div><h2>Ищем <em>моделей</em> для обучения</h2></div><div class="rv"><p>Учеников и модели лучше планировать на одни даты. Посмотрите, на какие работы идёт набор.</p>{btn("Стать моделью", p+"models/index.html")}</div></div></section><section class="ment"><div class="mimg">{img(15,p,"(min-width:900px) 50vw,100vw")}</div><div class="mtxt rv"><div class="tag">Индивидуально</div><h2>Нужен личный <em>маршрут</em>?</h2><p>Наставничество — отдельная программа под ваши цели, а не обычный курс.</p>{btn("Наставничество", p+"mentorship/index.html")}</div></section>' + cta(p, "Хотите начать профессиональный путь?")
    page("education/index.html", "Обучение парикмахеров — CHUPROVA BEAUTY", "Очное обучение: с нуля, женские и мужские стрижки, комбинированные техники и повышение квалификации.", "education", body, 1, 13)

def courses():
    p = "../../"
    for c in COURSES:
        sec = lambda t, x: f'<section class="blk rv"><h3>{t}</h3><p>{x}</p></section>'
        info = f'<ul class="pl">{rows([("Формат","Очно"),("Уровень подготовки",c["level"]),("Продолжительность",TBD),("Формат группы","Индивидуальный или групповой — уточняется"),("Стоимость",TBD),("Сертификат",TBD)])}</ul>'
        gal = "".join(f'<figure>{img(n,p,"(min-width:900px) 33vw,100vw")}</figure>' for n in (13, 14, 15))
        body = head("Программа обучения", c["title"], c["text"], c["img"], p) + f'''<section class="sec"><div class="w cpage"><div>{sec("Описание","Подробное описание курса будет добавлено заказчицей.")}{sec("Для кого","Информация будет добавлена.")}{sec("Чему научится ученик","Перечень навыков будет добавлен.")}{sec("Программа","Программа обучения будет добавлена.")}</div>
<aside class="side rv"><h3>О курсе</h3>{info}<p class="note">Данные временные.</p>{btn("Оставить заявку", p+"contacts/index.html#form")}</aside></div><div class="w cg">{gal}</div></section>
<div class="w back"><a href="{p}education/index.html">← Все программы</a></div>''' + cta(p, "Готовы записаться на обучение?")
        page(f'education/{c["id"]}/index.html', f'{c["title"]} — обучение, CHUPROVA BEAUTY', f'{c["title"]}: очная программа обучения парикмахеров.', "education", body, 2, c["img"])


# ---------- СТАТЬ МОДЕЛЬЮ ----------
def models():
    p = "../"
    dl = lambda m: "".join(f"<li>{m[k]}</li>" for k in ("who","hair","result","terms"))
    cards = "".join(f'''<article class="mcard rv" id="{m["id"]}"><div class="mimg2">{img(m["img"],p,"(min-width:900px) 25vw,100vw","","","50% 25%")}<span class="demo">Демо-пример</span></div>
<div class="mbody"><h3>{m["title"]}</h3><ul class="req">{dl(m)}</ul><a class="btn" href="#apply" data-offer="{m["title"]}">Откликнуться</a></div>
<div class="mdate"><small>Дата</small><b>{m["date"]}</b><small>Время</small><b>{m["time"]}</b></div></article>''' for m in MODELS)
    tl = "".join(f'''<div class="tcol"><div class="tdate">{t["date"]}</div><div class="tcell m"><small>Модели и процедуры</small>{t["model"]}</div><div class="tcell e"><small>Обучение и ученики</small>{t["edu"]}</div></div>''' for t in TIMELINE)
    body = head("Для моделей", "Стать <em>моделью</em>", "Для отработки техник и проведения обучения мастеру нужны модели. Вы получаете работу мастера, а ученики практику под наблюдением.", 12, p, True, f'<div class="btns" style="margin-top:22px">{btn("Стать моделью","#apply")}{btn("Все предложения","#offers","o")}</div>') + f'''
<section class="sec" id="offers"><div class="w"><div class="head rv"><div><div class="tag">Предстоящие работы</div><h2>Ищем <em>моделей</em></h2></div></div><div class="mlist">{cards}</div><p class="note">Все карточки — демонстрационные примеры, а не реальные записи. Даты и условия появятся позже.</p></div></section>
<section class="sec dark"><div class="w"><div class="tag">Как это связано с обучением</div><h2 class="rv">Одни даты — для моделей и <em>учеников</em></h2><p class="rv" style="max-width:640px;margin-top:14px;color:#e2d3c2">Запланированные модели определяют дни, на которые назначается обучение. В будущем расписание будет показывать оба направления вместе.</p><div class="tline rv">{tl}</div><p class="note">Демо-структура: данных пока нет, автоматической связки тоже.</p><div class="btns" style="margin-top:20px">{btn("Программы обучения", p+"education/index.html")}{btn("Города и расписание", p+"schedule/index.html","o")}</div></div></section>
<section class="sec sand" id="apply"><div class="w two"><div class="rv"><div class="tag">Заявка</div><h2>Откликнуться <em>моделью</em></h2><p>Расскажите о себе и выберите процедуру. Мастер свяжется с вами, когда отклики откроются.</p></div><div class="rv">{form("model",p)}</div></div></section>''' + cta(p, "Хотите попробовать работу мастера?")
    page("models/index.html", "Стать моделью — CHUPROVA BEAUTY", "Поиск моделей для стрижек и окрашиваний: предстоящие работы, требования и условия участия.", "models", body, 1, 12)

# ---------- НАСТАВНИЧЕСТВО ----------
def mentorship():
    p = "../"
    topics = "".join(f"<li>{t}</li>" for t in MENTOR_TOPICS)
    steps = "".join(f'<div class="step rv"><span>{i}</span><h3>{t}</h3></div>' for i, t in enumerate(["Знакомство и цели","Индивидуальный план","Практика и разбор","Рост и результат"], 1))
    body = head("Premium · индивидуально", "Наставничество: путь к <em>профессии</em>", "Не просто техники, а помощь в профессиональном становлении.", 16, p) + f'''
<section class="sec"><div class="w two"><div class="rv"><div class="tag">Кому подходит</div><h2>Тем, кто хочет стать <em>мастером</em></h2></div><div class="rv"><p>Начинающим и действующим парикмахерам, которым нужна индивидуальная работа. Демонстрационный текст, будет уточнён.</p><p>Какие задачи помогает решить: уверенность в работе, клиентская база, ценообразование, развитие практики.</p></div></div></section>
<section class="sec dark"><div class="w two"><div class="rv">{img(17,p,"(min-width:900px) 40vw,100vw","","","50% 20%")}</div><div class="rv"><div class="tag">Что можно получить</div><h2>Знания и <em>навыки</em></h2><ul class="tl">{topics}</ul><p class="note">Программа подбирается под цели ученика, не все темы входят в каждую.</p></div></div></section>
<section class="sec"><div class="w"><div class="tag">Как проходит работа</div><div class="steps">{steps}</div></div></section>
<section class="sec sand" id="form"><div class="w two"><div class="rv"><div class="tag">Заявка</div><h2>Расскажите о своих <em>целях</em></h2><p>Индивидуальный подход: программа формируется под вас.</p></div><div class="rv">{form("mentor",p)}</div></div></section>''' + cta(p, "Хотите обсудить наставничество?")
    page("mentorship/index.html", "Наставничество для парикмахеров — CHUPROVA BEAUTY", "Индивидуальное наставничество: практика, клиенты, цены, развитие собственного дела.", "mentorship", body, 1, 16)

# ---------- ОБО МНЕ ----------
def about():
    p = "../"
    facts = "".join(f'<div class="fact"><b>{t}</b>Текст будет добавлен</div>' for t in ("История пути","Специализация","Опыт","Образование","Образовательная деятельность","Подход к работе"))
    body = f'''<section class="phead sand"><div class="w pg"><div class="rv"><div class="tag">Обо мне</div><h1>Алена <em>Артемьева</em></h1><p>Парикмахер, колорист, преподаватель и наставник. Автор бренда CHUPROVA BEAUTY.</p></div><div class="ph-img sq">{img(22,p,"(min-width:900px) 40vw,100vw","","True","50% 25%").replace('fetchpriority="high"','fetchpriority="high"')}</div></div></section>
<section class="sec"><div class="w"><div class="facts rv">{facts}</div><p class="note">Мы не придумываем биографию, стаж и достижения: тексты будут добавлены.</p></div></section>
<section class="sec dark"><div class="w two"><div class="rv">{img(18,p,"(min-width:900px) 50vw,100vw")}</div><div class="rv"><div class="tag">Рабочее пространство</div><h2>Как выглядит <em>работа</em></h2><p>Иллюстрация рабочего места. Реальные фото процесса будут добавлены.</p><div class="btns">{btn("Услуги", p+"services/index.html")}{btn("Обучение", p+"education/index.html","o")}</div></div></div></section>''' + cta(p)
    page("about/index.html", "Алена Артемьева — парикмахер-колорист, CHUPROVA BEAUTY", "Личная страница Алены Артемьевой: парикмахер, колорист, преподаватель и наставник.", "about", body, 1, 22)

# ---------- ПОРТФОЛИО ----------
def portfolio():
    p = "../"
    fl = '<button class="on" data-f="all">Все</button><button data-f="real">Реальные работы</button>' + "".join(f'<button data-f="{k}">{v}</button>' for k, v in CATS.items())
    real = "".join('<div class="gi ph" data-c="real"><span>Реальная работа — фото будет добавлено</span></div>' for _ in range(3))
    items = "".join(f'<figure class="gi {"tall" if i%4==0 else ""}" data-c="{it["cat"]}"><button class="zoom" data-full="{p}images/web/{it["img"]:02d}.webp" data-alt="{html.escape(ALT[it["img"]])}" aria-label="Увеличить">{img(it["img"],p,"(min-width:900px) 25vw,50vw")}</button><figcaption>Иллюстрация · {CATS[it["cat"]]}</figcaption></figure>' for i, it in enumerate(PORTFOLIO))
    body = head("Портфолио", "Галерея <em>работ</em>", "Реальные работы мастера будут добавлены. Пока показаны иллюстрации услуг.", None, p, False) + \
        f'<section class="sec"><div class="w"><div class="filters" role="group" aria-label="Категории">{fl}</div><div class="gal">{real}{items}</div><p class="note">Изображения с подписью «Иллюстрация» — не реальные работы Алены.</p></div></section>' + cta(p)
    page("portfolio/index.html", "Портфолио — CHUPROVA BEAUTY", "Галерея работ и иллюстраций услуг CHUPROVA BEAUTY.", "portfolio", body, 1, 6)

# ---------- РАСПИСАНИЕ ----------
def schedule():
    p = "../"
    cards = "".join(f'<article class="tcard rv"><div class="tag">Демо</div><h3>{c["city"]}</h3><p>{c["dates"]}<br>{c["place"]}<br>{c["status"]}</p>{btn("Записаться", p+"contacts/index.html#form","o")}</article>' for c in CITIES)
    body = head("Города и расписание", "Мастер в <em>разъездах</em>", "Алена работает в разных городах и арендует рабочие места в салонах и коворкингах.", 21, p) + f'<section class="sec"><div class="w"><div class="tgrid">{cards}</div><p class="note">Все данные временные, это не реальные поездки.</p><div class="btns" style="margin-top:20px">{btn("Стать моделью", p+"models/index.html","o")}{btn("Обучение", p+"education/index.html","o")}</div></div></section>' + cta(p)
    page("schedule/index.html", "Города и расписание — CHUPROVA BEAUTY", "Ближайшие города и даты работы мастера CHUPROVA BEAUTY.", "schedule", body, 1, 21)

# ---------- КОНТАКТЫ ----------
def contacts():
    p = "../"
    tabs = '<div class="tabs" role="tablist"><button class="on" data-t="s">На услугу</button><button data-t="e">На обучение</button><button data-t="m">Наставничество</button></div>'
    forms = f'<div data-p="s">{form("service",p)}</div><div data-p="e" hidden>{form("edu",p)}</div><div data-p="m" hidden>{form("mentor",p)}</div>'
    body = head("Контакты", "Записаться <em>к мастеру</em>", "Оставьте заявку на услугу, обучение или наставничество.", None, p, False) + f'''<section class="sec" id="form"><div class="w two"><div class="rv"><h2>Контактные данные</h2><ul class="cl"><li>Телефон: будет добавлен</li></ul><h3 style="margin:8px 0 12px">Мессенджеры и соцсети</h3>{socials(p, True)}<p class="note">Ссылки будут добавлены, пока это заглушки.</p>
<div class="btns">{btn("Услуги", p+"services/index.html","o")}{btn("Обучение", p+"education/index.html","o")}{btn("Стать моделью", p+"models/index.html","o")}</div>{img(21,p,"(min-width:900px) 40vw,100vw")}</div><div class="rv">{tabs}{forms}</div></div></section>'''
    page("contacts/index.html", "Контакты и запись — CHUPROVA BEAUTY", "Запись на услуги, обучение и наставничество.", "contacts", body, 1, 21)

for f in (home, services, education, courses, models, mentorship, about, portfolio, schedule, contacts): f()
print("OK")
