import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import Home from '../pages/Home';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import PassengerList from '../pages/passenger/PassengerList';
import PublishPassenger from '../pages/passenger/PublishPassenger';
import MyPassengerRequests from '../pages/passenger/MyPassengerRequests';
import DriverList from '../pages/driver/DriverList';
import PublishDriver from '../pages/driver/PublishDriver';
import MyDriverInvites from '../pages/driver/MyDriverInvites';
import ChatList from '../pages/chat/ChatList';
import ChatRoom from '../pages/chat/ChatRoom';
import Profile from '../pages/profile/Profile';
import ProtectedRoute from './ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
      {
        path: 'passenger',
        element: <PassengerList />,
      },
      {
        path: 'passenger/publish',
        element: (
          <ProtectedRoute>
            <PublishPassenger />
          </ProtectedRoute>
        ),
      },
      {
        path: 'passenger/my',
        element: (
          <ProtectedRoute>
            <MyPassengerRequests />
          </ProtectedRoute>
        ),
      },
      {
        path: 'driver',
        element: <DriverList />,
      },
      {
        path: 'driver/publish',
        element: (
          <ProtectedRoute>
            <PublishDriver />
          </ProtectedRoute>
        ),
      },
      {
        path: 'driver/my',
        element: (
          <ProtectedRoute>
            <MyDriverInvites />
          </ProtectedRoute>
        ),
      },
      {
        path: 'chat',
        element: (
          <ProtectedRoute>
            <ChatList />
          </ProtectedRoute>
        ),
      },
      {
        path: 'chat/:userId',
        element: (
          <ProtectedRoute>
            <ChatRoom />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

export default router;
