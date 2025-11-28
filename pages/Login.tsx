import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { UserCheck, ShieldCheck, Briefcase } from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useStore();
  const [error, setError] = useState('');

  const handleLogin = (email: string) => {
    const success = login(email);
    if (!success) setError('Invalid credential demo. Please use buttons below.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 to-slate-900 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-500 mt-2">Sign in to Nexus HR Management</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-center mb-2">Select a Demo Role</p>
          
          <button 
            onClick={() => handleLogin('admin@nexus.com')}
            className="w-full p-4 border border-gray-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 hover:shadow-md transition-all flex items-center group"
          >
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
              <ShieldCheck size={20} />
            </div>
            <div className="ml-4 text-left">
              <p className="font-bold text-gray-800">Administrator</p>
              <p className="text-xs text-gray-500">Full access, Analytics, User Mgmt</p>
            </div>
          </button>

          <button 
            onClick={() => handleLogin('hr@nexus.com')}
            className="w-full p-4 border border-gray-200 rounded-xl hover:bg-purple-50 hover:border-purple-200 hover:shadow-md transition-all flex items-center group"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
              <UserCheck size={20} />
            </div>
            <div className="ml-4 text-left">
              <p className="font-bold text-gray-800">HR Manager</p>
              <p className="text-xs text-gray-500">Leave Approvals, Payroll View</p>
            </div>
          </button>

          <button 
            onClick={() => handleLogin('john@nexus.com')}
            className="w-full p-4 border border-gray-200 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 hover:shadow-md transition-all flex items-center group"
          >
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <Briefcase size={20} />
            </div>
            <div className="ml-4 text-left">
              <p className="font-bold text-gray-800">Employee</p>
              <p className="text-xs text-gray-500">View Profile, Apply Leave</p>
            </div>
          </button>
        </div>
        
        <div className="mt-8 text-center text-xs text-gray-400">
          Secure Enterprise Access &copy; 2024 Nexus Inc.
        </div>
      </div>
    </div>
  );
};

export default Login;