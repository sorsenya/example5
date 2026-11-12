/* Настройки интеграции. Адреса — публичные URL Google Apps Script (секретных ключей в браузере нет). */
window.CB_CONFIG = {
  CONTENT_URL: 'https://script.google.com/macros/s/AKfycbze6eI30ybIYm4vKjvRSx5TMIrkt7ZcrdAaAX1GP45YZWvIzRjRjS8NXBWcdrh_d9YsIw/exec',
  LEADS_URL: 'https://script.google.com/macros/s/AKfycbxh7kzT_uU_kuqY8i7pVevB67FMb71jV_NlVg6RWiak8kAvYHR6TCLxSx4v1Mc6VmmUjQ/exec',
  CACHE_KEY: 'cb:content:v1',
  CACHE_FRESH_MS: 60 * 1000,        // в пределах минуты повторный запрос к таблице не делается
  FETCH_TIMEOUT_MS: 12000,
  SUBMIT_TIMEOUT_MS: 20000,
  CURRENCY_FALLBACK: '₽',           // если в ответе API нет meta.currency

  // Страницы курсов, которые уже есть на сайте (адрес = id курса из API). Остальные курсы открываются на education/course/?id=…
  COURSE_PAGES: ['basics', 'womens-haircuts', 'mens-haircuts', 'combined', 'advanced'],

  // Картинки-заглушки (сгенерированные иллюстрации). В таблице фото услуг/курсов нет, поэтому подбираются по словам.
  SERVICE_IMAGES: [[/стриж/i, 4], [/блонд|осветл/i, 7], [/чёрн|черн/i, 8], [/коррек|исправ/i, 9], [/тониров/i, 20],
                   [/ухо|восстан|spa/i, 10], [/консульт|диагност/i, 11], [/сложн|airtouch|шатуш|балаяж/i, 6], [/окраш/i, 5]],
  SERVICE_IMAGE_DEFAULT: [5, 6, 7, 8, 9, 10],
  COURSE_IMAGES: { basics: 13, 'womens-haircuts': 4, 'mens-haircuts': 15, combined: 14, advanced: 12 },
  COURSE_IMAGE_DEFAULT: 13,
  MODEL_IMAGES: [[/стриж/i, 4], [/чёрн|черн/i, 8], [/блонд/i, 7], [/окраш|техник/i, 6]],
  MODEL_IMAGE_DEFAULT: 12,

  // Временные иллюстрации в портфолио (не реальные работы). Удалите, когда появятся настоящие фото.
  ILLUSTRATIONS: [[4, 'Стрижки'], [5, 'Однотонное'], [6, 'Сложные техники'], [7, 'Тотальный блонд'],
                  [8, 'Выход из чёрного'], [9, 'Коррекция'], [10, 'Уход'], [3, 'Сложные техники'], [1, 'Однотонное']],
  // Папка для настоящих фото портфолио, если в таблице указано имя файла
  PORTFOLIO_DIR: 'images/portfolio/'
};
