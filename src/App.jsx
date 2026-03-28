import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AdminRoute } from './components/AdminRoute';
import { Layout } from './components/Layout';
import { PublicLayout } from './components/PublicLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthProvider';
import { AccountPage } from './pages/AccountPage';
import { AdminBookingsPage } from './pages/admin/AdminBookingsPage';
import { AdminParkingsPage } from './pages/admin/AdminParkingsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { BookingsPage } from './pages/BookingsPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { ParkingDetailPage } from './pages/ParkingDetailPage';
import { RegisterPage } from './pages/RegisterPage';
import './App.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
          <Route path="/" element={<Layout />}>
            <Route element={<ProtectedRoute />}>
              <Route index element={<HomePage />} />
              <Route path="parking/:id" element={<ParkingDetailPage />} />
              <Route path="bookings" element={<BookingsPage />} />
              <Route path="account" element={<AccountPage />} />
            </Route>
            <Route path="admin" element={<AdminRoute />}>
              <Route path="parkings" element={<AdminParkingsPage />} />
              <Route path="bookings" element={<AdminBookingsPage />} />
              <Route path="users" element={<AdminUsersPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
