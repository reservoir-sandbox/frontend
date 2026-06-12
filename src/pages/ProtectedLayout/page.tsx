import Sidebar from "@/components/Sidebar/component"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Navigate, Outlet } from "react-router-dom"

export default function ProtectedLayout({ isLoggedIn }: { isLoggedIn: boolean }) {
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  
  return (
    <SidebarProvider>
      <div className="flex w-full">
        <Sidebar />
        <main className="flex-1 p-4">
          <SidebarTrigger />
          <div className="pt-2 w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
