'use client'

import React, { useEffect, useState } from 'react'
import { User } from 'lucide-react'
import api from '../api/api'
import { UserT } from '../types/user'
import toast from 'react-hot-toast'
import Link from 'next/link'

const Header = () => {

    const [user, setUser] = useState<UserT | null>(null)

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get('/user/me')
                setUser(res.data)
            } catch (error) {
                toast.error('Не удалось загрузить данные пользователя', { position: 'top-center' })
            }
        }
        fetch()
    }, [])

    return (
        <header>
            <div className='w-full flex bg-blue-600 shadow-2xl justify-between items-center'>
                <Link href="/">
                    <h1 className='items-center cursor-pointer p-4 text-white text-2xl font-medium'>TeamPro</h1>
                </Link>
                <Link href="/profile">
                    <div className='flex gap-1 p-2 mr-5 shadow-md items-center bg-white rounded-2xl cursor-pointer'>
                        <User className='text-gray-600' />
                        <p>
                            <strong className="font-medium text-lg text-gray-600">{user?.username}</strong>
                        </p>
                    </div>
                </Link>
            </div>
        </header>
    )
}

export default Header