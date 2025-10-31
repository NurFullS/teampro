'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '../api/api'
import toast, { Toaster } from 'react-hot-toast'
import { UserT } from '../types/user'
import { ClipLoader } from 'react-spinners'
import Projects from './projects/Projects'
import DevProjects from './DevProjects'
import Header from '../features/Header'

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<UserT | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/user/me')
        setUser(res.data)
      } catch (err) {
        router.replace('/accounts/login')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [router])

  if (loading) return <div className="flex justify-center items-center h-64">
    <ClipLoader color="#3b82f6" size={50} />
  </div>

  return (
    <>
    <Header />
      {user?.role === 'teamlead' ? <Projects /> : <DevProjects />}
    </>
  )
}

export default Layout
