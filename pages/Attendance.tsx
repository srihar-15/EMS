
import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Role } from '../types';
import { 
  Clock, 
  MapPin, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  Timer,
  Coffee
} from 'lucide-react';

const Attendance: React.FC = () => {
  const { user, attendance, employees, checkIn, checkOut } = useStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Clock Ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!user) return null;

  const today = new Date().toISOString().split('T')[0];
  const isManagement = user.role === Role.ADMIN || user.role === Role.HR;

  // --- EMPLOYEE VIEW LOGIC ---
  const myTodaysRecord = attendance.find(r => r.employeeId === user.id && r.date === today);
  const myHistory = attendance.filter(r => r.employeeId === user.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const isCheckedIn = !!myTodaysRecord;
  const isCheckedOut = !!myTodaysRecord?.checkOut;

  // Stats
  const totalDays = myHistory.length;
  const onTimeDays = myHistory.filter(r => r.status === 'PRESENT').length;
  const avgHours = totalDays > 0 
    ? (myHistory.reduce((acc, r) => acc + r.totalHours, 0) / totalDays).toFixed(1)
    : '0';

  // --- ADMIN/HR VIEW LOGIC ---
  const todaysAttendance = attendance.filter(r => r.date === today);
  const absentCount = employees.length - todaysAttendance.length;
  const lateCount = todaysAttendance.filter(r => r.status === 'LATE').length;

  // Employee View Render
  if (!isManagement) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-slate-800">My Attendance</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main Clock Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-xl flex flex-col items-center justify-center relative overflow-hidden">
             {/* Decorative */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
             
             <div className="text-center z-10">
                <p className="text-slate-400 font-medium mb-2">{currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                <h1 className="text-6xl font-mono font-bold tracking-wider mb-6">
                  {currentTime.toLocaleTimeString([], { hour12: false })}
                </h1>

                {!isCheckedIn ? (
                   <button 
                    onClick={() => checkIn(user.id)}
                    className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-emerald-600 font-lg rounded-full hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 focus:ring-offset-slate-900"
                   >
                     <Clock className="mr-2 -ml-1 w-6 h-6 animate-pulse" />
                     Clock In Now
                   </button>
                ) : !isCheckedOut ? (
                    <div className="space-y-4">
                        <div className="bg-white/10 px-4 py-2 rounded-lg text-emerald-400 text-sm font-medium border border-emerald-500/30 inline-flex items-center gap-2">
                             <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                             Checked in at {new Date(myTodaysRecord.checkIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                        <br />
                        <button 
                          onClick={() => checkOut(user.id)}
                          className="inline-flex items-center justify-center px-8 py-3 font-bold text-white transition-all duration-200 bg-rose-600 rounded-full hover:bg-rose-500 hover:shadow-lg hover:shadow-rose-500/30"
                        >
                          Clock Out
                        </button>
                    </div>
                ) : (
                    <div className="bg-white/10 px-6 py-3 rounded-xl border border-white/10">
                        <p className="text-slate-300">Shift Completed</p>
                        <p className="text-2xl font-bold">{myTodaysRecord.totalHours} hrs</p>
                    </div>
                )}
             </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-3">
                    <Calendar size={20} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">{totalDays}</h3>
                <p className="text-sm text-slate-500">Days Worked</p>
             </div>
             <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-3">
                    <Timer size={20} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">{avgHours}</h3>
                <p className="text-sm text-slate-500">Avg. Hours/Day</p>
             </div>
             <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center mb-3">
                    <CheckCircle size={20} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">{onTimeDays}</h3>
                <p className="text-sm text-slate-500">On Time Arrivals</p>
             </div>
             <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-3">
                    <MapPin size={20} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">Remote</h3>
                <p className="text-sm text-slate-500">Current Location</p>
             </div>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-6">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-800">Attendance History</h3>
            </div>
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                    <tr>
                        <th className="px-6 py-3 font-medium">Date</th>
                        <th className="px-6 py-3 font-medium">Check In</th>
                        <th className="px-6 py-3 font-medium">Check Out</th>
                        <th className="px-6 py-3 font-medium">Status</th>
                        <th className="px-6 py-3 font-medium text-right">Total Hours</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {myHistory.map(record => (
                        <tr key={record.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 font-medium text-slate-700">{record.date}</td>
                            <td className="px-6 py-4 text-slate-600">{new Date(record.checkIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                            <td className="px-6 py-4 text-slate-600">
                                {record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                    record.status === 'LATE' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                                }`}>
                                    {record.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right font-medium text-slate-800">
                                {record.totalHours > 0 ? `${record.totalHours} h` : '-'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    );
  }

  // --- ADMIN / HR VIEW ---
  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-800">Daily Attendance Overview</h2>
            <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-medium shadow-sm">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-emerald-500">
                <p className="text-slate-500 text-xs font-bold uppercase">Present</p>
                <h3 className="text-3xl font-bold text-slate-800">{todaysAttendance.length}</h3>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-rose-500">
                <p className="text-slate-500 text-xs font-bold uppercase">Absent</p>
                <h3 className="text-3xl font-bold text-slate-800">{absentCount}</h3>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-amber-500">
                <p className="text-slate-500 text-xs font-bold uppercase">Late Arrivals</p>
                <h3 className="text-3xl font-bold text-slate-800">{lateCount}</h3>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-blue-500">
                <p className="text-slate-500 text-xs font-bold uppercase">On Leave</p>
                <h3 className="text-3xl font-bold text-slate-800">0</h3>
            </div>
        </div>

        {/* Master List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Today's Muster List</h3>
            </div>
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                    <tr>
                        <th className="px-6 py-3 font-medium">Employee</th>
                        <th className="px-6 py-3 font-medium">Department</th>
                        <th className="px-6 py-3 font-medium">Check In</th>
                        <th className="px-6 py-3 font-medium">Status</th>
                        <th className="px-6 py-3 font-medium text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {employees.map(emp => {
                        const record = todaysAttendance.find(r => r.employeeId === emp.id);
                        return (
                            <tr key={emp.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <img src={emp.avatar} className="w-8 h-8 rounded-full" alt="" />
                                        <span className="font-medium text-slate-900">{emp.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-500">{emp.department}</td>
                                <td className="px-6 py-4 font-mono text-slate-600">
                                    {record ? new Date(record.checkIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                                </td>
                                <td className="px-6 py-4">
                                    {record ? (
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                            record.status === 'LATE' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                                        }`}>
                                            {record.status}
                                        </span>
                                    ) : (
                                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500">
                                            ABSENT
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-indigo-600 hover:text-indigo-800 text-xs font-medium">View Log</button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default Attendance;