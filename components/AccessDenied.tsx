import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Role } from '../types';

const AccessDenied: React.FC = () => {
  const { user } = useStore();

  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center animate-fade-in">
      <div className="bg-red-50 p-6 rounded-full mb-6">
        <ShieldAlert size={64} className="text-red-600" />
      </div>
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Access Denied</h1>
      <p className="text-slate-500 max-w-md mb-8">
        Your current role (<span className="font-bold uppercase text-slate-700">{user?.role}</span>) 
        does not have permission to view this restricted area. This attempt has been logged.
      </p>
      
      <button 
        onClick={() => window.location.reload()} 
        className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
      >
        <ArrowLeft size={18} />
        Return to Dashboard
      </button>
    </div>
  );
};

export default AccessDenied;