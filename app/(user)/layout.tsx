import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "TeamPro | Профиль",
  description: "TeamPro - это проект, которое помогает командам управлять проектами и разработчиками.",
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {children}
    </div>
  )
}
