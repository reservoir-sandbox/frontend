import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LoadingProvider, useLoading } from '@/contexts/LoadingContext';
import MainPage from './pages/MainPage/page';
import PastReports from './pages/PastReports/page';
import Login from './pages/Login/page';
import Register from './pages/Register/page';
import ProtectedLayout from './pages/ProtectedLayout/page';
import Report from './pages/Report/page';
import LoadingScreen from '@/pages/LoadingScreen/component';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <LoadingScreen totalSteps={30} />
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <LoadingScreen totalSteps={30} />
    );
  }

  return !isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};

const AppContent: React.FC = () => {
  const { isLoading } = useAuth();
  const { showLoading } = useLoading();

  if (isLoading) {
    return (
      <LoadingScreen totalSteps={30} />
    );
  }

  if (showLoading) {
    return (
      <LoadingScreen totalSteps={30} />
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      <Route
        element={
          <PrivateRoute>
            <ProtectedLayout />
          </PrivateRoute>
        }
      >
        <Route path="/" element={<MainPage />} />
        <Route path="/past-reports" element={<PastReports />} />
        <Route path="/report/:id" element={<Report />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <LoadingProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LoadingProvider>
  );
};

export default App;