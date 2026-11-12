import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { LazyMotion, MotionConfig, domAnimation } from 'motion/react'
import AppShell from '@/components/layout/AppShell'
import { GuestOnly, RequireAdmin, RequireAuth } from '@/components/layout/RouteGuards'
import Skeleton from '@/components/ui/Skeleton'
import ToastProvider from '@/components/ui/ToastProvider'
import AuthProvider from '@/context/AuthProvider'

// Setiap halaman dimuat saat dibutuhkan (route-based code splitting).
const page = (loader) => lazy(loader)

const DashboardPage = page(() => import('@/pages/DashboardPage'))
const TasksPage = page(() => import('@/pages/TasksPage'))
const CalendarPage = page(() => import('@/pages/CalendarPage'))
const TimerPage = page(() => import('@/pages/TimerPage'))
const GoalsPage = page(() => import('@/pages/GoalsPage'))
const MissionsPage = page(() => import('@/pages/MissionsPage'))
const ProgressPage = page(() => import('@/pages/ProgressPage'))
const FriendsPage = page(() => import('@/pages/FriendsPage'))
const NotificationsPage = page(() => import('@/pages/NotificationsPage'))
const SettingsPage = page(() => import('@/pages/SettingsPage'))
const NotFoundPage = page(() => import('@/pages/NotFoundPage'))

const LoginPage = page(() => import('@/pages/auth/LoginPage'))
const RegisterPage = page(() => import('@/pages/auth/RegisterPage'))
const ForgotPasswordPage = page(() => import('@/pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = page(() => import('@/pages/auth/ResetPasswordPage'))
const VerifyEmailPage = page(() => import('@/pages/auth/VerifyEmailPage'))
const OnboardingPage = page(() => import('@/pages/auth/OnboardingPage'))

const AdminOverviewPage = page(() => import('@/pages/admin/AdminOverviewPage'))
const AdminUsersPage = page(() => import('@/pages/admin/AdminUsersPage'))
const AdminMissionsPage = page(() => import('@/pages/admin/AdminMissionsPage'))
const AdminPointsPage = page(() => import('@/pages/admin/AdminPointsPage'))
const AdminAchievementsPage = page(() => import('@/pages/admin/AdminAchievementsPage'))
const AdminAnnouncementsPage = page(() => import('@/pages/admin/AdminAnnouncementsPage'))
const AdminLogsPage = page(() => import('@/pages/admin/AdminLogsPage'))

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
      <LazyMotion features={domAnimation} strict>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <AuthProvider>
              <ToastProvider>
                <Suspense fallback={<PageFallback />}>
                  <Routes>
                    <Route element={<GuestOnly />}>
                      <Route path="/masuk" element={<LoginPage />} />
                      <Route path="/daftar" element={<RegisterPage />} />
                      <Route path="/lupa-password" element={<ForgotPasswordPage />} />
                      <Route path="/reset-password" element={<ResetPasswordPage />} />
                    </Route>

                    <Route element={<RequireAuth />}>
                      <Route path="/verifikasi-email" element={<VerifyEmailPage />} />
                      <Route path="/mulai" element={<OnboardingPage />} />
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
                        <Route path="pengaturan" element={<SettingsPage />} />

                        <Route path="admin" element={<RequireAdmin />}>
                          <Route index element={<AdminOverviewPage />} />
                          <Route path="pengguna" element={<AdminUsersPage />} />
                          <Route path="misi" element={<AdminMissionsPage />} />
                          <Route path="points" element={<AdminPointsPage />} />
                          <Route path="achievements" element={<AdminAchievementsPage />} />
                          <Route path="pengumuman" element={<AdminAnnouncementsPage />} />
                          <Route path="log" element={<AdminLogsPage />} />
                        </Route>

                        <Route path="*" element={<NotFoundPage />} />
                      </Route>
                    </Route>

                    <Route path="*" element={<NotFoundPage standalone />} />
                  </Routes>
                </Suspense>
              </ToastProvider>
          </AuthProvider>
        </BrowserRouter>
      </LazyMotion>
    </MotionConfig>
  )
}
