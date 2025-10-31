'use client'

import React from 'react'
import { useForm, FieldValues } from 'react-hook-form'
import api from '@/app/api/api'
import toast, { Toaster } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

const Page = () => {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FieldValues>()

  const onSubmit = async (data: FieldValues) => {
    try {
      const response = await api.post('/auth/login', data)
      reset()
      router.push('/')
    } catch (error: any) {
      if (error.response) {
        toast.error(error.response.data?.message || 'Ошибка при входе', { position: 'top-center', duration: 4000 })
      } else {
        toast.error('Сервер недоступен или ошибка сети', { position: 'top-center', duration: 4000 })
      }
    }
  }

  return (
    <div className="p-4 flex justify-center items-center min-h-screen">
      <Toaster />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-3 max-w-sm w-full p-4 rounded shadow"
      >
        <h2 className="text-2xl font-bold text-center mb-2">Войдите в аккаунт</h2>
        <input
          type="text"
          placeholder="Email"
          {...register('email', {
            required: 'Введите email',
            pattern: {
              value: /^[a-zA-Z0-9._%+-]+@gmail\.com$/,
              message: 'Введите корректный Gmail адрес',
            },
          })}
          className="border p-2 rounded border-gray-400 outline-none focus:border-blue-500"
        />
        {errors.email && <span className="text-red-500 text-sm">{String(errors.email?.message)}</span>}
        <input
          type="password"
          placeholder="Пароль"
          {...register('password', {
            required: 'Введите пароль',
            minLength: { value: 6, message: 'Пароль должен быть больше 6 символов' },
          })}
          className="border p-2 rounded border-gray-400 outline-none focus:border-blue-500"
        />
        {errors.password && <span className="text-red-500 text-sm">{String(errors.password?.message)}</span>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-500 cursor-pointer text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isSubmitting ? 'Вход...' : 'Войти'}
        </button>

        <div className="text-center">
          <p>
            Нет аккаунта?{' '}
            <a className="text-blue-600 hover:underline" href="/accounts/register">
              Зарегистрироваться
            </a>
          </p>
        </div>
      </form>
    </div>
  )
}

export default Page
