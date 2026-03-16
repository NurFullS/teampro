'use client'

import api from '@/app/api/api'
import { UserT } from '@/app/types/user'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

const Page = () => {
    const params = useParams()
    const rawEmail = params.email as string
    const email = decodeURIComponent(rawEmail)

    const [user, setUser] = useState<UserT | null>(null)

    useEffect(() => {
        if (!email) return

        const fetch = async () => {
            try {
                const res = await api.get(`/user/by-email/${email}`)
                setUser(res.data)
            } catch {
                console.error("Ошибка при выводе данных")
            }
        }

        fetch()
    }, [email])

    const getStatusProps = (status: string) => {
        switch (status) {
            case 'working': return { text: 'Работает', color: 'bg-green-200 text-green-800' }
            case 'progress': return { text: 'В прогрессе', color: 'bg-yellow-200 text-yellow-800' }
            case 'stopped': return { text: 'Не работает', color: 'bg-red-200 text-red-800' }
            default: return { text: 'Неизвестно', color: 'bg-gray-200 text-gray-800' }
        }
    }

    if (!user) {
        return <div className="p-10 text-center">Загрузка...</div>
    }

    const status = getStatusProps(user.userStatus)

    return (
        <div className="p-10">
            <p>Email: {user.email}</p>
            <p>Username: {user.username}</p>
            <p>Role: {user.role}</p>
            <strong className={`px-2 py-1 rounded ${status.color}`}>
                {status.text}
            </strong>
        </div>
    )
}

export default Page