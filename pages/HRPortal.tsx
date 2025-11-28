
import React from 'react';
import { useStore } from '../store/useStore';
import { LeaveStatus } from '../types';
import { CheckCircle, XCircle, Calendar, Clock, AlertCircle } from 'lucide-react';

const HRPortal: React.FC = () => {
  const { leaves, employees, updateLeaveStatus } = useStore();
  const pendingLeaves = leaves.filter(l => l.status === LeaveStatus.PENDING);
  const historyLeaves = leaves.filter(l => l.status !== LeaveStatus.PENDING);

  // Helper to get employee balance for context
  const getEmployeeBalance = (empId: string, type: string) => {
    const emp = employees.find(e => e.id === empId);
    // @ts-ignore - dynamic key access
    return emp ? emp.leaveBalance[type] : 0;
  };

  const calculateDays = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = Math.abs(e.getTime() - s.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Leave Management</h2>
          <p className="text-slate-500 mt-1">Review and manage employee leave requests</p>
        </div>
        <div className="flex gap-2">
            <span className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium flex items-center gap-2">
                <Clock size={16} /> Pending: {pendingLeaves.length}
            </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pendingLeaves.length > 0 ? pendingLeaves.map(leave => {
          const balance = getEmployeeBalance(leave.employeeId, leave.type);
          const daysRequested = calculateDays(leave.startDate, leave.endDate);
          const isRisky = daysRequested > balance;

          return (
          <div key={leave.id} className="bg-white rounded-xl p-6 shadow-sm border border-l-4 border-l-amber-400 border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-bold text-slate-800 text-lg">{leave.employeeName}</h4>
                <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mt-1">{leave.type}</p>
              </div>
              <span className="px-2 py-1 bg-amber-50 text-amber-600 text-xs rounded-md font-medium">Review Needed</span>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar size={16} className="text-slate-400" />
                <span>{leave.startDate} <span className="text-slate-300 mx-1">→</span> {leave.endDate}</span>
              </div>
              <div className="flex justify-between items-center text-xs p-2 bg-slate-50 rounded border border-slate-100">
                  <span className="text-slate-500">Requested: <strong className="text-slate-700">{daysRequested} days</strong></span>
                  <span className={`${isRisky ? 'text-red-600 font-bold' : 'text-slate-500'}`}>
                    Balance: {balance} days
                  </span>
              </div>
              {isRisky && (
                  <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                      <AlertCircle size={14} />
                      <span>Insufficient balance warning</span>
                  </div>
              )}
              <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg italic border border-slate-100">
                "{leave.reason}"
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => updateLeaveStatus(leave.id, LeaveStatus.APPROVED)}
                className="flex items-center justify-center gap-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                <CheckCircle size={16} /> Approve
              </button>
              <button 
                onClick={() => updateLeaveStatus(leave.id, LeaveStatus.REJECTED)}
                className="flex items-center justify-center gap-2 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
              >
                <XCircle size={16} /> Reject
              </button>
            </div>
          </div>
        )}) : (
            <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-slate-300">
                <p className="text-slate-500">No pending leave requests at this time.</p>
            </div>
        )}
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-bold text-slate-800 mb-4">History Log</h3>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">Employee</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Dates</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {historyLeaves.map(leave => (
                <tr key={leave.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-medium text-slate-700">{leave.employeeName}</td>
                  <td className="px-6 py-3 text-slate-600 capitalize">{leave.type}</td>
                  <td className="px-6 py-3 text-slate-500">{leave.startDate} to {leave.endDate}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                      leave.status === LeaveStatus.APPROVED ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {leave.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HRPortal;
