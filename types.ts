

export enum Role {
  ADMIN = 'ADMIN',
  HR = 'HR',
  EMPLOYEE = 'EMPLOYEE'
}

export interface LeaveBalance {
  vacation: number;
  sick: number;
  personal: number;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  salary: number;
  joinDate: string;
  avatar: string;
  leaveBalance: LeaveBalance;
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PENDING_ADMIN = 'PENDING_ADMIN'
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: keyof LeaveBalance; // Restrict to known leave types
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewerId: string;
  reviewerName: string;
  rating: number; // 1-5 scale
  feedback: string;
  goals: string[];
  date: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  action: string;
  target: string; // The entity being affected (e.g., "John Doe" or "Leave #123")
  timestamp: string;
  details?: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  timestamp: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  checkIn: string; // ISO string
  checkOut: string | null; // ISO string
  status: 'PRESENT' | 'LATE' | 'HALF_DAY' | 'ABSENT';
  totalHours: number;
}

export interface DepartmentBudget {
  department: string;
  allocated: number;
  year: number;
}

export interface UserState {
  currentUser: Employee | null;
  isAuthenticated: boolean;
}

export interface DashboardStats {
  totalEmployees: number;
  avgSalary: number;
  pendingLeaves: number;
}