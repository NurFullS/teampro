'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from './features/Header'
import Main from './features/Main'
import api from './api/api'

const Page = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await api.get('/user/me', { withCredentials: true })
        if (!res.data || res.data == null) {
          router.replace('/accounts/login')
        } else {
          setLoading(false)
        }
      } catch (error) {
        router.replace('/accounts/login')
      }
    }

    checkUser()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-lg">Проверка авторизации...</p>
      </div>
    )
  }

  return (
    <>
      <Header />
      <Main />
    </>
  )
}

export default Page
