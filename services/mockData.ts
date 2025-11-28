

import { Employee, Role, LeaveRequest, LeaveStatus, AuditLog, PerformanceReview, Notification, AttendanceRecord, DepartmentBudget } from '../types';

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: '1',
    name: 'Alexandra Admin',
    email: 'admin@nexus.com',
    role: Role.ADMIN,
    department: 'Management',
    salary: 120000,
    joinDate: '2020-01-15',
    avatar: 'https://picsum.photos/seed/admin/200/200',
    leaveBalance: { vacation: 20, sick: 10, personal: 5 }
  },
  {
    id: '2',
    name: 'Sarah HR',
    email: 'hr@nexus.com',
    role: Role.HR,
    department: 'Human Resources',
    salary: 85000,
    joinDate: '2021-03-10',
    avatar: 'https://picsum.photos/seed/hr/200/200',
    leaveBalance: { vacation: 18, sick: 8, personal: 5 }
  },
  {
    id: '3',
    name: 'John Developer',
    email: 'john@nexus.com',
    role: Role.EMPLOYEE,
    department: 'Engineering',
    salary: 95000,
    joinDate: '2022-05-20',
    avatar: 'https://picsum.photos/seed/john/200/200',
    leaveBalance: { vacation: 15, sick: 10, personal: 3 }
  },
  {
    id: '4',
    name: 'Emily Designer',
    email: 'emily@nexus.com',
    role: Role.EMPLOYEE,
    department: 'Design',
    salary: 88000,
    joinDate: '2022-08-01',
    avatar: 'https://picsum.photos/seed/emily/200/200',
    leaveBalance: { vacation: 12, sick: 5, personal: 5 }
  },
  {
    id: '5',
    name: 'Michael Sales',
    email: 'michael@nexus.com',
    role: Role.EMPLOYEE,
    department: 'Sales',
    salary: 75000,
    joinDate: '2023-01-10',
    avatar: 'https://picsum.photos/seed/mike/200/200',
    leaveBalance: { vacation: 20, sick: 10, personal: 5 }
  },
  {
    id: '6',
    name: 'David DevOps',
    email: 'david@nexus.com',
    role: Role.EMPLOYEE,
    department: 'Engineering',
    salary: 105000,
    joinDate: '2021-11-15',
    avatar: 'https://picsum.photos/seed/dave/200/200',
    leaveBalance: { vacation: 22, sick: 12, personal: 6 }
  }
];

export const INITIAL_LEAVES: LeaveRequest[] = [
  {
    id: 'l1',
    employeeId: '3',
    employeeName: 'John Developer',
    type: 'sick',
    startDate: '2023-10-25',
    endDate: '2023-10-27',
    reason: 'Flu and fever',
    status: LeaveStatus.PENDING
  },
  {
    id: 'l2',
    employeeId: '4',
    employeeName: 'Emily Designer',
    type: 'vacation',
    startDate: '2023-11-01',
    endDate: '2023-11-05',
    reason: 'Family trip',
    status: LeaveStatus.APPROVED
  },
  {
    id: 'l3',
    employeeId: '6',
    employeeName: 'David DevOps',
    type: 'vacation',
    startDate: '2024-06-01',
    endDate: '2024-06-15',
    reason: 'Euro trip',
    status: LeaveStatus.PENDING_ADMIN // Needs executive approval (simulated)
  }
];

export const INITIAL_REVIEWS: PerformanceReview[] = [
  {
    id: 'pr-1',
    employeeId: '3', // John
    reviewerId: '2', // Sarah HR
    reviewerName: 'Sarah HR',
    rating: 4,
    feedback: 'John consistently meets deadlines and code quality standards. Needs to improve documentation habits.',
    goals: ['Complete Advanced React Certification', 'Mentor 1 junior developer', 'Update API documentation weekly'],
    date: '2023-06-15'
  },
  {
    id: 'pr-2',
    employeeId: '3', // John
    reviewerId: '1', // Admin
    reviewerName: 'Alexandra Admin',
    rating: 5,
    feedback: 'Exceptional performance on the Q3 migration project. Leadership skills are emerging.',
    goals: ['Lead the Q4 optimization sprint', 'Reduce tech debt by 15%'],
    date: '2023-12-10'
  },
  {
    id: 'pr-3',
    employeeId: '4', // Emily
    reviewerId: '2', // Sarah HR
    reviewerName: 'Sarah HR',
    rating: 3,
    feedback: 'Good creative output but struggles with adherence to the new design system guidelines.',
    goals: ['Master the new Figma Design System', 'Attend weekly design syncs'],
    date: '2023-11-20'
  }
];

export const INITIAL_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    userId: '1',
    userName: 'Alexandra Admin',
    userRole: Role.ADMIN,
    action: 'SYSTEM_INIT',
    target: 'System',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    details: 'System initialized with default data'
  },
  {
    id: 'log-2',
    userId: '2',
    userName: 'Sarah HR',
    userRole: Role.HR,
    action: 'APPROVE_LEAVE',
    target: 'Emily Designer',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    details: 'Approved Vacation request'
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    userId: '1', // Admin
    message: 'System initialization complete. Welcome to Nexus HR.',
    type: 'info',
    isRead: false,
    timestamp: new Date().toISOString()
  },
  {
    id: 'n2',
    userId: '3', // John
    message: 'Welcome to the team! Please update your profile.',
    type: 'success',
    isRead: true,
    timestamp: new Date(Date.now() - 86400000 * 5).toISOString()
  }
];

// Generate last 5 days of attendance for John
const generateMockAttendance = (): AttendanceRecord[] => {
    const records: AttendanceRecord[] = [];
    const today = new Date();
    
    for (let i = 1; i <= 5; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        
        // Random check in between 8:45 and 9:15
        const checkIn = new Date(d);
        checkIn.setHours(8, 45 + Math.floor(Math.random() * 30), 0);
        
        // Random check out between 17:00 and 18:00
        const checkOut = new Date(d);
        checkOut.setHours(17, Math.floor(Math.random() * 60), 0);
        
        const hours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);

        records.push({
            id: `att-${i}`,
            employeeId: '3', // John
            employeeName: 'John Developer',
            date: dateStr,
            checkIn: checkIn.toISOString(),
            checkOut: checkOut.toISOString(),
            status: 'PRESENT',
            totalHours: parseFloat(hours.toFixed(2))
        });
    }
    return records;
};

export const INITIAL_ATTENDANCE: AttendanceRecord[] = generateMockAttendance();

export const INITIAL_BUDGETS: DepartmentBudget[] = [
  { department: 'Engineering', allocated: 450000, year: 2024 },
  { department: 'Human Resources', allocated: 150000, year: 2024 },
  { department: 'Sales', allocated: 180000, year: 2024 },
  { department: 'Management', allocated: 250000, year: 2024 },
  { department: 'Design', allocated: 120000, year: 2024 },
];