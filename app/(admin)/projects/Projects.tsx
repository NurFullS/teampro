'use client'

import React, { useEffect, useState, useRef } from 'react'
import api from '../../api/api'
import toast, { Toaster } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

const Projects = () => {
    const [projects, setProjects] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [newProjectName, setNewProjectName] = useState('')
    const [newProjectDesc, setNewProjectDesc] = useState('')
    const [selectedStatus, setSelectedStatus] = useState('working')
    const toastShown = useRef(false)

    // Получение проектов пользователя
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await api.get('/projects/get-projects', { withCredentials: true })
                setProjects(res.data)
            } catch (err: any) {
                if (!toastShown.current) {
                    toast.error('У вас пока что нет проектов', { position: 'top-center', duration: 3000 })
                    toastShown.current = true
                }
            } finally {
                setLoading(false)
            }
        }

        fetchProjects()
    }, [])

    // Создание проекта
    const handleCreateProject = async () => {
        if (!newProjectName) return toast.error('Введите название проекта')

        try {
            const res = await api.post(
                '/projects',
                {
                    name: newProjectName,
                    description: newProjectDesc,
                    status: selectedStatus,
                },
                { withCredentials: true } // cookie автоматически отправляется
            )

            setProjects([...projects, res.data])
            toast.success('Проект создан!', { position: 'top-center', duration: 2000 })
            setShowModal(false)
            setNewProjectName('')
            setNewProjectDesc('')
            setSelectedStatus('working')
        } catch (err) {
            toast.error('Не удалось создать проект', { position: 'top-center', duration: 3000 })
        }
    }

    if (loading)
        return (
            <div className="flex justify-center items-center h-64">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )

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

    return (
        <div className="border-l p-6 bg-gray-50 relative min-h-screen">
            <Toaster />

            {/* Кнопка создания проекта */}
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                >
                    Создать проект
                </button>
            </div>

            {/* Список проектов */}
            {projects.length === 0 && (
                <div className="text-center mt-20">
                    <p className="text-lg mb-4 text-gray-700">У вас пока что нет проектов!</p>
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
                {projects.map((project: any, index: number) => {
                    const status = getStatusProps(project.status)
                    return (
                        <div key={project.id || index} className="p-5 border rounded-xl shadow hover:shadow-lg transition bg-white">
                            <h2 className="text-xl font-semibold mb-2 text-gray-800">{project.name}</h2>
                            <p className="text-gray-600 mb-2">{project.description}</p>
                            <span className={`px-2 py-1 rounded text-sm ${status.color}`}>{status.text}</span>
                        </div>
                    )
                })}

            </div>

            {/* Модальное окно */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        className="fixed inset-0 flex items-center justify-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Фон с блюром */}
                        <motion.div
                            className="absolute inset-0 backdrop-blur-sm bg-black/30"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        ></motion.div>

                        {/* Контент модалки */}
                        <motion.div
                            className="relative z-10 bg-white rounded-xl p-6 w-11/12 max-w-md shadow-lg"
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                        >
                            <h2 className="text-2xl font-bold mb-4 text-center">Создать проект</h2>
                            <input
                                type="text"
                                placeholder="Название проекта"
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                className="w-full p-3 border border-gray-400 rounded mb-4 outline-none focus:border-blue-500"
                            />
                            <textarea
                                placeholder="Описание проекта"
                                value={newProjectDesc}
                                onChange={(e) => setNewProjectDesc(e.target.value)}
                                className="w-full p-3 border border-gray-400 rounded mb-4 focus:border-blue-500"
                            ></textarea>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="w-full p-2 mb-5 border border-gray-400 rounded focus:border-blue-500"
                            >
                                <option value="working">Работает</option>
                                <option value="progress">В прогрессе</option>
                                <option value="stopped">Не работает</option>
                            </select>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                                >
                                    Отмена
                                </button>
                                <button
                                    onClick={handleCreateProject}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                >
                                    Создать
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Projects
