'use client'

import api from '@/app/api/api'
import { useRouter } from 'next/navigation'
import React from 'react'
import { useForm, FieldValues } from 'react-hook-form'
import toast, { Toaster } from 'react-hot-toast'

const Page = () => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<FieldValues>()

    const router = useRouter()

    const onSubmit = async (data: FieldValues) => {
        try {
            const response = await api.post('/auth/register', data)

            toast.success('Регистрация успешна!', {
                duration: 4000,
                position: 'top-center',
            })
            reset()
            router.replace('/accounts/login')
        } catch (error: any) {
            if (error.response) {
                console.error('Registration error:', error.response.data)
                toast.error(error.response.data?.message || 'Ошибка при регистрации', {
                    duration: 4000,
                    position: 'top-center',
                })
            } else {
                console.error('Registration error:', error.message)
                toast.error('Сервер недоступен или ошибка сети', {
                    duration: 4000,
                    position: 'top-center',
                })
            }
        }
    }

    return (
        <div className="p-4 flex justify-center items-center min-h-screen">
            <Toaster />

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-3 max-w-sm w-full p-4 rounded shadow"
            >
                <h2 className="text-2xl font-bold text-center mb-2">Регистрация</h2>

                <input
                    type="text"
                    placeholder="Имя"
                    {...register('username', {
                        required: 'Введите имя',
                        minLength: {
                            value: 3,
                            message: 'Имя должно быть больше 3 символов',
                        },
                    })}
                    className="border p-2 rounded border-gray-400 outline-none focus:border-blue-500"
                />
                {errors.name && (
                    <span className="text-red-500 text-sm">{String(errors.name?.message)}</span>
                )}

                <input
                    type="text"
                    placeholder="Email (только Gmail)"
                    {...register('email', {
                        required: 'Введите email',
                        pattern: {
                            value: /^[a-zA-Z0-9._%+-]+@gmail\.com$/,
                            message: 'Введите корректный Gmail адрес',
                        },
                    })}
                    className="border p-2 rounded border-gray-400 outline-none focus:border-blue-500"
                />
                {errors.email && (
                    <span className="text-red-500 text-sm">{String(errors.email?.message)}</span>
                )}

                <input
                    type="password"
                    placeholder="Пароль"
                    {...register('password', {
                        required: 'Введите пароль',
                        minLength: {
                            value: 6,
                            message: 'Пароль должен быть больше 6 символов',
                        },
                    })}
                    className="border p-2 rounded border-gray-400 outline-none focus:border-blue-500"
                />
                {errors.password && (
                    <span className="text-red-500 text-sm">{String(errors.password?.message)}</span>
                )}

                <select
                    {...register('role', { required: 'Выберите роль' })}
                    className="border p-2 rounded border-gray-400 cursor-pointer outline-none focus:border-blue-500"
                >
                    <option value="">Выберите роль</option>
                    <option value="teamlead">ТимЛид</option>
                    <option value="developer">Разработчик</option>
                </select>
                {errors.role && (
                    <span className="text-red-500 text-sm">{String(errors.role?.message)}</span>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-500 cursor-pointer text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                    {isSubmitting ? 'Отправка...' : 'Регистрация'}
                </button>

                <div className="text-center">
                    <p>
                        Уже есть аккаунт?{' '}
                        <a className="text-blue-600 hover:underline" href="/accounts/login">
                            Войдите
                        </a>
                    </p>
                </div>
            </form>
        </div>
    )
}

export default Page
