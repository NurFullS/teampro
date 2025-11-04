import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "TeamPro | Авторизация",
  description: "TeamPro - это проект, которое помогает командам управлять проектами и разработчиками.",
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {children}
    </div>
  )
}
