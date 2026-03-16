'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import api from '../../api/api'
import toast, { Toaster } from 'react-hot-toast'
import Header from '@/app/features/Header'
import { ProjectT } from '@/app/types/project'
import { UserT } from '@/app/types/user'
import { CopyIcon, Pencil, Check, Trash } from 'lucide-react'
import { ClipLoader } from 'react-spinners'
import { TaskT } from '@/app/types/task'

const STATUS_MAP: Record<string, { text: string; color: string }> = {
  working: { text: 'Работает', color: 'bg-green-200 text-green-800' },
  progress: { text: 'В прогрессе', color: 'bg-yellow-200 text-yellow-800' },
  stopped: { text: 'Не работает', color: 'bg-red-200 text-red-800' },
  paused: { text: 'Приостановлен', color: 'bg-purple-200 text-purple-800' },
  review: { text: 'На проверке', color: 'bg-blue-200 text-blue-800' }
}

const ProjectPage = () => {
  const params = useParams()
  const id = Array.isArray(params.id) ? params.id[0] : params.id
  const router = useRouter()

  const [project, setProject] = useState<ProjectT | null>(null)
  const [projectForm, setProjectForm] = useState<Partial<ProjectT>>({})
  const [developers, setDevelopers] = useState<UserT[]>([])
  const [tasks, setTasks] = useState<TaskT[]>([])
  const [myData, setMyData] = useState<UserT | null>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [taskTitle, setTaskTitle] = useState('')
  const [projectSet, setProjectSet] = useState(true)

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
      const devs = Array.isArray(res.data) ? res.data : res.data?.developers || []
      setDevelopers(devs)
    } catch {
      setDevelopers([])
    }
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

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/user/me', { withCredentials: true })
        setMyData(res.data)
      } catch { }
    }
    fetch()
  }, [])

  const checkDeveloperLimit = () => {
    const limits: any = { free: 5, pro: 20, buisness: 2000 }
    return developers.length < (limits[myData?.tarifPlane || 'free'] || 5)
  }

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(project?.accessCode || '')
      toast.success("Код скопирован")
    } catch {
      toast.error("Ошибка при копировании")
    }
  }

  const profileDev = (email: string) => {
    router.push(`/profile/${encodeURIComponent(email)}`)
  }

  const handleAddDeveloper = async () => {
    if (!email) return toast.error('Введите email')
    if (!checkDeveloperLimit()) {
      toast.error('Достигнут лимит разработчиков для вашего тарифа.')
      return
    }
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
      const res = await api.delete(`/projects/delete-developer/${id}/${developerId}`, { withCredentials: true })
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

  const handleDeleteTask = async (taskId: number) => {
    try {
      await api.delete(`/projects/tasks/${taskId}`, { withCredentials: true })
      toast.success("Задача удалена")
      setTasks(prev => prev.filter(t => t.id !== taskId))
    } catch {
      toast.error('Ошибка удаления задачи')
    }
  }

  const handleChange = (field: keyof ProjectT, value: string) => {
    setProjectForm(prev => ({ ...prev, [field]: value }))
  }

  useEffect(() => {
    if (project) {
      setProjectForm({
        name: project.name,
        status: project.status,
        description: project.description
      })
    }
  }, [project])

  const handleProjectSet = () => setProjectSet(!projectSet)

  const handleProjectUpdate = async (id: number) => {
    setLoading(true)
    try {
      const res = await api.put(`/projects/${id}/update`, projectForm, { withCredentials: true })

      const updatedProject = {
        ...project,
        ...res.data,
        status: res.data.status?.toLowerCase() || project?.status || 'working'
      }

      setProject(updatedProject)
      setProjectForm(updatedProject)
      toast.success('Проект успешно обновлён')
      setProjectSet(true)
    } catch {
      toast.error('Ошибка при обновлении проекта')
    } finally {
      setLoading(false)
    }
  }

  const projectStatus = STATUS_MAP[project?.status?.toLowerCase() || 'working']
    || { text: 'Неизвестно', color: 'bg-gray-200 text-gray-800' }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <Toaster />

      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <ClipLoader color="#3b82f6" size={50} />
        </div>
      ) : !project ? (
        <div className="flex justify-center items-center h-screen">Проект не найден</div>
      ) : (
        <main className="flex flex-col md:flex-row gap-6 p-6 w-full max-w-7xl mx-auto flex-1">
          <div className="flex flex-col gap-6 w-full md:w-1/3">
            <div className="bg-white p-6 shadow-md border border-gray-200 rounded-lg">
              <div className='flex items-center justify-between'>
                {projectSet ? (
                  <h1 className="text-2xl font-bold">{project.name}</h1>
                ) : (
                  <input
                    onChange={(e) => handleChange('name', e.target.value)}
                    value={projectForm.name || ''}
                    placeholder='Введите название проекта'
                    className="border p-2 w-[80%] rounded outline-none border-gray-400 focus:border-blue-600"
                  />
                )}
                {projectSet ? (
                  <Pencil onClick={handleProjectSet} className='cursor-pointer' size={20} />
                ) : (
                  <Check onClick={() => handleProjectUpdate(project.id)} className='cursor-pointer' size={20} />
                )}
              </div>

              {projectSet ? (
                <div className='flex items-center gap-2 mt-2'>
                  <span className='text-gray-600'>Статус: </span>
                  <span className={`px-2 rounded-full ${projectStatus.color}`}>{projectStatus.text}</span>
                </div>
              ) : (
                <select
                  value={projectForm.status || 'working'}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-[80%] outline-none p-2 mt-2 border border-gray-400 rounded focus:border-blue-500"
                >
                  <option value="working">Работает</option>
                  <option value="progress">В прогрессе</option>
                  <option value="stopped">Не работает</option>
                </select>
              )}

              <p className="text-gray-900 text-lg mt-2">{project.description}</p>

              <div className='flex items-center gap-2 mt-2'>
                <p className="text-gray-600 text-md">Код проекта: <strong>{project.accessCode}</strong></p>
                <button onClick={copyCode} className='w-4 h-5 cursor-pointer'>
                  <CopyIcon width={16} color='gray' />
                </button>
              </div>

              <div className='mt-2'>
                <span className='text-gray-600'>Создатель: {project.ownerUsername} </span>
                <a onClick={() => profileDev(project.ownerEmail)} className="text-blue-600 cursor-pointer hover:underline">
                  ({project.ownerEmail})
                </a>
              </div>
            </div>

              <div className="bg-white p-4 shadow-md border border-gray-200 max-h-85 rounded-lg flex flex-col flex-1">
                <h2 className="font-semibold mb-2">Разработчики</h2>
                <div className='flex gap-2 mb-2'>
                  <span className='text-gray-700 font-medium cursor-pointer'>{project.ownerUsername}</span>
                  <a onClick={() => profileDev(project.ownerEmail)} className="text-blue-600 hover:underline cursor-pointer">
                    ({project.ownerEmail})
                  </a>
                </div>

                <ul className="overflow-y-auto mb-3 space-y-1 max-h-[300px]">
                  {developers.length > 0 ? developers.map(dev => {
                    const devStatus = STATUS_MAP[dev.userStatus?.toLowerCase()] || { text: 'Неизвестно', color: 'bg-gray-200 text-gray-800' }
                    return (
                      <li key={dev.id} className="flex justify-between items-center text-sm">
                        <div className='flex items-center gap-2'>
                          <p className="text-[#333] text-lg cursor-pointer" onClick={() => profileDev(dev.email)}>
                            {dev.email}
                          </p>
                        </div>
                        <div className='flex gap-5 items-center'>
                          <div className={`px-3 py-1 rounded-full font-medium ${devStatus.color}`}>
                            {devStatus.text}
                          </div>
                          <button onClick={() => handleDeleteDev(dev.id)} className="text-red-600 cursor-pointer hover:text-red-800">
                            <Trash size={22} />
                          </button>
                        </div>
                      </li>
                    )
                  }) : <p className="text-gray-500">Нет разработчиков</p>}
                </ul>

                <div className="flex gap-2 mt-auto">
                  <input
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Email разработчика"
                    className="border p-1 rounded w-full text-sm outline-none border-gray-400 focus:border-blue-600"
                  />
                  <button onClick={handleAddDeveloper} className="bg-blue-600 cursor-pointer text-white px-4 py-2 rounded shadow-md">
                    Пригласить
                  </button>
                </div>
              </div>
          </div>

          <div className="bg-white p-4 shadow-md border border-gray-200 rounded-lg flex flex-col flex-1">
            <h1 className="font-medium text-2xl mb-2">{project.name}:</h1>
            <ul className="flex-1 overflow-y-auto mb-3 space-y-1">
              {tasks.map(task => (
                <li key={task.id} className="flex justify-between items-center text-sm">
                  <span className={task.done ? 'line-through font-medium text-gray-400' : 'font-medium'}>{task.text}</span>
                  <div className='flex gap-4'>
                    <button onClick={() => toggleTask(task.id)} className="text-green-600 hover:text-green-800">{task.done ? '❌' : '✅'}</button>
                    <button onClick={() => handleDeleteTask(task.id)} className='text-red-600 hover:text-red-800'>
                      <Trash size={20} />
                    </button>
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
              <button onClick={handleAddTask} className="bg-green-600 text-white px-4 py-2 rounded shadow-md">Добавить</button>
            </div>
          </div>
        </main>
      )}
    </div>
  )
}

export default ProjectPage