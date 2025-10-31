'use client'

import Image from 'next/image'
import mainPreview from '@/public/Ms-Teams-best-for-project-management-1024x683-removebg-preview.png'
import { useRouter } from 'next/navigation'
import api from '../api/api'
import { UserT } from '../types/user'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const Main = () => {
  const router = useRouter()
  const [user, setUser] = useState<UserT | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/user/me')
        setUser(res.data)
      } catch (error) {
        toast.error('Не удалось загрузить данные пользователя', { position: 'top-center' })
      }
    }

    fetchUser()
  }, [])

  if (!user) return <p className="text-center mt-10">Загрузка...</p>

  return (
    <div className="flex flex-col items-center text-center mt-16 px-4">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">
        Добро пожаловать, {user.username || 'пользователь'}!
      </h1>
      <p className="text-gray-600 max-w-2xl mb-10">
        Это ваша рабочая панель. Здесь вы можете управлять своими проектами, следить за задачами
        и взаимодействовать с командой. Мы поможем вам оставаться организованным и эффективным 💪
      </p>

          {user.role === 'teamlead' ? (
            <button
              onClick={() => router.push('/projects')}
              className="bg-blue-600 hover:bg-blue-700 transition-colors p-3 px-4 text-white shadow-md cursor-pointer rounded-2xl"
            >
              Начать работу
            </button>
          ) : (
            <button
              onClick={() => router.push('/projects')}
              className="bg-green-600 hover:bg-green-700 transition-colors p-3 text-white shadow-md cursor-pointer rounded-2xl"
            >
              Перейти к задачам
            </button>
          )}
      <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-10 w-full max-w-5xl">
        <div className="flex flex-col items-center md:items-start">
          <h2 className="text-xl font-semibold mb-3 text-blue-700">
            Ваш путь к успешной работе начинается здесь 🚀
          </h2>
          <p className="text-gray-500 mb-6">
            Используйте платформу, чтобы планировать, отслеживать прогресс и управлять задачами команды.
          </p>

        </div>

        <Image
          src={mainPreview}
          alt="Главная иллюстрация"
          className="w-full h-auto max-w-md"
          priority
        />
      </div>
    </div>
  )
}

export default Main
