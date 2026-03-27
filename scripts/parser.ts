import { chromium, Browser, Page } from "playwright";
import Database from "better-sqlite3";
import * as path from "path";
import * as fs from "fs";

type DatabaseType = Database.Database;

const DB_PATH = path.join(__dirname, "..", "data", "cars.db");
const JSON_PATH = path.join(__dirname, "..", "data", "cars.json");

interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  imageUrl: string;
  url: string;
  createdAt: string;
}

function initDatabase(): DatabaseType {
  const db = new Database(DB_PATH);

  db.exec(`
    CREATE TABLE IF NOT EXISTS cars (
      id TEXT PRIMARY KEY,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      year INTEGER NOT NULL,
      mileage INTEGER NOT NULL,
      price INTEGER NOT NULL,
      imageUrl TEXT,
      url TEXT UNIQUE,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  return db;
}

async function parseEncarCars(limit: number = 100): Promise<Car[]> {
  const browser: Browser = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
      "--disable-dev-shm-usage",
    ],
  });

  const cars: Car[] = [];

  try {
    const page: Page = await browser.newPage();

    await page.setExtraHTTPHeaders({
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    });

    await page.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    });

    await page.setViewportSize({ width: 1920, height: 1080 });

    console.log("Переход на страницы каталога...");

    let pageNum = 1;
    while (cars.length < limit) {
      const url = `https://www.encar.com/dc/dc_carsearchlist.do?carType=kor&page=${pageNum}`;
      console.log(`Парсинг страницы ${pageNum}: ${url}`);

      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 90000,
      });

      console.log("Страница загружена, ждём контент...");

      try {
        await page.waitForSelector("tr[data-index]", {
          timeout: 45000,
        });
        console.log("Таблица с авто найдена");
      } catch (e) {
        console.log("Таймаут ожидания таблицы, возможно, конец страниц", e);
        break;
      }

      await page.waitForTimeout(3000);

      const carRows = await page.$$("tr[data-index]");
      console.log(`Найдено автомобилей на странице ${pageNum}: ${carRows.length}`);

      if (carRows.length === 0) {
        console.log("Нет автомобилей на странице, конец");
        break;
      }

      for (let i = 0; i < carRows.length && cars.length < limit; i++) {
        try {
          const row = carRows[i];

          await row.scrollIntoViewIfNeeded();
          await page.waitForTimeout(500);

          const carData = await row.evaluate(function parseCar(tr) {
            // Бренд и модель
            const brandEl = tr.querySelector(".cls strong");
            const modelEl = tr.querySelector(".cls em");
            const brand = brandEl ? brandEl.textContent.trim() : "";
            const model = modelEl ? modelEl.textContent.trim() : "";

            // Детали модели
            const detailEl = tr.querySelector(".dtl strong");
            const detailModel = detailEl ? detailEl.textContent.trim() : "";
            const fullModel = model + (detailModel ? " " + detailModel : "");

            // Год из .yer (формат: 21/10식 или 22년형)
            const yerEl = tr.querySelector(".yer");
            const yerText = yerEl ? yerEl.textContent.trim() : "";
            const yearMatch = yerText.match(/(\d{2})년/) || yerText.match(/(\d{2})\//);
            const year = yearMatch ? parseInt("20" + yearMatch[1]) : 0;

            // Пробег из .km (формат: · 67,466km)
            const kmEl = tr.querySelector(".km");
            const kmText = kmEl ? kmEl.textContent.trim() : "";
            const kmClean = kmText.replace(/[^0-9]/g, "");
            const mileage = kmClean ? parseInt(kmClean) : 0;

            // Цена из .prc (формат: 2,449 - в манвонах)
            const prcEl = tr.querySelector(".prc");
            const priceText = prcEl ? prcEl.textContent.trim() : "";
            const priceClean = priceText.replace(/[^0-9]/g, "");
            const priceNum = priceClean ? parseInt(priceClean) * 10000 : 0;

            // Изображение
            const imgEl = tr.querySelector("img.thumb");
            let imageUrl = imgEl ? imgEl.getAttribute("data-src") || imgEl.getAttribute("src") || "" : "";
            if (imageUrl && !imageUrl.startsWith("http")) {
              imageUrl = "https://www.encar.com" + imageUrl;
            }

            // Ссылка
            const linkEl = tr.querySelector("a.newLink");
            const href = linkEl ? linkEl.getAttribute("href") || "" : "";
            const url = href.startsWith("http") ? href : "https://www.encar.com" + href;

            return {
              brand: brand,
              model: fullModel,
              year: year,
              mileage: mileage,
              price: priceNum,
              imageUrl: imageUrl,
              url: url,
            };
          });

          if (carData.brand && carData.price > 0) {
            cars.push({
              ...carData,
              id: `${carData.brand}-${carData.model}-${carData.year}-${Date.now()}-${i}`,
              createdAt: new Date().toISOString(),
            });
            console.log(`✓ Спаршено: ${carData.brand} ${carData.model} (${carData.year}) - ${carData.price} ₩`);
          }
        } catch (err) {
          console.error(`Ошибка при парсинге элемента ${i}:`, err);
        }
      }

      pageNum++;
      console.log(`Спаршено машин всего: ${cars.length}`);
    }

    console.log(`Парсинг завершён, спаршено ${cars.length} машин с ${pageNum - 1} страниц`);
  } catch (error) {
    console.error("Ошибка при парсинге:", error);
  } finally {
    await browser.close();
  }

  return cars;
}

function saveToDatabase(db: DatabaseType, cars: Car[]) {
  const insert = db.prepare(`
    INSERT OR REPLACE INTO cars (id, brand, model, year, mileage, price, imageUrl, url, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((cars: Car[]) => {
    for (const car of cars) {
      insert.run(car.id, car.brand, car.model, car.year, car.mileage, car.price, car.imageUrl, car.url, car.createdAt);
    }
  });

  insertMany(cars);
}

function saveToJson(cars: Car[]) {
  fs.writeFileSync(JSON_PATH, JSON.stringify(cars, null, 2), "utf-8");
}

async function main() {
  console.log("🚀 Запуск парсера ENCARS...");

  const dataDir = path.join(__dirname, "..", "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const db = initDatabase();

  // Проверка последнего обновления
  const lastUpdate = db.prepare("SELECT MAX(createdAt) as last FROM cars").get() as { last: string | null };
  if (lastUpdate.last) {
    const lastTime = new Date(lastUpdate.last).getTime();
    const now = Date.now();
    const hoursSinceLast = (now - lastTime) / (1000 * 60 * 60);
    if (hoursSinceLast < 24) {
      console.log(`⏰ Последнее обновление было ${hoursSinceLast.toFixed(1)} часов назад. Пропускаем парсинг.`);
      db.close();
      return;
    }
  }

  // Очистка старых данных перед новым парсингом
  db.exec("DELETE FROM cars");

  const cars = await parseEncarCars(100);

  console.log(`📊 Спаршено автомобилей: ${cars.length}`);

  if (cars.length > 0) {
    saveToDatabase(db, cars);
    saveToJson(cars);
    console.log("✅ Данные сохранены в БД и JSON");
  } else {
    console.log("⚠️ Не удалось спарсить данные");
  }

  db.close();
  console.log("🏁 Парсинг завершён");
}

main().catch(console.error);
