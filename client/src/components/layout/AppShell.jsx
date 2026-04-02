import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';

function AppShell() {
  return (
    <div className="dashboard-shell">
      <div className="mx-auto grid min-h-screen max-w-[1600px] gap-4 px-4 py-4 lg:grid-cols-[280px,minmax(0,1fr)] lg:px-6 lg:py-6">
        <Sidebar />
        <div className="flex min-h-[calc(100vh-2rem)] flex-col gap-4 lg:min-h-0">
          <TopNavbar />
          <main className="flex-1 space-y-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default AppShell;
