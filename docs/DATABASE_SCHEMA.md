# 🗄 Database Schema (MongoDB)

The application uses a document-oriented data model designed for flexibility and speed.

## Collections

### 1. `employees`
Stores user profile, authentication, and role data.

| Field | Type | Description |
| :--- | :--- | :--- |
| `_id` | ObjectId | Unique Identifier |
| `name` | String | Full Name |
| `email` | String | Unique Login Email |
| `role` | Enum | `ADMIN`, `HR`, `EMPLOYEE` |
| `department` | String | Department Name |
| `salary` | Number | Annual Salary |
| `leaveBalance` | Object | `{ vacation: Number, sick: Number, personal: Number }` |

### 2. `leaverequests`
Tracks all time-off applications and their approval status.

| Field | Type | Description |
| :--- | :--- | :--- |
| `employeeId` | ObjectId | Ref -> employees |
| `type` | String | `vacation`, `sick`, `personal` |
| `startDate` | Date | ISO String |
| `endDate` | Date | ISO String |
| `status` | Enum | `PENDING`, `APPROVED`, `REJECTED`, `PENDING_ADMIN` |
| `reason` | String | User justification |

### 3. `auditlogs`
**Critical for Compliance.** Immutable record of system changes.

| Field | Type | Description |
| :--- | :--- | :--- |
| `userId` | ObjectId | Actor who performed the action |
| `action` | String | e.g., `DELETE_EMPLOYEE`, `APPROVE_LEAVE` |
| `target` | String | Name of the entity affected |
| `timestamp` | Date | Time of occurrence |
| `details` | String | JSON string of changes |

### 4. `attendancerecords`
Daily punch-clock data.

| Field | Type | Description |
| :--- | :--- | :--- |
| `employeeId` | ObjectId | Ref -> employees |
| `checkIn` | Date | Login timestamp |
| `checkOut` | Date | Logout timestamp |
| `status` | Enum | `PRESENT`, `LATE`, `ABSENT` |
| `totalHours` | Number | Calculated duration |

### 5. `performancereviews`
Quarterly/Annual reviews.

| Field | Type | Description |
| :--- | :--- | :--- |
| `employeeId` | ObjectId | Subject of review |
| `reviewerId` | ObjectId | HR/Admin author |
| `rating` | Number | 1-5 Scale |
| `goals` | Array | List of string goals |
