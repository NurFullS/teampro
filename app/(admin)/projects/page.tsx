import React from 'react'
import Main from '../../features/Main'
import Projects from './Projects'
import Header from '@/app/features/Header'


import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "TeamPro | Проекты",
  description: "TeamPro - это проект которое может помочь многим еомандам управлять с проектом и с разработчиками.",
};

const page = () => {
  return (
    <div>
      <div>
        <Header />
      </div>
    </div>
  )
}

export default page