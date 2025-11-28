

import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { Users, DollarSign, TrendingUp, Sparkles, Search, Trash2, Plus, AlertTriangle, Briefcase, CheckCircle, XCircle, Edit2 } from 'lucide-react';
import { analyzeWorkforceData } from '../services/geminiService';
import { Role, LeaveStatus } from '../types';

const AdminDashboard: React.FC = () => {
  const { employees, leaves, budgets, deleteEmployee, addEmployee, updateLeaveStatus, addNotification, updateDepartmentBudget, user } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Budget Edit State
  const [editingBudget, setEditingBudget] = useState<string | null>(null);
  const [newBudgetAmount, setNewBudgetAmount] = useState<number>(0);

  // New Employee State
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpEmail, setNewEmpEmail] = useState('');
  const [newEmpDept, setNewEmpDept] = useState('');
  const [newEmpSalary, setNewEmpSalary] = useState('');

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: employees.length,
    avgSalary: Math.round(employees.reduce((acc, e) => acc + e.salary, 0) / employees.length),
    pending: leaves.filter(l => l.status === 'PENDING').length,
    escalated: leaves.filter(l => l.status === LeaveStatus.PENDING_ADMIN).length
  };

  // Chart Data Preparation
  const deptData = employees.reduce((acc: any[], emp) => {
    const existing = acc.find(x => x.name === emp.department);
    if (existing) existing.value++;
    else acc.push({ name: emp.department, value: 1 });
    return acc;
  }, []);

  const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'];

  const handleAiAnalysis = async () => {
    setLoadingAi(true);
    const insight = await analyzeWorkforceData(employees, leaves);
    setAiInsight(insight);
    
    // Auto-notify admin if high risk is detected in the response
    if (insight && user) {
        if (insight.toLowerCase().includes('risk') || insight.toLowerCase().includes('burnout')) {
            addNotification(user.id, "AI detected potential workforce risks. Review the analysis panel immediately.", 'warning');
        } else {
            addNotification(user.id, "Workforce analysis completed successfully.", 'success');
        }
    }
    
    setLoadingAi(false);
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const newEmp = {
      id: Math.random().toString(36).substr(2, 9),
      name: newEmpName,
      email: newEmpEmail,
      department: newEmpDept,
      salary: Number(newEmpSalary),
      role: Role.EMPLOYEE,
      joinDate: new Date().toISOString().split('T')[0],
      avatar: `https://picsum.photos/seed/${Math.random()}/200/200`,
      leaveBalance: { vacation: 20, sick: 10, personal: 5 } // Default balance for new hires
    };
    addEmployee(newEmp);
    setShowAddModal(false);
    // Reset form
    setNewEmpName('');
    setNewEmpEmail('');
    setNewEmpDept('');
    setNewEmpSalary('');
  };

  // Budget Calculations
  const financialData = budgets.map(b => {
      const spend = employees
        .filter(e => e.department === b.department)
        .reduce((sum, e) => sum + e.salary, 0);
      const percent = Math.min(100, (spend / b.allocated) * 100);
      return { ...b, spend, percent };
  });

  const handleBudgetUpdate = (dept: string) => {
      updateDepartmentBudget(dept, newBudgetAmount);
      setEditingBudget(null);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Total Employees</p>
            <h3 className="text-3xl font-bold text-slate-800">{stats.total}</h3>
          </div>
          <div className="bg-indigo-50 p-3 rounded-full text-indigo-600"><Users size={24} /></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Avg. Salary</p>
            <h3 className="text-3xl font-bold text-slate-800">${stats.avgSalary.toLocaleString()}</h3>
          </div>
          <div className="bg-emerald-50 p-3 rounded-full text-emerald-600"><DollarSign size={24} /></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Pending Leaves</p>
            <h3 className="text-3xl font-bold text-slate-800">{stats.pending}</h3>
          </div>
          <div className="bg-amber-50 p-3 rounded-full text-amber-600"><TrendingUp size={24} /></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Exec Approvals</p>
            <h3 className="text-3xl font-bold text-slate-800">{stats.escalated}</h3>
          </div>
          <div className="bg-rose-50 p-3 rounded-full text-rose-600"><AlertTriangle size={24} /></div>
        </div>
      </div>

      {/* AI Insight Section */}
      <div className="bg-gradient-to-r from-indigo-900 to-violet-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="text-amber-400" />
              Gemini Workforce AI Analyst
            </h2>
            <button 
              onClick={handleAiAnalysis}
              disabled={loadingAi}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
            >
              {loadingAi ? 'Analyzing Data...' : 'Run Analysis'}
            </button>
          </div>
          
          {aiInsight ? (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-sm leading-relaxed border border-white/10" dangerouslySetInnerHTML={{ __html: aiInsight }} />
          ) : (
            <p className="text-indigo-200 text-sm">Click 'Run Analysis' to let Gemini scan your workforce data for anomalies, salary equity, and turnover risks.</p>
          )}
        </div>
        
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Executive Approvals Widget */}
            {stats.escalated > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-rose-100 overflow-hidden">
                    <div className="bg-rose-50 px-6 py-4 border-b border-rose-100 flex items-center justify-between">
                        <h3 className="text-rose-800 font-bold flex items-center gap-2">
                            <AlertTriangle size={18} /> Executive Approvals Required
                        </h3>
                        <span className="bg-rose-200 text-rose-800 px-2 py-0.5 rounded-full text-xs font-bold">{stats.escalated} Pending</span>
                    </div>
                    <div className="divide-y divide-rose-50">
                        {leaves.filter(l => l.status === LeaveStatus.PENDING_ADMIN).map(leave => (
                            <div key={leave.id} className="p-4 flex items-center justify-between hover:bg-rose-50/30 transition-colors">
                                <div>
                                    <p className="font-medium text-slate-800">{leave.employeeName} <span className="text-slate-400 font-normal">requested</span> {leave.type}</p>
                                    <p className="text-xs text-slate-500">{leave.startDate} to {leave.endDate} • {leave.reason}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => updateLeaveStatus(leave.id, LeaveStatus.APPROVED)}
                                        className="text-emerald-600 hover:bg-emerald-50 p-2 rounded-lg transition-colors" title="Approve"
                                    >
                                        <CheckCircle size={20} />
                                    </button>
                                    <button 
                                        onClick={() => updateLeaveStatus(leave.id, LeaveStatus.REJECTED)}
                                        className="text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition-colors" title="Reject"
                                    >
                                        <XCircle size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Department Budgets */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-center justify-between mb-6">
                     <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <Briefcase className="text-slate-400" size={20} />
                        Departmental Budgets (2024)
                     </h3>
                     <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Financial Overview</span>
                </div>
                
                <div className="space-y-6">
                    {financialData.map((item, idx) => (
                        <div key={idx}>
                             <div className="flex justify-between items-end mb-1">
                                <div>
                                    <span className="font-bold text-slate-700">{item.department}</span>
                                    {editingBudget === item.department ? (
                                        <div className="flex gap-2 mt-1">
                                            <input 
                                                type="number" 
                                                className="border rounded px-2 py-0.5 text-xs w-24" 
                                                value={newBudgetAmount} 
                                                onChange={e => setNewBudgetAmount(Number(e.target.value))}
                                            />
                                            <button onClick={() => handleBudgetUpdate(item.department)} className="text-xs bg-indigo-600 text-white px-2 rounded">Save</button>
                                            <button onClick={() => setEditingBudget(null)} className="text-xs text-slate-500">Cancel</button>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => { setEditingBudget(item.department); setNewBudgetAmount(item.allocated); }}
                                            className="ml-2 text-slate-300 hover:text-indigo-600 transition-colors"
                                        >
                                            <Edit2 size={12} />
                                        </button>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-slate-800">
                                        ${item.spend.toLocaleString()} <span className="text-slate-400">/ ${item.allocated.toLocaleString()}</span>
                                    </p>
                                </div>
                             </div>
                             <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                <div 
                                    className={`h-2.5 rounded-full ${
                                        item.percent > 90 ? 'bg-red-500' : 
                                        item.percent > 75 ? 'bg-amber-400' : 'bg-emerald-500'
                                    }`} 
                                    style={{ width: `${item.percent}%` }}
                                ></div>
                             </div>
                             <p className="text-xs text-right mt-1 text-slate-400">{item.percent.toFixed(1)}% Utilized</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Employee Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-lg text-slate-800">Employee Directory</h3>
                <div className="flex gap-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                    type="text" 
                    placeholder="Search..." 
                    className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition-colors"
                >
                    <Plus size={20} />
                </button>
                </div>
            </div>
            
            <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                    <tr>
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <img src={emp.avatar} alt="" className="w-9 h-9 rounded-full bg-slate-200" />
                            <div>
                            <p className="text-sm font-medium text-slate-900">{emp.name}</p>
                            <p className="text-xs text-slate-500">{emp.department}</p>
                            </div>
                        </div>
                        </td>
                        <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            emp.role === Role.ADMIN ? 'bg-purple-100 text-purple-800' :
                            emp.role === Role.HR ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                        }`}>
                            {emp.role}
                        </span>
                        </td>
                        <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <span className="text-sm text-slate-600">Active</span>
                        </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                        <button 
                            onClick={() => deleteEmployee(emp.id)}
                            className="text-slate-400 hover:text-red-600 transition-colors p-1"
                            title="Remove Employee"
                        >
                            <Trash2 size={16} />
                        </button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
             {/* Department Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-bold text-lg text-slate-800 mb-6">Distribution</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                    data={deptData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    >
                    {deptData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
                {deptData.map((entry, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="text-slate-600">{entry.name}</span>
                    </div>
                    <span className="font-medium text-slate-800">{entry.value}</span>
                </div>
                ))}
            </div>
            </div>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Employee</h2>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input required type="text" className="w-full p-2 border rounded-lg" value={newEmpName} onChange={e => setNewEmpName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input required type="email" className="w-full p-2 border rounded-lg" value={newEmpEmail} onChange={e => setNewEmpEmail(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input required type="text" className="w-full p-2 border rounded-lg" value={newEmpDept} onChange={e => setNewEmpDept(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
                <input required type="number" className="w-full p-2 border rounded-lg" value={newEmpSalary} onChange={e => setNewEmpSalary(e.target.value)} />
              </div>
              <div className="flex gap-4 mt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Add Employee</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;