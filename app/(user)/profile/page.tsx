'use client'

import api from '@/app/api/api'
import Header from '@/app/features/Header'
import { UserT } from '@/app/types/user'
import React, { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'

const tariffs = [
    { id: 'free', name: 'FREE', description: 'До 5 разработчиков, базовый функционал', maxDevelopers: 5, price: 0 },
    { id: 'pro', name: 'PRO', description: 'До 20 разработчиков, расширенные функции', maxDevelopers: 20, price: 20 },
    { id: 'buisness', name: 'BUISNESS', description: 'До 2000 разработчиков, полный функционал', maxDevelopers: 2000, price: 100 },
]

const Page = () => {
    const [user, setUser] = useState<UserT | null>(null)
    const [form, setForm] = useState<Partial<UserT>>({})
    const [loading, setLoading] = useState(false)
    const [selectedTarif, setSelectedTarif] = useState('')

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get('/user/me')
                setUser(res.data)
                setForm(res.data)
            } catch {
                toast.error('Ошибка при получении данных пользователя')
            }
        }

        fetchUser()
    }, [])

    const handleChange = (field: keyof UserT, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }))
    }

    const handleSave = async (id: number) => {
        if (!user) return
        setLoading(true)
        try {
            const res = await api.put(`/user/${id}/update`, form)
            setUser(res.data)
            setForm(res.data)
            toast.success('Профиль успешно обновлён')
        } catch {
            toast.error('Ошибка при обновлении профиля')
        } finally {
            setLoading(false)
        }
    }

    const handleBuyTarif = async (tarifId: string) => {
        try {
            const res = await api.put(`/user/updateTarif`, { tarifPlane: tarifId }, { withCredentials: true })
            setUser(res.data)
            toast.success(`Тариф "${tariffs.find(t => t.id === tarifId)?.name}" успешно обновлён`)
        } catch {
            toast.error('Ошибка при обновлении тарифного плана')
        }
    }

    return (
        <div>
            <Toaster position="top-center" />
            <Header />
            <div className="flex justify-around flex-wrap">

                <div className="max-w-md w-full mx-10 border border-gray-200 mt-10 bg-white shadow-lg rounded-2xl p-8">
                    <h1 className="text-2xl font-bold text-gray-600 mb-6 text-center">
                        Редактирование профиля
                    </h1>

                    {user ? (
                        <div className="flex flex-col gap-4 text-gray-700">
                            <div className="flex flex-col gap-1">
                                <label className="font-semibold">Имя пользователя:</label>
                                <input
                                    type="text"
                                    value={form.username || ''}
                                    onChange={(e) => handleChange('username', e.target.value)}
                                    className="border border-gray-400 outline-none rounded px-3 py-2 focus:border-blue-500"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="font-semibold">Email:</label>
                                <input
                                    type="email"
                                    value={form.email || ''}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    className="border border-gray-400 outline-none rounded px-3 py-2 focus:border-blue-500"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="font-semibold">Роль:</label>
                                <select
                                    value={form.role || ''}
                                    onChange={(e) => handleChange('role', e.target.value)}
                                    className="border border-gray-400 outline-none rounded px-3 py-2 focus:border-blue-500"
                                >
                                    <option value="teamlead">ТимЛид</option>
                                    <option value="developer">Разработчик</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="font-semibold">Статус:</label>
                                <select
                                    value={form.userStatus || user.userStatus || ''}
                                    onChange={(e) => handleChange('userStatus', e.target.value)}
                                    className="border border-gray-400 outline-none rounded px-3 py-2 focus:border-blue-500"
                                >
                                    <option value="working" className="text-green-600 font-medium">Работает</option>
                                    <option value="progress" className="text-yellow-600 font-medium">В прогрессе</option>
                                    <option value="stopped" className="text-red-600 font-medium">Не работает</option>
                                </select>
                            </div>

                            <div className="flex gap-1">
                                <label className="font-semibold">ID:</label>
                                <strong>{user.id}</strong>
                            </div>

                            <button
                                onClick={() => handleSave(user.id)}
                                disabled={loading}
                                className="mt-4 bg-blue-500 cursor-pointer text-white font-semibold px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                            >
                                {loading ? 'Сохраняем...' : 'Сохранить изменения'}
                            </button>
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 animate-pulse">
                            Загрузка данных...
                        </div>
                    )}
                </div>

                <div className="max-w-4xl mx-auto w-full mt-10 flex flex-wrap gap-6">
                    {user && tariffs.map((t) => (
                        <div key={t.id} className={`flex flex-col justify-between border rounded-2xl shadow-lg p-6 w-70
                            ${user.tarifPlane === t.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}>
                            <h2 className="font-bold text-xl mb-2">{t.name}</h2>
                            <p className="text-gray-700 mb-4">{t.description}</p>
                            <div className='flex gap-1 items0-center justify-center'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="lucide lucide-check h-5 w-5 text-green-400 flex-shrink-0"><path d="M20 6 9 17l-5-5"></path></svg>
                                <p className="text-sm text-gray-500 mb-4">Максимум разработчиков: {t.maxDevelopers}</p>
                            </div>
                            <p className='mt-auto font-bold text-2xl'>Стоимость: <strong className='text-green-600 ml-1'>{t.price}$ </strong> / В месяц</p>
                            <button
                                onClick={() => handleBuyTarif(t.id)}
                                disabled={user.tarifPlane === t.id}
                                className={`mt-auto w-full cursor-pointer px-4 py-2 rounded text-white font-semibold
                                    ${user.tarifPlane === t.id ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
                            >
                                {user.tarifPlane === t.id ? 'Текущий тариф' : 'Купить'}
                            </button>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    )
}

export default Page
