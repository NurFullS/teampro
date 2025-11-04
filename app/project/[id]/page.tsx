'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import api from '../../api/api'
import toast, { Toaster } from 'react-hot-toast'
import Header from '@/app/features/Header'
import { ProjectT } from '@/app/types/project'
import { UserT } from '@/app/types/user'
import { } from 'lucide-react'
import { ClipLoader } from 'react-spinners'
import { Trash } from 'lucide-react'
import { TaskT } from '@/app/types/task'
import { CommentT } from '@/app/types/comment'

const ProjectPage = () => {
  const params = useParams()
  const id = Array.isArray(params.id) ? params.id[0] : params.id

  const [project, setProject] = useState<ProjectT | null>(null)
  const [developers, setDevelopers] = useState<UserT[]>([])
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [myData, setMyData] = useState<UserT | null>(null)
  const [devPrav, setDevPrav] = useState(false)
  const [tasks, setTasks] = useState<TaskT[]>([])
  const [taskTitle, setTaskTitle] = useState('')
  const [comments, setComments] = useState<CommentT[]>([])
  const [commentText, setCommentText] = useState('')

  useEffect(() => {
    if (!id) return
    const fetchProject = async () => {
      try {
        const res = await api.get(`/projects/${id}`, { withCredentials: true })
        setProject(res.data)
      } catch {
        toast.error('Проект не найден')
      } finally {
        setLoading(false)
      }
    }
    fetchProject()
  }, [id])

  const fetchDevelopers = async () => {
    if (!id) return
    try {
      const res = await api.get(`/projects/${id}/developers`, { withCredentials: true })
      setDevelopers(res.data)
    } catch { }
  }
  useEffect(() => { fetchDevelopers() }, [id])

  const fetchTasks = async () => {
    if (!id) return
    try {
      const res = await api.get(`/projects/${id}/tasks`, { withCredentials: true })
      setTasks(res.data)
    } catch { }
  }
  useEffect(() => { fetchTasks() }, [id])

  const fetchComments = async () => {
    if (!id) return
    try {
      const res = await api.get(`/projects/${id}/comments`, { withCredentials: true })
      setComments(res.data)
    } catch { }
  }
  useEffect(() => { fetchComments() }, [id])

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/user/me')
        setMyData(res.data)
        setDevPrav(res.data.role === 'teamlead')
      } catch { }
    }
    fetch()
  }, [])

  const handleAddDeveloper = async () => {
    if (!email) return toast.error('Введите email')
    try {
      const res = await api.post(
        `/projects/${id}/add-developer?email=${encodeURIComponent(email)}`,
        {},
        { withCredentials: true }
      )
      toast.success(res.data)
      await fetchDevelopers()
      setEmail('')
    } catch (err: any) {
      toast.error(err.response?.data || 'Ошибка добавления')
    }
  }

  const handleDeleteDev = async (developerId: number) => {
    try {
      const res = await api.delete(
        `/projects/delete-developer/${id}/${developerId}`,
        { withCredentials: true }
      )
      toast.success(res.data)
      setDevelopers(prev => prev.filter(dev => dev.id !== developerId))
    } catch (err: any) {
      toast.error(err.response?.data || 'Ошибка удаления')
    }
  }

  const handleAddTask = async () => {
    if (!taskTitle) return
    try {
      const res = await api.post(`/projects/${id}/tasks`, { text: taskTitle }, { withCredentials: true })
      setTasks(prev => [...prev, res.data])
      setTaskTitle('')
    } catch {
      toast.error('Ошибка добавления задачи')
    }
  }

  const toggleTask = async (taskId: number) => {
    try {
      await api.put(`/projects/${id}/tasks/${taskId}/toggle`, {}, { withCredentials: true })
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, done: !t.done } : t))
    } catch {
      toast.error('Ошибка обновления задачи')
    }
  }

  const handleAddComment = async () => {
    if (!commentText) return
    try {
      const res = await api.post(`/projects/${id}/comments`, { text: commentText }, { withCredentials: true })
      setComments(prev => [...prev, res.data])
      setCommentText('')
    } catch {
      toast.error('Ошибка добавления комментария')
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    try {
      const res = await api.delete(`/comments/${commentId}`, { withCredentials: true })
      toast.success('Комментарий удален')
      setComments(prev => prev.filter(c => c.id !== commentId))
    } catch {
      toast.error('Нельзя удалить чужой комментарий ')
    }
  }

  const handleDeleteTask = async (taskId: number) => {
    try {
      const res = await api.delete(`/projects/tasks/${taskId}`, { withCredentials: true })
      toast.success("Задача удалена")
      setTasks(prev => prev.filter(t => t.id !== taskId))
    } catch (error) {
      toast.error('Ошибка удаления задачи')
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <ClipLoader color="#3b82f6" size={50} />
    </div>
  )

  if (!project) return <div className="flex justify-center items-center h-screen">Проект не найден</div>

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <Toaster />

      <main className="flex flex-col md:flex-row gap-6 p-6 w-full max-w-7xl mx-auto flex-1">
        <div className="flex flex-col gap-6 w-full md:w-1/3">
          <div className="bg-white p-6 shadow-md border border-gray-200 rounded-lg">
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="text-gray-700 mt-2">{project.description}</p>
            <p className="text-sm mt-2 text-gray-600">Код проекта: {project.accessCode}</p>
            <p className="mt-2 text-gray-600">Создатель: {project.ownerUsername} ({project.ownerEmail})</p>
            <p className="mt-2 text-gray-600">Статус: {project.status}</p>
          </div>

          {devPrav && (
            <div className="bg-white p-4 shadow-md border border-gray-200 max-h-85 rounded-lg flex flex-col flex-1">
              <h2 className="font-semibold mb-2">Разработчики</h2>

              <ul className="overflow-y-auto mb-3 space-y-1 max-h-[300px]">
                {developers.length > 0
                  ? developers.map((dev, index) => (
                    <li key={index} className="flex justify-between items-center text-sm">
                      <div className='flex gap-2'>
                        <span className='text-gray-700 font-medium'>{dev.username}</span>
                        <a
                          href={`https://mail.google.com/mail/?view=cm&fs=1&to=${dev.email}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          ({dev.email})
                        </a>
                      </div>
                      <div className='p-1 bg-gray-400 rounded-md shadow-md'>{dev.userStatus}</div>
                      <button
                        onClick={() => handleDeleteDev(dev.id)}
                        className="text-red-600 shadow-md cursor-pointer hover:text-red-800"
                      >
                        <Trash size={20} />
                      </button>
                    </li>
                  ))
                  : <p className="text-gray-500">Нет разработчиков</p>}
              </ul>

              <div className="flex gap-2 mt-auto">
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email разработчика"
                  className="border p-1 rounded w-full text-sm outline-none border-gray-400 focus:border-blue-600"
                />
                <button
                  onClick={handleAddDeveloper}
                  className="bg-blue-600 font-medium text-md text-white px-4 py-2 shadow-md cursor-pointer rounded"
                >
                  +
                </button>
              </div>
            </div>
          )}

        </div>

        <div className="bg-white p-4 shadow-md border border-gray-200 rounded-lg flex flex-col flex-1">
          <h2 className="font-semibold mb-2">Задачи</h2>
          <ul className="flex-1 overflow-y-auto mb-3 space-y-1">
            {tasks.map(task => (
              <li key={task.id} className="flex justify-between items-center text-sm">
                <span className={task.done ? 'line-through font-medium text-gray-400' : 'font-medium'}>{task.text}</span>
                <div className='flex gap-4'>
                  <button onClick={() => toggleTask(task.id)} className="text-green-600 text-lg cursor-pointer hover:text-green-800">
                    {task.done ? '❌' : '✅'}
                  </button>
                  <button className='' onClick={() => handleDeleteTask(task.id)}><Trash className='text-red-600 cursor-pointer' size={20} /></button>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex gap-2 mt-auto">
            <input
              value={taskTitle}
              onChange={e => setTaskTitle(e.target.value)}
              placeholder="Новая задача"
              className="border p-1 outline-none border-gray-400 focus:border-blue-600 rounded w-full text-sm"
            />
            <button onClick={handleAddTask} className="bg-green-600 text-white px-4 py-2 rounded shadow-md cursor-pointer text-md">Добавить</button>
          </div>
        </div>

        <div className="bg-white p-4 shadow-md border border-gray-200 rounded-lg flex flex-col flex-1 md:w-1/3">
          <h2 className="font-semibold mb-2">Комментарии</h2>
          <ul className="flex-1 max-h-120 overflow-y-auto mb-3 space-y-2">
            {comments.map(comment => (
              <li
                key={comment.id}
                className="border-b overflow-y-auto border-gray-200 pb-1 text-sm flex justify-between items-start gap-2"
              >
                <span className="font-semibold whitespace-nowrap">{comment.author.username}:</span>

                <p
                  className="flex-1 min-w-0 max-h-20 overflow-y-auto break-words text-gray-700 border border-gray-100 rounded p-1"
                >
                  {comment.text}
                </p>

                <button className="shrink-0 cursor-pointer" onClick={() => handleDeleteComment(comment.id)}>
                  <Trash className="text-red-600 hover:text-red-800" size={20} />
                </button>
              </li>

            ))}
          </ul>
          <div className="flex gap-2 mt-auto">
            <input
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Ваш комментарий"
              className="border p-1 outline-none border-gray-400 focus:border-blue-600 rounded w-full text-sm"
            />
            <button onClick={handleAddComment} className="bg-gray-800 text-white cursor-pointer px-4 py-2 rounded text-md">Отпр.</button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ProjectPage