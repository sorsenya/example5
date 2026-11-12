#!/usr/bin/env python3
"""Генератор страниц CHUPROVA BEAUTY. Запуск: python3 build.py"""
import os, html
from data import *

ROOT = os.path.dirname(os.path.abspath(__file__))
NAV = [("services","Услуги"),("education","Обучение"),("mentorship","Наставничество"),("models","Стать моделью"),("about","Обо мне"),("portfolio","Портфолио"),("contacts","Контакты")]
FAV = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%2330251F'/%3E%3Ctext x='32' y='43' font-size='32' text-anchor='middle' fill='%23C9A97C' font-family='Georgia'%3ECB%3C/text%3E%3C/svg%3E"

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
    return f'''<footer><div class="w fgrid"><div><div class="logo">CHUPROVA <b>BEAUTY</b></div><p>Личный бренд парикмахера-колориста Алены Артемьевой: стрижки, окрашивания, очное обучение и наставничество.</p></div>
<div><h4>Навигация</h4><ul>{nav}</ul></div><div><h4>Направления</h4><ul>{dirs}</ul></div>
<div><h4>Контакты</h4><ul data-cb="footer-contacts"></ul><div data-cb="socials"></div></div></div>
<div class="w copy">© 2026 CHUPROVA BEAUTY</div></footer>
<div class="lb" id="lb" role="dialog" aria-modal="true" hidden><button class="lbx" aria-label="Закрыть">✕</button><img alt=""><p></p></div>'''

def page(rel, title, desc, active, body, depth, og=None):
    p = "../" * depth
    route = "/" + rel.replace("index.html", "")
    doc = f'''<!DOCTYPE html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title><meta name="description" content="{desc}">
<meta property="og:title" content="{title}"><meta property="og:description" content="{desc}"><meta property="og:type" content="website">
<meta property="og:image" content="{p}images/web/{og or 1:02d}.webp"><link rel="icon" href="{FAV}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Manrope:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{p}style.css"></head><body data-root="{p}" data-route="{route}">
{header(p, active)}<main id="top">{body}</main>{footer(p)}<a class="fab" href="{p}contacts/index.html#form">Записаться</a><script src="{p}js/config.js" defer></script><script src="{p}js/core.js" defer></script><script src="{p}js/render.js" defer></script><script src="{p}js/forms.js" defer></script><script src="{p}script.js" defer></script></body></html>'''
    path = os.path.join(ROOT, rel); os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, "w", encoding="utf-8").write(doc)

def head(tag, h, text="", n=None, p="", dark=True, extra="", h1="", pa=""):
    pic = f'<div class="ph-img">{img(n,p,"(min-width:900px) 45vw,100vw",eager=True)}</div>' if n else ""
    return f'<section class="phead {"dark" if dark else "sand"}"><div class="w pg"><div class="rv"><div class="tag">{tag}</div><h1 {h1}>{h}</h1><p {pa}>{text}</p>{extra}</div>{pic}</div></section>'

def rows(rs): return "".join(f'<li><span>{a}</span><i></i><b>{b}</b></li>' for a, b in rs)

COURSE_PAGES = ["basics", "womens-haircuts", "mens-haircuts", "combined", "advanced"]  # = COURSE_PAGES в js/config.js

# ---------- Формы: единая разметка; отправка — js/forms.js ----------
MESSENGERS = [("", "Не выбрано"), ("any", "Не важно"), ("whatsapp", "WhatsApp"), ("telegram", "Telegram"), ("vk", "ВКонтакте"), ("instagram", "Instagram"), ("phone", "Телефонный звонок")]
NAME_F = ("name", "Имя", "text", 100, True)
CONTACT_F = ("contact", "Контакт (телефон, Telegram или e-mail)", "text", 120, True)
MESS_F = ("messenger", "Предпочтительный мессенджер", "select", 0, False)
CITY_F = ("city", "Город", "text", 80, False)
FORMS = {
    "service": [NAME_F, CONTACT_F, MESS_F, ("service", "Интересующая услуга", "list:dl-services", 150, False), CITY_F, ("desiredDate", "Желаемая дата", "date", 500, False)],
    "education": [NAME_F, CONTACT_F, MESS_F, ("service", "Интересующий курс", "list:dl-courses", 150, False), CITY_F, ("level", "Уровень подготовки", "text", 500, False), ("format", "Предпочтительный формат", "text", 500, False)],
    "mentorship": [NAME_F, CONTACT_F, MESS_F, CITY_F, ("currentLevel", "Текущий уровень", "text", 500, False), ("goals", "Цели обучения", "text", 500, False)],
    "model": [NAME_F, CONTACT_F, MESS_F, ("service", "Интересующая процедура", "list:dl-models", 150, False), CITY_F, ("hairNow", "Длина и текущее состояние волос", "text", 500, False)],
    "other": [NAME_F, CONTACT_F, MESS_F, ("service", "Тема обращения", "text", 150, False), CITY_F],
}
FIXED_SERVICE = {"mentorship": "Наставничество"}

def form(kind):
    out = ""
    for name, label, typ, mx, req in FORMS[kind]:
        star = " *" if req else ""
        r = ' aria-required="true" required' if req else ""
        if typ == "select":
            opts = "".join(f'<option value="{v}">{t}</option>' for v, t in MESSENGERS)
            out += f'<label>{label}<select name="{name}">{opts}</select></label>'
        elif typ.startswith("list:"):
            dl = typ.split(":")[1]
            out += f'<label>{label}<input type="text" name="{name}" maxlength="{mx}" list="{dl}-{kind}" autocomplete="off"><datalist id="{dl}-{kind}" data-cb="{dl}"></datalist></label>'
        else:
            ac = ' autocomplete="name"' if name == "name" else ' autocomplete="off"'
            out += f'<label>{label}{star}<input type="{typ}" name="{name}" maxlength="{mx}"{r}{ac}></label>'
    fixed = f' data-service="{FIXED_SERVICE[kind]}"' if kind in FIXED_SERVICE else ""
    return (f'<form class="form" data-form="{kind}"{fixed} novalidate>{out}<label class="full">Комментарий<textarea rows="3" name="comment" maxlength="1500"></textarea></label>'
            '<div class="hp" aria-hidden="true"><label>Не заполняйте это поле<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>'
            '<button class="btn full" type="submit">Отправить заявку</button><p class="fmsg full" role="alert"></p><p class="fok full" role="status"></p></form>')

def cta(p, text="Готовы к преображению или хотите начать профессиональный путь?", bind=False):
    b = ' data-bind="home.ctaText"' if bind else ""
    return f'<section class="cta"><div class="w"><h2{b}>{text}</h2>{btn("Связаться со мной", url(p,"contacts")+"#form")}</div></section>'

# ---------- ГЛАВНАЯ ----------
def home():
    p = ""
    works = "".join(f'<figure class="rv">{img(n,p,"(min-width:900px) 25vw,50vw")}</figure>' for n in (3, 8, 9, 5))
    body = f'''<section class="hero"><div class="w hg"><div class="rv"><div class="chips"><span>HAIR ARTIST</span><span>COLOR EXPERT</span><span>EDUCATION</span></div>
<h1 data-bind="home.heroTitle" data-rich>Искусство преображения <em>волос</em> и профессионального развития</h1><p data-bind="home.heroSubtitle">Стрижки, окрашивания и обучение парикмахерскому искусству.</p>
<div class="btns"><a class="btn" href="services/index.html" data-bind-text="home.button1Text" data-bind-href="home.button1Url">Услуги мастера</a><a class="btn o" href="education/index.html" data-bind-text="home.button2Text" data-bind-href="home.button2Url">Обучение</a></div></div>
<div class="col">{img(22,p,"(min-width:900px) 30vw,90vw","c1",True,"42% 30%")}{img(2,p,"(min-width:900px) 22vw,50vw","c2")}{img(3,p,"20vw","c3","","50% 20%")}<div class="cap"><b data-bind="about.name">Алена Артемьева</b><span>парикмахер-колорист · наставник</span></div></div></div></section>
<section class="sec"><div class="w intro"><div class="pic rv">{img(22,p,"(min-width:900px) 40vw,100vw","","","50% 25%")}</div><div class="rv"><div class="tag">Знакомство</div><h2 data-bind="about.name">Алена Артемьева</h2>
<p class="prof" data-bind="about.profession" data-hide-empty hidden></p><p data-bind="home.aboutShort" data-hide-empty hidden></p><ul class="tl bnf" data-cb="home-benefits"></ul>{btn("Обо мне","about/index.html","o")}</div></div></section>
<section class="dirs"><a class="dir" href="services/index.html">{img(6,p,"(min-width:900px) 50vw,100vw","","","50% 30%")}<div><div class="tag">01</div><h2>Услуги мастера</h2><p data-card="0">Стрижки, окрашивания, сложные техники, восстановление и уход.</p><span class="btn">Посмотреть услуги</span></div></a>
<a class="dir" href="education/index.html">{img(14,p,"(min-width:900px) 50vw,100vw")}<div><div class="tag">02</div><h2>Обучение</h2><p data-card="1">Курсы для начинающих и действующих мастеров и наставничество.</p><span class="btn">Выбрать обучение</span></div></a></section>
<section class="sec sand"><div class="w"><div class="head rv"><div><div class="tag">Популярные услуги</div><h2>Каталог <em>мастера</em></h2></div>{btn("Весь прайс","services/index.html","o")}</div><div class="pops" data-cb="home-services"></div></div></section>
<section class="sec dark"><div class="w"><div class="head rv"><div><div class="tag">Избранное</div><h2>Иллюстрации <em>услуг</em></h2></div>{btn("Портфолио","portfolio/index.html")}</div><div class="strip">{works}</div><p class="note">Это иллюстративные изображения, а не реальные работы. Реальные фото появятся в портфолио.</p></div></section>
<section class="sec carm"><div class="w edu"><div class="rv">{img(13,p,"(min-width:900px) 55vw,100vw")}</div><div class="rv"><div class="tag">Обучение</div><h2>Очные программы для <em>мастеров</em></h2><p>Программы для начинающих и действующих мастеров.</p><div class="chipnav" data-cb="home-courses"></div>{btn("Все программы","education/index.html")}</div></div></section>
<section class="ment"><div class="mimg">{img(16,p,"(min-width:900px) 50vw,100vw","","","50% 40%")}</div><div class="mtxt rv"><div class="tag">Premium · индивидуально</div><h2>Наставничество: путь к <em>профессии</em></h2><p>Индивидуальная помощь в профессиональном становлении под ваши цели.</p>{btn("Узнать больше","mentorship/index.html")}</div></section>
<section class="sec"><div class="w edu m2"><div class="rv"><div class="tag">Для моделей</div><h2>Стать <em>моделью</em></h2><p>Мастеру нужны модели для отработки техник и обучения. Посмотрите предстоящие работы.</p>{btn("Стать моделью","models/index.html")}</div><div class="rv">{img(12,p,"(min-width:900px) 55vw,100vw")}</div></div></section>
<section class="sec deep"><div class="w"><div class="head rv"><div><div class="tag">Города и даты</div><h2>Где принимает <em>мастер</em></h2></div>{btn("Расписание","schedule/index.html","o")}</div><div data-cb="home-schedule"></div></div></section>
<section class="sec sand"><div class="w"><div class="tag">Отзывы</div><h2 class="rv">Клиенты и <em>ученики</em></h2><div class="rev rv"><div><q>Отзыв клиента</q>Заглушка</div><div><q>Отзыв ученика</q>Заглушка</div><div><q>Отзыв клиента</q>Заглушка</div></div></div></section>{cta(p, bind=True)}'''
    page("index.html", "CHUPROVA BEAUTY — стрижки, окрашивание и обучение парикмахеров", "Парикмахер-колорист Алена Артемьева: стрижки, сложные окрашивания, очное обучение и наставничество.", "index", body, 0, 22)

# ---------- УСЛУГИ ----------
def services():
    p = "../"
    body = head("Услуги мастера", "Каталог <em>услуг</em>", "Стрижки, окрашивание, сложные техники, восстановление и диагностика.", 12, p) + \
        f'<section class="sec"><div class="w"><nav class="chipnav" aria-label="Категории" data-cb="services-chips"></nav></div><div class="w feats"><div class="feats" data-cb="services-feats"></div><p class="snote">{SERVICE_NOTE}</p><div class="c">{btn("Записаться", p+"contacts/index.html?type=service#form")} {btn("Участвовать как модель", p+"models/index.html","o")}</div></div></section>'
    page("services/index.html", "Услуги и прайс — CHUPROVA BEAUTY", "Прайс на стрижки, окрашивание, сложные техники, блонд, выход из чёрного и уход.", "services", body, 1, 12)

# ---------- ОБУЧЕНИЕ ----------
def education():
    p = "../"
    body = head("Очное обучение", "Обучение <em>парикмахеров</em>", "Очные программы для начинающих и действующих мастеров.", 13, p) + \
        '<section class="sec"><div class="w"><div class="cgrid" data-cb="education-list"></div></div></section>' + \
        f'<section class="sec carm"><div class="w two"><div class="rv"><div class="tag">Для практики</div><h2>Ищем <em>моделей</em> для обучения</h2></div><div class="rv"><p>Учеников и модели лучше планировать на одни даты. Посмотрите, на какие работы идёт набор.</p>{btn("Стать моделью", p+"models/index.html")}</div></div></section>' + \
        f'<section class="ment"><div class="mimg">{img(15,p,"(min-width:900px) 50vw,100vw")}</div><div class="mtxt rv"><div class="tag">Индивидуально</div><h2>Нужен личный <em>маршрут</em>?</h2><p>Наставничество — отдельная программа под ваши цели, а не обычный курс.</p>{btn("Наставничество", p+"mentorship/index.html")}</div></section>' + cta(p, "Хотите начать профессиональный путь?")
    page("education/index.html", "Обучение парикмахеров — CHUPROVA BEAUTY", "Очное обучение: с нуля, женские и мужские стрижки, комбинированные техники и повышение квалификации.", "education", body, 1, 13)

def courses():
    p = "../../"
    tail = f'<div class="w back"><a href="{p}education/index.html">← Все программы</a></div>' + cta(p, "Готовы записаться на обучение?")
    for cid in COURSE_PAGES + ["course"]:
        attr = f' data-course-id="{cid}"' if cid != "course" else ""
        page(f"education/{cid}/index.html", "Курс обучения — CHUPROVA BEAUTY", "Очная программа обучения парикмахеров.", "education", f'<div data-cb="course"{attr}></div>' + tail, 2, 13)

# ---------- СТАТЬ МОДЕЛЬЮ ----------
def models():
    p = "../"
    body = head("Для моделей", "Стать <em>моделью</em>", "Для отработки техник и проведения обучения мастеру нужны модели. Вы получаете работу мастера, а ученики практику под наблюдением.", 12, p, True, f'<div class="btns" style="margin-top:22px">{btn("Стать моделью","#apply")}{btn("Все предложения","#offers","o")}</div>') + f'''
<section class="sec" id="offers"><div class="w"><div class="head rv"><div><div class="tag">Предстоящие работы</div><h2>Ищем <em>моделей</em></h2></div></div><div class="mlist" data-cb="models-list"></div></div></section>
<section class="sec dark" data-cb="models-timeline" data-wrapper hidden></section>
<section class="sec sand" id="apply"><div class="w two"><div class="rv"><div class="tag">Заявка</div><h2>Откликнуться <em>моделью</em></h2><p>Расскажите о себе и выберите процедуру. Мастер свяжется с вами.</p></div><div class="rv">{form("model")}</div></div></section>''' + cta(p, "Хотите попробовать работу мастера?")
    page("models/index.html", "Стать моделью — CHUPROVA BEAUTY", "Поиск моделей для стрижек и окрашиваний: предстоящие работы, требования и условия участия.", "models", body, 1, 12)

# ---------- НАСТАВНИЧЕСТВО ----------
def mentorship():
    p = "../"
    body = head("Premium · индивидуально", "Наставничество: путь к <em>профессии</em>", "Не просто техники, а помощь в профессиональном становлении.", 16, p, True, "", 'data-bind="mentorship.title" data-rich') + \
        f'''<div data-cb="mentorship-body"></div>
<section class="sec sand" id="form"><div class="w two"><div class="rv"><div class="tag">Заявка</div><h2>Расскажите о своих <em>целях</em></h2><p>Индивидуальный подход: программа формируется под вас.</p><div data-bind-paras="mentorship.howToApply" hidden></div></div><div class="rv">{form("mentorship")}</div></div></section>''' + cta(p, "Хотите обсудить наставничество?")
    page("mentorship/index.html", "Наставничество для парикмахеров — CHUPROVA BEAUTY", "Индивидуальное наставничество: практика, клиенты, цены, развитие собственного дела.", "mentorship", body, 1, 16)

# ---------- ОБО МНЕ ----------
def about():
    p = "../"
    body = f'''<section class="phead sand"><div class="w pg"><div class="rv"><div class="tag">Обо мне</div><h1 data-bind="about.name" data-rich>Алена Артемьева</h1><p data-bind="about.profession">Парикмахер, колорист, преподаватель и наставник. Автор бренда CHUPROVA BEAUTY.</p></div><div class="ph-img sq">{img(22,p,"(min-width:900px) 40vw,100vw","",True,"50% 25%")}</div></div></section>
<section class="sec"><div class="w" data-cb="about-body"></div></section>
<section class="sec dark"><div class="w two"><div class="rv">{img(18,p,"(min-width:900px) 50vw,100vw")}</div><div class="rv"><div class="tag">Рабочее пространство</div><h2>Как выглядит <em>работа</em></h2><p>Иллюстрация рабочего места. Реальные фото процесса будут добавлены.</p><div class="btns">{btn("Услуги", p+"services/index.html")}{btn("Обучение", p+"education/index.html","o")}</div></div></div></section>''' + cta(p)
    page("about/index.html", "Алена Артемьева — парикмахер-колорист, CHUPROVA BEAUTY", "Личная страница Алены Артемьевой: парикмахер, колорист, преподаватель и наставник.", "about", body, 1, 22)

# ---------- ПОРТФОЛИО ----------
def portfolio():
    p = "../"
    body = head("Портфолио", "Галерея <em>работ</em>", "Реальные работы мастера из таблицы и временные иллюстрации услуг.", None, p, False) + \
        '<section class="sec"><div class="w"><div data-cb="portfolio"></div><p class="note">Изображения с подписью «Иллюстрация» — не реальные работы Алены.</p></div></section>' + cta(p)
    page("portfolio/index.html", "Портфолио — CHUPROVA BEAUTY", "Галерея работ и иллюстраций услуг CHUPROVA BEAUTY.", "portfolio", body, 1, 6)

# ---------- РАСПИСАНИЕ ----------
def schedule():
    p = "../"
    body = head("Города и расписание", "Мастер в <em>разъездах</em>", "Алена работает в разных городах и арендует рабочие места в салонах и коворкингах.", 21, p) + \
        f'<section class="sec"><div class="w"><div data-cb="schedule-list"></div><div class="btns" style="margin-top:28px">{btn("Стать моделью", p+"models/index.html","o")}{btn("Обучение", p+"education/index.html","o")}</div></div></section>' + cta(p)
    page("schedule/index.html", "Города и расписание — CHUPROVA BEAUTY", "Ближайшие города и даты работы мастера CHUPROVA BEAUTY.", "schedule", body, 1, 21)

# ---------- КОНТАКТЫ ----------
def contacts():
    p = "../"
    tabs = '<div class="tabs" role="tablist">' + "".join(f'<button type="button" class="{"on" if k=="service" else ""}" data-t="{k}">{t}</button>' for k, t in (("service", "На услугу"), ("education", "На обучение"), ("mentorship", "Наставничество"), ("other", "Другой вопрос"))) + '</div>'
    forms = "".join(f'<div data-p="{k}"{"" if k=="service" else " hidden"}>{form(k)}</div>' for k in ("service", "education", "mentorship", "other"))
    body = head("Контакты", "Записаться <em>к мастеру</em>", "Оставьте заявку на услугу, обучение или наставничество.", None, p, False) + f'''<section class="sec" id="form"><div class="w two"><div class="rv"><h2>Контактные данные</h2><div data-cb="contacts-info" style="margin-top:16px"></div>
<div class="btns" style="margin-top:24px">{btn("Услуги", p+"services/index.html","o")}{btn("Обучение", p+"education/index.html","o")}{btn("Стать моделью", p+"models/index.html","o")}</div>{img(21,p,"(min-width:900px) 40vw,100vw")}</div><div class="rv">{tabs}{forms}</div></div></section>'''
    page("contacts/index.html", "Контакты и запись — CHUPROVA BEAUTY", "Запись на услуги, обучение и наставничество.", "contacts", body, 1, 21)

for f in (home, services, education, courses, models, mentorship, about, portfolio, schedule, contacts): f()
print("OK")
