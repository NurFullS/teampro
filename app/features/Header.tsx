'use client'

import React, { useEffect, useState } from 'react'
import { User } from 'lucide-react'
import api from '../api/api'
import { UserT } from '../types/user'
import toast from 'react-hot-toast'
import Link from 'next/link'

const Header = () => {
    const [user, setUser] = useState<UserT | null>(null)
    const [status, setStatus] = useState('')

    // Получаем текущего пользователя
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get('/user/me', { withCredentials: true })
                setUser(res.data)
                setStatus(res.data.userStatus || 'working')
            } catch (error) {
                console.log('User not authenticated')
            }
        }
        fetchUser()
    }, [])

    // Обновляем статус на сервере
    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value
        setStatus(newStatus)

        try {
            await api.put(`/user/update-status?status=${newStatus}`, null, { withCredentials: true })
            toast.success('Статус обновлён!', { position: 'top-center' })
            setUser(prev => prev ? { ...prev, userStatus: newStatus } : null)
        } catch (error) {
            toast.error('Не удалось обновить статус', { position: 'top-center' })
        }
    }

    // Цвет текста в зависимости от статуса
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'working': return 'text-green-600'
            case 'progress': return 'text-yellow-600'
            case 'stopped': return 'text-red-600'
            default: return 'text-gray-500'
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'working': return 'Работает'
            case 'progress': return 'В прогрессе'
            case 'stopped': return 'Не работает'
            default: return 'Неизвестно'
        }
    }

    return (
        <header>
            <div className="w-full flex bg-blue-600 shadow-2xl justify-between items-center">
                <Link href="/projects">
                    <h1 className="items-center cursor-pointer p-4 text-white text-2xl font-medium">
                        TeamPro
                    </h1>
                </Link>

                <div className="flex items-center gap-4 mr-5">
                    {user && (
                        <div className="relative group shadow-md">
                            <select
                                value={status}
                                onChange={handleStatusChange}
                                className={`
        appearance-none
        px-4 py-2
        pr-8
        rounded-xl
        bg-white
        text-sm
        font-medium
        cursor-pointer
        shadow-md
        transition-all
        duration-200
        focus:outline-none
        ${status === 'working'
                                        ? 'border-green-400 text-green-600 bg-green-50'
                                        : status === 'progress'
                                            ? 'border-yellow-400 text-yellow-600 bg-yellow-50'
                                            : status === 'stopped'
                                                ? 'border-red-400 text-red-600 bg-red-50'
                                                : 'border-gray-300 text-gray-700 bg-gray-50'
                                    }
      `}
                            >
                                <option value="working" className="text-green-600 font-medium">Работает</option>
                                <option value="progress" className="text-yellow-600 font-medium">В прогрессе</option>
                                <option value="stopped" className="text-red-600 font-medium">Не работает</option>
                            </select>

                            <svg
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none group-hover:text-blue-500 transition-colors"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    )}

                    <Link href="/profile">
                        <div className="flex gap-1 p-2 shadow-md items-center bg-white rounded-2xl cursor-pointer hover:bg-gray-100 transition">
                            <User className="text-gray-600" />
                            <div className="flex flex-col leading-tight">
                                <strong className="font-medium text-gray-600">{user?.username}</strong>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </header>
    )
}

export default Header
