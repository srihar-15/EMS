
import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Role } from '../types';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  UserCircle, 
  LogOut, 
  Briefcase,
  ShieldAlert,
  TrendingUp,
  Bell,
  X,
  Check,
  Clock
} from 'lucide-react';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage }) => {
  const { user, logout, notifications, markNotificationRead, clearNotifications } = useStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Filter notifications for current user
  const myNotifications = notifications.filter(n => n.userId === user?.id);
  const unreadCount = myNotifications.filter(n => !n.isRead).length;

  const getMenuItems = () => {
    switch (user?.role) {
      case Role.ADMIN:
        return [
          { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'admin-employees', label: 'Employees', icon: Users },
          { id: 'attendance', label: 'Attendance', icon: Clock },
          { id: 'performance', label: 'Performance', icon: TrendingUp },
          { id: 'admin-logs', label: 'Audit Logs', icon: ShieldAlert },
        ];
      case Role.HR:
        return [
          { id: 'hr-dashboard', label: 'Overview', icon: LayoutDashboard },
          { id: 'hr-leaves', label: 'Leave Requests', icon: FileText },
          { id: 'attendance', label: 'Attendance', icon: Clock },
          { id: 'performance', label: 'Performance', icon: TrendingUp },
        ];
      case Role.EMPLOYEE:
        return [
          { id: 'emp-dashboard', label: 'My Profile', icon: UserCircle },
          { id: 'emp-leaves', label: 'My Leaves', icon: Briefcase },
          { id: 'attendance', label: 'Time & Attendance', icon: Clock },
          { id: 'performance', label: 'My Performance', icon: TrendingUp },
        ];
      default:
        return [];
    }
  };

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col shadow-xl z-30 transition-all duration-300">
      <div className="p-6 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold">N</div>
            <h1 className="text-xl font-bold tracking-tight">Nexus HR</h1>
        </div>
      </div>

      <div className="flex-1 py-6 px-4 space-y-2">
        {getMenuItems().map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              activePage === item.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-slate-700 relative" ref={notifRef}>
        {/* Notification Bell */}
        <div className="flex justify-between items-center mb-4 px-2">
            <div className="flex items-center gap-3">
                <img src={user?.avatar} alt="Profile" className="w-10 h-10 rounded-full border-2 border-slate-600" />
                <div className="overflow-hidden">
                    <p className="text-sm font-medium truncate w-24">{user?.name}</p>
                    <p className="text-xs text-slate-400 truncate capitalize">{user?.role.toLowerCase()}</p>
                </div>
            </div>
            <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900"></span>
                )}
            </button>
        </div>

        {/* Notification Panel (Popover) */}
        {showNotifications && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 overflow-hidden w-80 animate-fade-in origin-bottom-left z-50">
                <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50">
                    <h3 className="font-bold text-sm">Notifications</h3>
                    {myNotifications.length > 0 && (
                        <button onClick={clearNotifications} className="text-xs text-slate-500 hover:text-red-500">
                            Clear all
                        </button>
                    )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                    {myNotifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 text-xs">
                            No notifications yet.
                        </div>
                    ) : (
                        myNotifications.map(notif => (
                            <div 
                                key={notif.id} 
                                onClick={() => markNotificationRead(notif.id)}
                                className={`p-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors ${!notif.isRead ? 'bg-indigo-50/50' : ''}`}
                            >
                                <div className="flex gap-2">
                                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                                        notif.type === 'success' ? 'bg-green-500' : 
                                        notif.type === 'error' ? 'bg-red-500' :
                                        notif.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                                    }`}></div>
                                    <div className="flex-1">
                                        <p className={`text-xs ${!notif.isRead ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
                                            {notif.message}
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-1">
                                            {new Date(notif.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </p>
                                    </div>
                                    {!notif.isRead && <div className="text-indigo-500"><div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div></div>}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        )}

        <button 
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white py-2 rounded-lg transition-colors text-sm font-medium"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;