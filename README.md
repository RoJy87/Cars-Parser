# ENCARS Cars Parser

Парсинг автомобилей с encar.com и лендинг для просмотра.

## Структура

```
encar-cars/
├── app/                    # Next.js приложение
│   ├── api/cars/route.ts   # API для получения авто
│   ├── layout.tsx          # Layout
│   └── page.tsx            # Главная страница
├── components/             # React компоненты
│   ├── CarCard.tsx         # Карточка авто
│   └── InquiryForm.tsx     # Форма заявки
├── scripts/
│   └── parser.ts           # Скрипт парсинга
├── data/                   # Данные (создаётся автоматически)
│   ├── cars.db             # SQLite база
│   └── cars.json           # JSON экспорт
└── .github/workflows/
    └── parse-daily.yml     # Cron для автообновления
```

## Запуск

### 1. Установка зависимостей

```bash
npm install
```

### 2. Запуск парсера

```bash
npm run parse
```

Спарсит ~100 автомобилей с encar.com и сохранит в `data/cars.db` и `data/cars.json`.

### 3. Запуск frontend

```bash
npm run dev
```

Откройте http://localhost:3000

## Деплой на Vercel

1. Запушите код на GitHub
2. Импортируйте проект в [Vercel](https://vercel.com)
3. Включите **Edge Functions** (для API routes)

**Важно:** Для работы API нужно загрузить файл `data/cars.db` или настроить его генерацию при сборке.

## Автообновление данных

GitHub Actions запускает парсер каждый день в 00:00 UTC:

- Данные коммитятся в репозиторий
- Vercel автоматически пересобирает проект

Для ручного запуска: GitHub → Actions → "Parse ENCARS Daily" → "Run workflow"

## Технологии

- **Next.js 15** — React фреймворк
- **TypeScript** — типизация
- **Tailwind CSS** — стили
- **Playwright** — парсинг
- **better-sqlite3** — база данных
- **GitHub Actions** — планировщик
