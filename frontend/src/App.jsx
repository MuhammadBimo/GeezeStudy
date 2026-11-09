import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { MotionConfig } from 'motion/react'
import AppShell from '@/components/layout/AppShell'
import Skeleton from '@/components/ui/Skeleton'

// Setiap halaman dimuat saat dibutuhkan (route-based code splitting).
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const TasksPage = lazy(() => import('@/pages/TasksPage'))
const CalendarPage = lazy(() => import('@/pages/CalendarPage'))
const TimerPage = lazy(() => import('@/pages/TimerPage'))
const GoalsPage = lazy(() => import('@/pages/GoalsPage'))
const MissionsPage = lazy(() => import('@/pages/MissionsPage'))
const ProgressPage = lazy(() => import('@/pages/ProgressPage'))
const FriendsPage = lazy(() => import('@/pages/FriendsPage'))
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'))

function PageFallback() {
  return (
    <div role="status" aria-label="Memuat halaman" className="flex flex-col gap-4 p-4 sm:p-6 lg:p-8">
      <Skeleton className="h-12 w-64" />
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  )
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/masuk" element={<LoginPage />} />
            <Route path="/daftar" element={<RegisterPage />} />
            <Route path="/lupa-password" element={<ForgotPasswordPage />} />
            <Route element={<AppShell />}>
              <Route index element={<DashboardPage />} />
              <Route path="tugas" element={<TasksPage />} />
              <Route path="kalender" element={<CalendarPage />} />
              <Route path="timer" element={<TimerPage />} />
              <Route path="goals" element={<GoalsPage />} />
              <Route path="misi" element={<MissionsPage />} />
              <Route path="progres" element={<ProgressPage />} />
              <Route path="teman" element={<FriendsPage />} />
              <Route path="notifikasi" element={<NotificationsPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </MotionConfig>
  )
}
