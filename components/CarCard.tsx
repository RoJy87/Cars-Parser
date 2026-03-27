"use client";

import { useState } from "react";
import Image from "next/image";
import InquiryForm from "./InquiryForm";

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

interface CarCardProps {
  car: Car;
}

export default function CarCard({ car }: CarCardProps) {
  const [showForm, setShowForm] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price) + " ₩";
  };

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat("ko-KR").format(mileage) + " km";
  };

  const carName = `${car.brand} ${car.model} (${car.year})`;

  return (
    <>
      <div className='bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group'>
        {/* Image */}
        <div className='relative h-48 overflow-hidden bg-gray-100'>
          {!imageError && car.imageUrl ? (
            <Image
              src={car.imageUrl}
              alt={carName}
              fill
              sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'
              className='object-cover group-hover:scale-105 transition-transform duration-300'
              onError={() => setImageError(true)}
              loading='eager'
            />
          ) : (
            <div className='w-full h-full flex items-center justify-center text-gray-400'>
              <svg className='w-16 h-16' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={1.5}
                  d='M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z'
                />
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={1.5}
                  d='M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0'
                />
              </svg>
            </div>
          )}
          <div className='absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold'>
            {formatPrice(car.price)}
          </div>
        </div>

        {/* Content */}
        <div className='p-5'>
          <h3 className='text-lg font-bold text-gray-900 mb-3 truncate'>{carName}</h3>

          <div className='flex items-center justify-between mb-4 text-sm text-gray-600'>
            <div className='flex items-center gap-2'>
              <svg
                className='w-4 h-4 inline-block align-middle text-blue-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                />
              </svg>
              <span className='align-middle leading-none'>{car.year}</span>
            </div>
            <div className='flex items-center gap-2'>
              <svg
                className='w-4 h-4 inline-block align-middle text-blue-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 10V3L4 14h7v7l9-11h-7z' />
              </svg>
              <span className='align-middle leading-none'>{formatMileage(car.mileage)}</span>
            </div>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className='w-full bg-linear-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform-gpu hover:scale-[1.02] will-change-transform'>
            Оставить заявку
          </button>
        </div>
      </div>

      {showForm && <InquiryForm carName={carName} onClose={() => setShowForm(false)} />}
    </>
  );
}
