'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { LogIn } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Project {
  id: number
  name: string
  description: string
  status: string
  ownerUsername: string
  ownerEmail: string
  accessCode: string
}

const DevProjects = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [accessCode, setAccessCode] = useState('')
  const router = useRouter()

  const fetchProjects = async () => {
    try {
      const response = await axios.get<Project[]>(
        'http://localhost:8080/projects/get-projects',
        { withCredentials: true }
      )
      setProjects(response.data)
    } catch (err) {
      toast.error('Ошибка при получении проектов', { position: 'top-center' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const joinProject = async () => {
    if (!projectName || !accessCode)
      return toast.error('Введите название и код проекта')

    try {
      const response = await axios.post(
        'http://localhost:8080/projects/join',
        null,
        {
          params: { projectName, accessCode },
          withCredentials: true
        }
      )
      toast.success(response.data, { position: 'top-center' })
      setProjectName('')
      setAccessCode('')
      setShowModal(false)
      fetchProjects()
    } catch (err: any) {
      if (err.response) {
        const data =
          typeof err.response.data === 'string'
            ? err.response.data
            : JSON.stringify(err.response.data)
        toast.error(data, { position: 'top-center' })
      } else {
        toast.error('Ошибка соединения с сервером', { position: 'top-center' })
      }
    }
  }

  const getStatusProps = (status: string) => {
    switch (status) {
      case 'working':
        return { text: 'Работает', color: 'bg-green-200 text-green-800' }
      case 'progress':
        return { text: 'В прогрессе', color: 'bg-yellow-200 text-yellow-800' }
      case 'stopped':
        return { text: 'Не работает', color: 'bg-red-200 text-red-800' }
      default:
        return { text: 'Неизвестно', color: 'bg-gray-200 text-gray-800' }
    }
  }

  const handleProjectClick = (id: number) => {
    router.push(`/project/${id}`)
  }

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )

  return (
    <div className="border-l p-6 bg-gray-50 flex flex-col">
      <Toaster />

      <div className="flex justify-end mb-6 ">
        <button
          onClick={() => setShowModal(true)}
          className="px-4 flex shadow-xl gap-1 items-center font-medium cursor-pointer py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
        >
          <LogIn /> Присоединиться к проекту
        </button>
      </div>

      <div className="mt-6 flex flex-col items-center cursor-pointer">

        {projects.length === 0 ? (
          <p className="text-gray-600">Вы ещё не подключены ни к одному проекту.</p>
        ) : (
          <div
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl">
            {projects.map((p) => {
              const status = getStatusProps(p.status)
              return (
                <motion.div
                  key={p.id}
                  onClick={() => handleProjectClick(p.id)}
                  className="p-5 flex flex-col border border-gray-300 rounded-xl shadow hover:shadow-lg bg-white transition"
                  whileHover={{ scale: 1.02 }}
                >
                  <h2 className="text-lg font-semibold mb-1 text-gray-800">
                    {p.name}
                  </h2>
                  <p className="text-gray-600 mb-2">{p.description}</p>
                  <p className="text-sm text-gray-500 mb-2">
                    Создатель: {p.ownerUsername} ({p.ownerEmail})
                  </p>
                  <p className="text-sm text-gray-500 mb-2">
                    Код проекта: <span className="font-mono">{p.accessCode}</span>
                  </p>
                  <span
                    className={`px-2 py-1 text-center mt-auto font-medium rounded text-sm ${status.color}`}
                  >
                    {status.text}
                  </span>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 backdrop-blur-sm bg-black/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            ></motion.div>

            <motion.div
              className="relative z-10 bg-white rounded-xl p-6 w-11/12 max-w-md shadow-lg"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <h2 className="text-2xl font-bold mb-4 text-center">
                Присоединиться к проекту
              </h2>

              <input
                type="text"
                placeholder="Название проекта"
                value={projectName}
                maxLength={30}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full p-3 border border-gray-400 rounded mb-4 outline-none focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Код проекта"
                value={accessCode}
                maxLength={20}
                onChange={(e) => setAccessCode(e.target.value)}
                className="w-full p-3 border border-gray-400 rounded mb-6 outline-none focus:border-blue-500"
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 cursor-pointer bg-gray-300 rounded hover:bg-gray-400 transition"
                >
                  Отмена
                </button>
                <button
                  onClick={joinProject}
                  className="px-4 py-2 cursor-pointer bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Присоединиться
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default DevProjects;