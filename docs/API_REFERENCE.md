# 🔌 API Reference

Base URL: `http://localhost:5000/api`

## Authentication / Init
- **GET** `/init`
    - Fetches all initial state data (Employees, Leaves, Logs) in a single request for SPA hydration.

## Employees
- **POST** `/employees` - Create new employee (Admin only).
- **PUT** `/employees/:id` - Update profile/salary.
- **DELETE** `/employees/:id` - Soft delete employee.

## Leave Management
- **POST** `/leaves` - Submit new request.
- **PUT** `/leaves/:id` - Update status (Approve/Reject).
    - *Logic:* If status becomes `APPROVED`, backend triggers balance deduction logic.

## Attendance
- **POST** `/attendance/checkin`
    - Creates a new daily record. Marks `status: LATE` if time > 09:00.
- **PUT** `/attendance/checkout/:id`
    - Updates record with `checkOut` time and calculates `totalHours`.

## Analytics & Logs
- **POST** `/logs`
    - Internal endpoint called by other services to record audit trails.
- **GET** `/budgets`
    - Returns departmental allocation vs utilization.

---

**Note:** The backend is currently configured to run alongside the frontend. Ensure MongoDB is running before starting the Node server.