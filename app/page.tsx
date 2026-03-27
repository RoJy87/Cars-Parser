"use client";

import { useEffect, useMemo, useState } from "react";
import CarCard from "@/components/CarCard";

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

const PAGE_SIZE = 20;

export default function Home() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch("/api/cars")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch cars");
        return res.json();
      })
      .then((data) => {
        setCars(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const totalPages = Math.max(1, Math.ceil(cars.length / PAGE_SIZE));

  const currentCars = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return cars.slice(start, start + PAGE_SIZE);
  }, [cars, page]);

  const handlePage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100'>
      {/* Header */}
      <header className='bg-white shadow-sm sticky top-0 z-40'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between h-auto sm:h-16 py-4 gap-4'>
            <div className='flex items-center gap-2'>
              <svg className='w-8 h-8 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z'
                />
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0'
                />
              </svg>
              <span className='text-xl font-bold text-gray-900'>ENCAR Inventory</span>
            </div>
            <p className='text-sm text-gray-500'>
              {loading ? "Загрузка автомобилей..." : `${cars.length} найдено · Страница ${page} из ${totalPages}`}
            </p>
          </div>
        </div>
      </header>

      <section className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
        {error && <div className='rounded-xl bg-red-50 border border-red-100 p-4 text-red-700'>Ошибка: {error}</div>}

        {loading && !error ? (
          <div className='py-16 text-center text-gray-500'>Загрузка...</div>
        ) : (
          <>
            <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
              {currentCars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>

            <div className='mt-8 flex flex-wrap items-center justify-center gap-2'>
              <button
                className='px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-50'
                onClick={() => handlePage(page - 1)}
                disabled={page === 1}>
                Назад
              </button>

              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => handlePage(num)}
                  className={`px-3 py-2 rounded-lg border ${num === page ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"}`}>
                  {num}
                </button>
              ))}

              <button
                className='px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-50'
                onClick={() => handlePage(page + 1)}
                disabled={page === totalPages}>
                Вперед
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
