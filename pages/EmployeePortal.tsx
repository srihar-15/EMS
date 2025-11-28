
import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { LeaveStatus, LeaveRequest, LeaveBalance } from '../types';
import { Calendar, Download, MapPin, Mail, Phone, Briefcase, Sun, Thermometer, User, Clock } from 'lucide-react';

const EmployeePortal: React.FC = () => {
  const { user, leaves, addLeaveRequest } = useStore();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [leaveType, setLeaveType] = useState<keyof LeaveBalance>('vacation');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const myLeaves = leaves.filter(l => l.employeeId === user?.id);

  const calculateDays = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = Math.abs(e.getTime() - s.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    // Validation
    const daysRequested = calculateDays(startDate, endDate);
    if (daysRequested > user.leaveBalance[leaveType]) {
        setError(`Insufficient balance. You have ${user.leaveBalance[leaveType]} days of ${leaveType} remaining, but requested ${daysRequested} days.`);
        return;
    }

    const newLeave: LeaveRequest = {
      id: Date.now().toString(),
      employeeId: user.id,
      employeeName: user.name,
      type: leaveType,
      startDate,
      endDate,
      reason,
      status: LeaveStatus.PENDING
    };
    
    addLeaveRequest(newLeave);
    setShowApplyModal(false);
    setReason('');
    setStartDate('');
    setEndDate('');
    setError('');
  };

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        <div className="px-8 pb-8 flex flex-col md:flex-row items-center md:items-end -mt-12 gap-6">
            <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-white" />
            <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold text-slate-800">{user.name}</h1>
                <p className="text-slate-500 font-medium">{user.role} • {user.department}</p>
            </div>
            <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium">
                    <Download size={16} /> Salary Slip
                </button>
                <button 
                  onClick={() => setShowApplyModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm"
                >
                    <Calendar size={16} /> Apply Leave
                </button>
            </div>
        </div>
      </div>

      {/* Leave Balances */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                  <Sun size={24} />
              </div>
              <div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wide">Vacation</p>
                  <h3 className="text-2xl font-bold text-slate-800">{user.leaveBalance.vacation} <span className="text-sm font-normal text-slate-400">days</span></h3>
              </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                  <Thermometer size={24} />
              </div>
              <div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wide">Sick Leave</p>
                  <h3 className="text-2xl font-bold text-slate-800">{user.leaveBalance.sick} <span className="text-sm font-normal text-slate-400">days</span></h3>
              </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                  <User size={24} />
              </div>
              <div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wide">Personal</p>
                  <h3 className="text-2xl font-bold text-slate-800">{user.leaveBalance.personal} <span className="text-sm font-normal text-slate-400">days</span></h3>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Info */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 h-fit">
            <h3 className="font-bold text-lg text-slate-800 mb-4">Personal Details</h3>
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-600">
                    <Mail size={18} className="text-slate-400" />
                    <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                    <Briefcase size={18} className="text-slate-400" />
                    <span className="text-sm">Joined: {user.joinDate}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                    <MapPin size={18} className="text-slate-400" />
                    <span className="text-sm">San Francisco, CA (Remote)</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                    <Phone size={18} className="text-slate-400" />
                    <span className="text-sm">+1 (555) 000-0000</span>
                </div>
            </div>
        </div>

        {/* Leave History */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-bold text-lg text-slate-800 mb-6">My Leave History</h3>
            <div className="space-y-4">
                {myLeaves.length === 0 ? (
                    <div className="text-center py-8">
                        <Clock size={40} className="mx-auto text-slate-200 mb-3" />
                        <p className="text-slate-400 text-sm">No leave history found.</p>
                    </div>
                ) : (
                    myLeaves.map(leave => (
                        <div key={leave.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    leave.type === 'sick' ? 'bg-red-100 text-red-600' : 
                                    leave.type === 'vacation' ? 'bg-orange-100 text-orange-600' :
                                    'bg-blue-100 text-blue-600'
                                }`}>
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <h4 className="font-medium text-slate-800 capitalize">{leave.type}</h4>
                                    <p className="text-xs text-slate-500">{leave.startDate} to {leave.endDate}</p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                leave.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                leave.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                'bg-amber-100 text-amber-700'
                            }`}>
                                {leave.status}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>

       {/* Apply Leave Modal */}
       {showApplyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in backdrop-blur-sm">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Request Time Off</h2>
            
            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                    {error}
                </div>
            )}

            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                <select 
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" 
                    value={leaveType} 
                    onChange={e => setLeaveType(e.target.value as keyof LeaveBalance)}
                >
                    <option value="vacation">Vacation ({user.leaveBalance.vacation} days left)</option>
                    <option value="sick">Sick Leave ({user.leaveBalance.sick} days left)</option>
                    <option value="personal">Personal ({user.leaveBalance.personal} days left)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                    <input required type="date" className="w-full p-2 border rounded-lg" value={startDate} onChange={e => setStartDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                    <input required type="date" className="w-full p-2 border rounded-lg" value={endDate} onChange={e => setEndDate(e.target.value)} />
                  </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea required rows={3} className="w-full p-2 border rounded-lg" value={reason} onChange={e => setReason(e.target.value)} />
              </div>
              <div className="flex gap-4 mt-6">
                <button type="button" onClick={() => {setShowApplyModal(false); setError('')}} className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeePortal;
