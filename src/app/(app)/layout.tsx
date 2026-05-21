import { AppLayout } from '@/components/layout/app-layout'

export default function AppRootLayout({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>
}
