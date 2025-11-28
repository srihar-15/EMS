
import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Role, PerformanceReview } from '../types';
import { 
  Star, 
  TrendingUp, 
  Target, 
  Award, 
  Plus, 
  Search, 
  User,
  Calendar
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const Performance: React.FC = () => {
  const { user, employees, reviews, addPerformanceReview } = useStore();
  const [selectedEmpId, setSelectedEmpId] = useState<string>(
    user?.role === Role.EMPLOYEE ? user.id : ''
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [rating, setRating] = useState(3);
  const [feedback, setFeedback] = useState('');
  const [goalsText, setGoalsText] = useState('');

  const isManagement = user?.role === Role.ADMIN || user?.role === Role.HR;

  // Filter employees for sidebar (Management only)
  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) && e.role === Role.EMPLOYEE
  );

  // Get data for selected employee
  const employeeReviews = reviews
    .filter(r => r.employeeId === selectedEmpId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const selectedEmployee = employees.find(e => e.id === selectedEmpId);

  // Chart Data: Format dates for readability
  const chartData = employeeReviews.map(r => ({
    date: new Date(r.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    rating: r.rating
  }));

  // Latest Review for Goals
  const latestReview = employeeReviews.length > 0 
    ? employeeReviews[employeeReviews.length - 1] 
    : null;

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedEmpId) return;

    const newReview: PerformanceReview = {
      id: Date.now().toString(),
      employeeId: selectedEmpId,
      reviewerId: user.id,
      reviewerName: user.name,
      rating,
      feedback,
      goals: goalsText.split('\n').filter(g => g.trim() !== ''),
      date: new Date().toISOString()
    };

    addPerformanceReview(newReview);
    setShowAddModal(false);
    // Reset form
    setFeedback('');
    setGoalsText('');
    setRating(3);
  };

  const renderStars = (count: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Star 
            key={star} 
            size={16} 
            className={`${star <= count ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="animate-fade-in h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="text-indigo-600" />
            Performance Management
          </h2>
          <p className="text-slate-500 mt-1">Track growth, assign goals, and review feedback.</p>
        </div>
        {isManagement && selectedEmpId && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus size={18} /> Add Review
          </button>
        )}
      </div>

      <div className="flex gap-6 h-full items-start">
        
        {/* LEFT COLUMN: Employee Selection (Management Only) */}
        {isManagement && (
          <div className="w-80 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-180px)]">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Find employee..." 
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="overflow-y-auto flex-1">
              {filteredEmployees.map(emp => (
                <button
                  key={emp.id}
                  onClick={() => setSelectedEmpId(emp.id)}
                  className={`w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 ${
                    selectedEmpId === emp.id ? 'bg-indigo-50 border-indigo-100' : ''
                  }`}
                >
                  <img src={emp.avatar} alt={emp.name} className="w-10 h-10 rounded-full bg-slate-200" />
                  <div className="text-left">
                    <p className={`font-medium text-sm ${selectedEmpId === emp.id ? 'text-indigo-900' : 'text-slate-700'}`}>
                      {emp.name}
                    </p>
                    <p className="text-xs text-slate-500">{emp.department}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* RIGHT COLUMN: Dashboard & Details */}
        <div className="flex-1 space-y-6">
          {!selectedEmpId ? (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center h-96 flex flex-col items-center justify-center text-slate-400">
              <User size={48} className="mb-4 opacity-50" />
              <p>Select an employee from the list to view their performance records.</p>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wide mb-2">Average Rating</p>
                  <div className="flex items-end gap-2">
                    <h3 className="text-4xl font-bold text-slate-800">
                      {(employeeReviews.reduce((acc, r) => acc + r.rating, 0) / (employeeReviews.length || 1)).toFixed(1)}
                    </h3>
                    <div className="mb-1">{renderStars(Math.round(employeeReviews.reduce((acc, r) => acc + r.rating, 0) / (employeeReviews.length || 1)))}</div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wide mb-2">Reviews Completed</p>
                  <h3 className="text-4xl font-bold text-slate-800">{employeeReviews.length}</h3>
                </div>

                <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-6 rounded-xl shadow-md text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="text-indigo-200" size={18} />
                    <p className="text-indigo-100 text-xs font-bold uppercase tracking-wide">Active Goals</p>
                  </div>
                  <h3 className="text-4xl font-bold">{latestReview?.goals.length || 0}</h3>
                  <p className="text-xs text-indigo-200 mt-1">From last review cycle</p>
                </div>
              </div>

              {/* Chart & Goals Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance Trend Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <TrendingUp size={18} className="text-slate-400" />
                    Rating History
                  </h3>
                  <div className="h-64">
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="date" stroke="#94a3b8" tick={{fontSize: 12}} />
                          <YAxis domain={[0, 5]} stroke="#94a3b8" tick={{fontSize: 12}} ticks={[1, 2, 3, 4, 5]} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="rating" 
                            stroke="#4f46e5" 
                            strokeWidth={3} 
                            dot={{ fill: '#4f46e5', r: 4, strokeWidth: 2, stroke: '#fff' }} 
                            activeDot={{ r: 6 }} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
                        No historical data available yet.
                      </div>
                    )}
                  </div>
                </div>

                {/* Current Goals */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Target size={18} className="text-slate-400" />
                    Current Goals
                  </h3>
                  {latestReview && latestReview.goals.length > 0 ? (
                    <ul className="space-y-3">
                      {latestReview.goals.map((goal, idx) => (
                        <li key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <div className="mt-1 min-w-[16px]">
                            <div className="w-4 h-4 rounded-full border-2 border-indigo-400"></div>
                          </div>
                          <span className="text-sm text-slate-700 leading-relaxed">{goal}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-400 text-sm italic">No active goals assigned.</p>
                  )}
                </div>
              </div>

              {/* Review History List */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50">
                   <h3 className="font-bold text-slate-800">Review Log</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {employeeReviews.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-sm">No reviews found for this employee.</div>
                  ) : (
                    [...employeeReviews].reverse().map(review => (
                      <div key={review.id} className="p-6 hover:bg-slate-50 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                             <div className="bg-indigo-100 text-indigo-700 font-bold px-3 py-1 rounded text-xs uppercase tracking-wide">
                                {new Date(review.date).toLocaleDateString()}
                             </div>
                             <span className="text-sm text-slate-500">Reviewed by <span className="font-medium text-slate-700">{review.reviewerName}</span></span>
                          </div>
                          {renderStars(review.rating)}
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed">
                          {review.feedback}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add Review Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-1 text-slate-800">New Performance Review</h2>
            <p className="text-slate-500 text-sm mb-6">Evaluating {selectedEmployee?.name}</p>
            
            <form onSubmit={handleAddReview} className="space-y-5">
              
              {/* Rating Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Overall Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`p-2 rounded-full transition-all ${
                        rating >= star ? 'text-amber-400 scale-110' : 'text-slate-300 hover:text-amber-200'
                      }`}
                    >
                      <Star size={28} fill={rating >= star ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Feedback & Observations</label>
                <textarea 
                  required 
                  rows={4} 
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="Detailed feedback about strengths and areas for improvement..."
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                />
              </div>

              {/* Goals Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Goals for Next Period</label>
                <textarea 
                  rows={3} 
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="Enter goals separated by new lines..."
                  value={goalsText}
                  onChange={e => setGoalsText(e.target.value)}
                />
                <p className="text-xs text-slate-400 mt-1">Separate each goal with a new line.</p>
              </div>

              <div className="flex gap-3 mt-8 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)} 
                  className="flex-1 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors shadow-sm"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Performance;
