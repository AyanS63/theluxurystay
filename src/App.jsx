import React, { Suspense } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingFallback from './components/LoadingFallback';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';

// Lazy Load Pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const UserManagement = React.lazy(() => import('./pages/Users'));
const RoomManagement = React.lazy(() => import('./pages/Rooms'));
const BookingManagement = React.lazy(() => import('./pages/Bookings'));
const BillingManagement = React.lazy(() => import('./pages/Billing'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Housekeeping = React.lazy(() => import('./pages/Housekeeping'));
const MyBookings = React.lazy(() => import('./pages/MyBookings'));
const GuestRooms = React.lazy(() => import('./pages/GuestRooms'));
const Events = React.lazy(() => import('./pages/Events'));
const EventsManagement = React.lazy(() => import('./pages/EventsManagement'));
const Inquiries = React.lazy(() => import('./pages/Inquiries'));
const RoomDetails = React.lazy(() => import('./pages/RoomDetails'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));
const Register = React.lazy(() => import('./pages/Register'));
const ContactUs = React.lazy(() => import('./pages/ContactUs'));
const FAQs = React.lazy(() => import('./pages/FAQs'));
const PrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = React.lazy(() => import('./pages/TermsOfService'));
const AboutUs = React.lazy(() => import('./pages/AboutUs'));
const Invoice = React.lazy(() => import('./pages/Invoice'));

import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const HomeRoute = () => {
  const { user } = useAuth();
  if (user?.role === 'receptionist') {
    return <Navigate to="/dashboard" replace />;
  }
  return <Home />;
};

import { ThemeProvider } from './context/ThemeContext';
import { ChatProvider } from './context/ChatContext';
import { NotificationProvider } from './context/NotificationContext';
import { SocketProvider } from './context/SocketContext';

import ToastContainer from './components/ToastContainer';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <SocketProvider>
            <NotificationProvider>
              <ToastContainer />
              <ChatProvider>
                <BrowserRouter>
                  <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                      <Route path="/" element={<HomeRoute />} />
                      <Route path="/events" element={<Events />} />
                      <Route path="/rooms" element={<GuestRooms />} />
                      <Route path="/rooms/:id" element={<RoomDetails />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/reset-password/:token" element={<ResetPassword />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/contact" element={<ContactUs />} />
                      <Route path="/faqs" element={<FAQs />} />
                      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                      <Route path="/terms-of-service" element={<TermsOfService />} />
                      <Route path="/about-us" element={<AboutUs />} />
                      
                      <Route path="/dashboard" element={
                        <ProtectedRoute>
                          <DashboardLayout />
                        </ProtectedRoute>
                      }>
                        <Route index element={<Dashboard />} />
                        <Route path="users" element={<UserManagement />} />
                        <Route path="rooms" element={<RoomManagement />} />
                        <Route path="bookings" element={<BookingManagement />} />
                        <Route path="billing" element={<BillingManagement />} />
                        <Route path="housekeeping" element={<Housekeeping />} />
                        <Route path="events" element={<EventsManagement />} />
                        <Route path="inquiries" element={<Inquiries />} />
                        <Route path="settings" element={<Settings />} />
                      </Route>
          
                      <Route path="/my-bookings" element={
                        <ProtectedRoute>
                          <MyBookings />
                        </ProtectedRoute>
                      } />
                      <Route path="/invoice/:id" element={
                        <ProtectedRoute>
                          <Invoice />
                        </ProtectedRoute>
                      } />

                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Suspense>
                </BrowserRouter>
            </ChatProvider>
          </NotificationProvider>
          </SocketProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
