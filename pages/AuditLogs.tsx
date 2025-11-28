
import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Search, Shield, Filter, Download, ChevronLeft, ChevronRight, X, Calendar, Eye, FileText } from 'lucide-react';
import { Role, AuditLog } from '../types';

const AuditLogs: React.FC = () => {
  const { logs, employees } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  
  // New State Features
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // 1. Advanced Filtering Logic
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = 
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.target.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === 'ALL' || log.userRole === roleFilter;

      let matchesDate = true;
      if (startDate) {
        matchesDate = matchesDate && new Date(log.timestamp) >= new Date(startDate);
      }
      if (endDate) {
        // Set end date to end of day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && new Date(log.timestamp) <= end;
      }

      return matchesSearch && matchesRole && matchesDate;
    });
  }, [logs, searchTerm, roleFilter, startDate, endDate]);

  // 2. Pagination Logic
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 3. Helper Functions
  const getActionColor = (action: string) => {
    if (action.includes('DELETE') || action.includes('REJECT') || action.includes('VIOLATION')) return 'bg-red-100 text-red-700 border-red-200';
    if (action.includes('ADD') || action.includes('APPROVE') || action.includes('CREATE')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (action.includes('UPDATE')) return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getActionIndicator = (action: string) => {
    if (action.includes('DELETE') || action.includes('REJECT') || action.includes('VIOLATION')) return 'bg-red-500';
    if (action.includes('ADD') || action.includes('APPROVE') || action.includes('CREATE')) return 'bg-emerald-500';
    if (action.includes('UPDATE')) return 'bg-blue-500';
    return 'bg-slate-400';
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getUserAvatar = (userId: string, userName: string) => {
    const emp = employees.find(e => e.id === userId);
    return emp ? emp.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`;
  };

  // 4. Export to CSV Feature
  const handleExport = () => {
    const headers = ['Timestamp', 'User', 'Role', 'Action', 'Target', 'Details'];
    const csvContent = [
      headers.join(','),
      ...filteredLogs.map(log => [
        `"${log.timestamp}"`,
        `"${log.userName}"`,
        `"${log.userRole}"`,
        `"${log.action}"`,
        `"${log.target}"`,
        `"${log.details || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col animate-fade-in relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Shield className="text-indigo-600" />
            System Audit Logs
          </h2>
          <p className="text-slate-500 mt-1">Immutable record of all system activities.</p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium shadow-sm"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        {/* Search */}
        <div className="md:col-span-4 relative">
          <label className="text-xs font-semibold text-slate-500 mb-1 block">Search Query</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search user, action..." 
              className="pl-9 pr-4 py-2 w-full bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Date Range */}
        <div className="md:col-span-3">
          <label className="text-xs font-semibold text-slate-500 mb-1 block">From Date</label>
          <div className="relative">
             <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
             <input 
              type="date" 
              className="pl-9 pr-3 py-2 w-full bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-600"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
        </div>
        <div className="md:col-span-3">
          <label className="text-xs font-semibold text-slate-500 mb-1 block">To Date</label>
          <div className="relative">
             <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
             <input 
              type="date" 
              className="pl-9 pr-3 py-2 w-full bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-600"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* Role Filter */}
        <div className="md:col-span-2">
          <label className="text-xs font-semibold text-slate-500 mb-1 block">Role</label>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <select 
              className="pl-8 pr-3 py-2 w-full bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm appearance-none"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">All Roles</option>
              <option value={Role.ADMIN}>Admin</option>
              <option value={Role.HR}>HR</option>
              <option value={Role.EMPLOYEE}>Employee</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col flex-1 overflow-hidden relative">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="w-1"></th> {/* Indicator Stripe */}
                <th className="px-6 py-4 whitespace-nowrap">Timestamp</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Target</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors group">
                  <td className={`w-1 ${getActionIndicator(log.action)}`}></td>
                  <td className="px-6 py-4 font-mono text-slate-500 text-xs whitespace-nowrap">
                    {formatDate(log.timestamp)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={getUserAvatar(log.userId, log.userName)} 
                        alt={log.userName} 
                        className="w-8 h-8 rounded-full border border-slate-200"
                      />
                      <div>
                        <p className="font-medium text-slate-900">{log.userName}</p>
                        <p className="text-xs text-slate-400 capitalize">{log.userRole.toLowerCase()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded border whitespace-nowrap ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-800 font-medium whitespace-nowrap">
                    {log.target}
                  </td>
                  <td className="px-6 py-4 text-slate-500 max-w-xs truncate" title={log.details}>
                    {log.details || '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedLog(log)}
                      className="text-slate-400 hover:text-indigo-600 p-2 rounded-full hover:bg-indigo-50 transition-colors"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedLogs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-slate-400 bg-slate-50/50">
                    <div className="flex flex-col items-center">
                        <FileText size={48} className="mb-4 text-slate-300" />
                        <p>No logs found matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="border-t border-slate-200 p-4 bg-slate-50 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <div className="text-slate-500 flex items-center gap-4">
            <span>Showing {Math.min(filteredLogs.length, (currentPage - 1) * itemsPerPage + 1)} to {Math.min(filteredLogs.length, currentPage * itemsPerPage)} of {filteredLogs.length} entries</span>
            
            <select 
              className="bg-white border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-medium text-slate-700">
              Page {currentPage} of {Math.max(1, totalPages)}
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Side Drawer (Slide-over) */}
      {selectedLog && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity" 
            onClick={() => setSelectedLog(null)}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">Log Details</h3>
              <button 
                onClick={() => setSelectedLog(null)}
                className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
                <div className="flex items-center gap-4 mb-6">
                     <img 
                        src={getUserAvatar(selectedLog.userId, selectedLog.userName)} 
                        alt={selectedLog.userName} 
                        className="w-16 h-16 rounded-full border-4 border-slate-50 shadow-sm"
                      />
                      <div>
                          <p className="text-xl font-bold text-slate-800">{selectedLog.userName}</p>
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full font-bold tracking-wide">
                            {selectedLog.userRole}
                          </span>
                      </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Action</label>
                        <span className={`inline-block px-3 py-1 rounded-lg text-sm font-bold border ${getActionColor(selectedLog.action)}`}>
                            {selectedLog.action}
                        </span>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Timestamp</label>
                        <p className="text-slate-800 font-mono text-sm bg-slate-50 p-2 rounded border border-slate-100">
                            {new Date(selectedLog.timestamp).toUTCString()}
                        </p>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Target Entity</label>
                        <p className="text-slate-800 font-medium text-lg border-b border-slate-100 pb-2">
                            {selectedLog.target}
                        </p>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Full Details</label>
                        <div className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs font-mono overflow-x-auto shadow-inner leading-relaxed">
                            {selectedLog.details || "No additional details recorded."}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Log ID</label>
                        <p className="text-slate-400 text-xs font-mono select-all">
                            {selectedLog.id}
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 text-center text-xs text-slate-400">
                Secure Audit Record • Nexus HR System
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AuditLogs;
