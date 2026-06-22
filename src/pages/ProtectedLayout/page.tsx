import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from "@/components/Sidebar/component";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import LoadingScreen from '@/pages/LoadingScreen/component';

const ProtectedLayout: React.FC = () => {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <LoadingScreen totalSteps={30} />
    );
  }

  return (
    <SidebarProvider>
      <div className="flex w-full">
        <Sidebar user={user} onLogout={logout} />
        <main className="flex-1 p-4">
          <SidebarTrigger />
          <div className="pt-2 w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ProtectedLayout;