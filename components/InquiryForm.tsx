"use client";

import { useState } from "react";

interface InquiryFormProps {
  carName: string;
  onClose: () => void;
}

export default function InquiryForm({ carName, onClose }: InquiryFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    // Здесь можно добавить отправку на сервер
    console.log("Form submitted:", { carName, ...formData });
    setSubmitted(true);
    setTimeout(() => onClose(), 2000);
  };

  return (
    <div className='fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200'>
        <button onClick={onClose} className='absolute top-4 right-4 text-gray-400 hover:text-gray-600'>
          ✕
        </button>

        {!submitted ? (
          <>
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>Заявка на автомобиль</h2>
            <p className='text-gray-600 mb-6'>{carName}</p>

            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Имя *</label>
                <input
                  type='text'
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-400'
                  placeholder='Ваше имя'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Телефон *</label>
                <input
                  type='tel'
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-400'
                  placeholder='+7 (___) ___-__-__'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Email</label>
                <input
                  type='email'
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-400'
                  placeholder='example@mail.com'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Сообщение</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-400'
                  rows={3}
                  placeholder='Дополнительная информация...'
                />
              </div>

              <button
                type='submit'
                className='w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors'>
                Отправить заявку
              </button>
            </form>
          </>
        ) : (
          <div className='text-center py-8'>
            <div className='text-5xl mb-4'>✅</div>
            <h3 className='text-xl font-bold text-gray-900 mb-2'>Заявка отправлена!</h3>
            <p className='text-gray-600'>Мы свяжемся с вами в ближайшее время</p>
          </div>
        )}
      </div>
    </div>
  );
}
