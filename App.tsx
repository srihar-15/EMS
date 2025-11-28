
import React, { useState } from 'react';
import { useStore } from './store/useStore';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import AdminDashboard from './pages/AdminDashboard';
import HRPortal from './pages/HRPortal';
import EmployeePortal from './pages/EmployeePortal';
import AuditLogs from './pages/AuditLogs';
import Performance from './pages/Performance';
import Attendance from './pages/Attendance';
import AccessDenied from './components/AccessDenied';
import { Role } from './types';

// SECURITY: Define allowed roles for each route
const PAGE_PERMISSIONS: Record<string, Role[]> = {
  'admin-dashboard': [Role.ADMIN],
  'admin-employees': [Role.ADMIN],
  'admin-logs': [Role.ADMIN],
  'performance': [Role.ADMIN, Role.HR, Role.EMPLOYEE],
  'attendance': [Role.ADMIN, Role.HR, Role.EMPLOYEE],
  'hr-dashboard': [Role.HR],
  'hr-leaves': [Role.HR],
  'emp-dashboard': [Role.EMPLOYEE],
  'emp-leaves': [Role.EMPLOYEE],
};

const App: React.FC = () => {
  const { user } = useStore();
  const [activePage, setActivePage] = useState<string>('');

  // Default redirect logic based on role
  const getDefaultPage = () => {
    if (user?.role === Role.ADMIN) return 'admin-dashboard';
    if (user?.role === Role.HR) return 'hr-dashboard';
    return 'emp-dashboard';
  };

  React.useEffect(() => {
    if (user) {
      setActivePage(getDefaultPage());
    }
  }, [user]);

  if (!user) {
    return <Login />;
  }

  // ROUTE GUARD: Check if current user has permission for activePage
  const allowedRoles = PAGE_PERMISSIONS[activePage] || [];
  const hasPermission = allowedRoles.includes(user.role);

  const renderContent = () => {
    if (!hasPermission) {
      return <AccessDenied />;
    }

    switch (activePage) {
      case 'admin-dashboard':
      case 'admin-employees': 
        return <AdminDashboard />;
      case 'admin-logs':
        return <AuditLogs />;
      case 'performance':
        return <Performance />;
      case 'attendance':
        return <Attendance />;
      case 'hr-dashboard':
      case 'hr-leaves':
        return <HRPortal />;
      case 'emp-dashboard':
      case 'emp-leaves':
        return <EmployeePortal />;
      default:
        return <div className="p-10 text-center text-gray-500">Page under construction</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;