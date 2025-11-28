

import { create } from 'zustand';
import { Employee, LeaveRequest, Role, LeaveStatus, AuditLog, PerformanceReview, Notification, AttendanceRecord, DepartmentBudget } from '../types';
import { INITIAL_EMPLOYEES, INITIAL_LEAVES, INITIAL_LOGS, INITIAL_REVIEWS, INITIAL_NOTIFICATIONS, INITIAL_ATTENDANCE, INITIAL_BUDGETS } from '../services/mockData';

interface AppState {
  user: Employee | null;
  employees: Employee[];
  leaves: LeaveRequest[];
  logs: AuditLog[];
  reviews: PerformanceReview[];
  notifications: Notification[];
  attendance: AttendanceRecord[];
  budgets: DepartmentBudget[];
  
  // Actions
  login: (email: string) => boolean;
  logout: () => void;
  
  // Modifiers
  addEmployee: (emp: Employee) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  addLeaveRequest: (req: LeaveRequest) => void;
  updateLeaveStatus: (id: string, status: LeaveStatus) => void;
  addPerformanceReview: (review: PerformanceReview) => void;
  updateDepartmentBudget: (department: string, amount: number) => void;
  
  // Attendance
  checkIn: (employeeId: string) => void;
  checkOut: (employeeId: string) => void;
  
  // Notifications
  addNotification: (userId: string, message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  // Internal helper to create logs
  logAction: (action: string, target: string, details?: string) => void;
}

// Helper to calculate days between two dates (inclusive)
const calculateDays = (start: string, end: string): number => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

export const useStore = create<AppState>((set, get) => ({
  user: null,
  employees: INITIAL_EMPLOYEES,
  leaves: INITIAL_LEAVES,
  logs: INITIAL_LOGS,
  reviews: INITIAL_REVIEWS,
  notifications: INITIAL_NOTIFICATIONS,
  attendance: INITIAL_ATTENDANCE,
  budgets: INITIAL_BUDGETS,

  logAction: (action, target, details) => {
    const { user, logs } = get();
    // In a real app, system actions might happen without a user, 
    // but here we assume logged-in user actions
    const currentUser = user || { id: 'sys', name: 'System', role: Role.ADMIN }; 
    
    const newLog: AuditLog = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      userId: currentUser.id as string,
      userName: currentUser.name,
      userRole: currentUser.role as Role,
      action,
      target,
      timestamp: new Date().toISOString(),
      details
    };

    set({ logs: [newLog, ...logs] });
  },

  login: (email: string) => {
    const user = get().employees.find(e => e.email === email);
    if (user) {
      set({ user });
      return true;
    }
    return false;
  },

  logout: () => set({ user: null }),

  addEmployee: (emp) => {
    const { user, logAction } = get();
    
    // SECURITY CHECK
    if (user?.role !== Role.ADMIN) {
      logAction('SECURITY_VIOLATION', 'addEmployee', `Unauthorized attempt by ${user?.name} to add employee`);
      alert("Access Denied: Only Administrators can add employees.");
      return;
    }

    logAction('ADD_EMPLOYEE', emp.name, `Added to ${emp.department} department`);
    set((state) => ({ 
      employees: [...state.employees, emp] 
    }));
  },

  updateEmployee: (id, updates) => {
    const { user, employees, logAction, addNotification } = get();
    const emp = employees.find(e => e.id === id);
    
    if (!emp) return;

    // SECURITY CHECK: Only Admin or HR can update others. Users can update themselves (logic tailored for profile).
    const hasPermission = user?.role === Role.ADMIN || user?.role === Role.HR || user?.id === id;

    if (!hasPermission) {
      logAction('SECURITY_VIOLATION', 'updateEmployee', `Unauthorized update attempt on ${emp.name} by ${user?.name}`);
      return;
    }

    logAction('UPDATE_PROFILE', emp.name, `Updated fields: ${Object.keys(updates).join(', ')}`);
    
    // Notify the employee that their profile was updated by someone else
    if (user?.id !== id) {
        addNotification(id, `Your profile was updated by ${user?.role} ${user?.name}.`, 'info');
    }

    set((state) => ({
      employees: state.employees.map(e => e.id === id ? { ...e, ...updates } : e)
    }));
  },

  deleteEmployee: (id) => {
    const { user, employees, logAction } = get();
    
    // SECURITY CHECK
    if (user?.role !== Role.ADMIN) {
      logAction('SECURITY_VIOLATION', 'deleteEmployee', `Unauthorized attempt by ${user?.name} to delete employee`);
      alert("Access Denied: Only Administrators can delete records.");
      return;
    }

    const emp = employees.find(e => e.id === id);
    if (emp) {
      logAction('DELETE_EMPLOYEE', emp.name, `Removed from ${emp.department}`);
      set((state) => ({
        employees: state.employees.filter(e => e.id !== id)
      }));
    }
  },

  addLeaveRequest: (req) => {
    const { logAction, employees, addNotification } = get();
    // Employees can add leaves. No strict role check needed other than being logged in (implied).
    logAction('APPLY_LEAVE', req.type, `${req.startDate} to ${req.endDate}`);
    
    // NOTIFICATION: Notify all HRs
    const hrUsers = employees.filter(e => e.role === Role.HR);
    hrUsers.forEach(hr => {
        addNotification(hr.id, `New ${req.type} leave request from ${req.employeeName}`, 'info');
    });

    set((state) => ({
      leaves: [req, ...state.leaves]
    }));
  },

  updateLeaveStatus: (id, status) => {
    const { user, leaves, employees, logAction, addNotification } = get();

    // SECURITY CHECK: Level 1 (HR) or Level 2 (Admin)
    const leave = leaves.find(l => l.id === id);
    if (!leave) return;

    // If status is PENDING_ADMIN, only ADMIN can act
    if (leave.status === LeaveStatus.PENDING_ADMIN) {
         if (user?.role !== Role.ADMIN) {
            logAction('SECURITY_VIOLATION', 'updateLeaveStatus', `User ${user?.name} tried to approve Executive Level leave without Admin privileges.`);
            alert("Executive Approval Required: Only Admins can approve this request.");
            return;
         }
    } else {
        // Standard leaves: HR or Admin
        if (user?.role !== Role.HR && user?.role !== Role.ADMIN) {
            logAction('SECURITY_VIOLATION', 'updateLeaveStatus', `Unauthorized approval attempt by ${user?.name}`);
            return;
        }
    }

    // MULTI-LEVEL WORKFLOW:
    // If HR approves a long leave (>3 days), it escalates to PENDING_ADMIN instead of APPROVED
    if (status === LeaveStatus.APPROVED && leave.status === LeaveStatus.PENDING && user?.role === Role.HR) {
         const duration = calculateDays(leave.startDate, leave.endDate);
         if (duration > 3) {
             status = LeaveStatus.PENDING_ADMIN; // Escalation
             logAction('ESCALATE_LEAVE', leave.employeeName, `Escalated to Admin (Duration: ${duration} days)`);
         }
    }

    // FINAL APPROVAL LOGIC (Deduction)
    if (status === LeaveStatus.APPROVED) {
      const emp = employees.find(e => e.id === leave.employeeId);
      if (emp) {
        const days = calculateDays(leave.startDate, leave.endDate);
        const currentBalance = emp.leaveBalance[leave.type];
        
        // Update Employee Balance
        const updatedBalance = { ...emp.leaveBalance, [leave.type]: currentBalance - days };
        
        set((state) => ({
            employees: state.employees.map(e => e.id === emp.id ? { ...e, leaveBalance: updatedBalance } : e)
        }));
        
        logAction('BALANCE_DEDUCTION', emp.name, `Deducted ${days} days from ${leave.type} (Remaining: ${updatedBalance[leave.type]})`);
      }
    }

    logAction(`${status}_LEAVE`, leave.employeeName, `Leave type: ${leave.type}`);
    
    // NOTIFICATION
    const type = status === LeaveStatus.APPROVED ? 'success' : status === LeaveStatus.REJECTED ? 'error' : 'info';
    let msg = `Your ${leave.type} leave request was ${status.toLowerCase()}.`;
    if (status === LeaveStatus.PENDING_ADMIN) msg = `Your ${leave.type} leave has been escalated for Executive Approval.`;
    
    addNotification(leave.employeeId, msg, type);

    set((state) => ({
      leaves: state.leaves.map(l => l.id === id ? { ...l, status } : l)
    }));
  },

  addPerformanceReview: (review) => {
    const { user, employees, logAction, addNotification } = get();
    
    // SECURITY CHECK
    if (user?.role !== Role.ADMIN && user?.role !== Role.HR) {
      logAction('SECURITY_VIOLATION', 'addPerformanceReview', `Unauthorized review attempt by ${user?.name}`);
      return;
    }

    const emp = employees.find(e => e.id === review.employeeId);
    if (emp) {
        logAction('ADD_REVIEW', emp.name, `Rating: ${review.rating}/5`);
        addNotification(emp.id, `You received a new performance review from ${review.reviewerName}.`, 'info');
        set((state) => ({
            reviews: [review, ...state.reviews]
        }));
    }
  },

  updateDepartmentBudget: (department, amount) => {
    const { user, logAction } = get();
    if (user?.role !== Role.ADMIN) {
        logAction('SECURITY_VIOLATION', 'updateBudget', `Unauthorized budget update by ${user?.name}`);
        return;
    }
    
    logAction('UPDATE_BUDGET', department, `New allocation: $${amount}`);
    set((state) => ({
        budgets: state.budgets.map(b => b.department === department ? { ...b, allocated: amount } : b)
    }));
  },

  checkIn: (employeeId) => {
      const { employees, logAction, addNotification } = get();
      const emp = employees.find(e => e.id === employeeId);
      if (!emp) return;

      const newRecord: AttendanceRecord = {
          id: Date.now().toString(),
          employeeId: emp.id,
          employeeName: emp.name,
          date: new Date().toISOString().split('T')[0],
          checkIn: new Date().toISOString(),
          checkOut: null,
          status: new Date().getHours() > 9 ? 'LATE' : 'PRESENT', // Simple logic: after 9 AM is late
          totalHours: 0
      };

      logAction('CHECK_IN', emp.name, `Time: ${new Date().toLocaleTimeString()}`);
      addNotification(emp.id, `Check-in confirmed at ${new Date().toLocaleTimeString()}`, 'success');

      set(state => ({
          attendance: [...state.attendance, newRecord]
      }));
  },

  checkOut: (employeeId) => {
      const { attendance, logAction, addNotification, employees } = get();
      const emp = employees.find(e => e.id === employeeId);
      const today = new Date().toISOString().split('T')[0];
      
      const record = attendance.find(r => r.employeeId === employeeId && r.date === today);
      
      if (record && !record.checkOut) {
          const checkOutTime = new Date();
          const checkInTime = new Date(record.checkIn);
          const hours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

          logAction('CHECK_OUT', record.employeeName, `Time: ${checkOutTime.toLocaleTimeString()} | Duration: ${hours.toFixed(2)}h`);
          if (emp) addNotification(emp.id, `Check-out confirmed. Total hours: ${hours.toFixed(2)}`, 'info');

          set(state => ({
              attendance: state.attendance.map(r => r.id === record.id ? {
                  ...r,
                  checkOut: checkOutTime.toISOString(),
                  totalHours: parseFloat(hours.toFixed(2))
              } : r)
          }));
      }
  },

  addNotification: (userId, message, type) => {
    const newNotif: Notification = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        userId,
        message,
        type,
        isRead: false,
        timestamp: new Date().toISOString()
    };
    set(state => ({ notifications: [newNotif, ...state.notifications] }));
  },

  markNotificationRead: (id) => {
    set(state => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n)
    }));
  },

  clearNotifications: () => {
    const { user } = get();
    if (!user) return;
    set(state => ({
        notifications: state.notifications.filter(n => n.userId !== user.id)
    }));
  }
}));