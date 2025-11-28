require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { 
  Employee, 
  LeaveRequest, 
  AuditLog, 
  PerformanceReview, 
  AttendanceRecord,
  DepartmentBudget,
  Notification 
} = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nexus_hr')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// --- API ROUTES ---

// 1. Initialization (Fetch all data)
app.get('/api/init', async (req, res) => {
  try {
    const [employees, leaves, logs, reviews, attendance, budgets, notifications] = await Promise.all([
      Employee.find(),
      LeaveRequest.find().sort({ startDate: -1 }),
      AuditLog.find().sort({ timestamp: -1 }),
      PerformanceReview.find().sort({ date: -1 }),
      AttendanceRecord.find().sort({ date: -1 }),
      DepartmentBudget.find(),
      Notification.find().sort({ timestamp: -1 })
    ]);

    // Map _id to id for frontend compatibility
    const mapId = (items) => items.map(item => ({ ...item._doc, id: item._id.toString() }));

    res.json({
      employees: mapId(employees),
      leaves: mapId(leaves),
      logs: mapId(logs),
      reviews: mapId(reviews),
      attendance: mapId(attendance),
      budgets: mapId(budgets),
      notifications: mapId(notifications)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. Employees
app.post('/api/employees', async (req, res) => {
  const newEmp = new Employee(req.body);
  const saved = await newEmp.save();
  res.json({ ...saved._doc, id: saved._id.toString() });
});

app.put('/api/employees/:id', async (req, res) => {
  const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ ...updated._doc, id: updated._id.toString() });
});

app.delete('/api/employees/:id', async (req, res) => {
  await Employee.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// 3. Leaves
app.post('/api/leaves', async (req, res) => {
  const newLeave = new LeaveRequest(req.body);
  const saved = await newLeave.save();
  res.json({ ...saved._doc, id: saved._id.toString() });
});

app.put('/api/leaves/:id', async (req, res) => {
  const updated = await LeaveRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ ...updated._doc, id: updated._id.toString() });
});

// 4. Logs
app.post('/api/logs', async (req, res) => {
  const newLog = new AuditLog(req.body);
  const saved = await newLog.save();
  res.json({ ...saved._doc, id: saved._id.toString() });
});

// 5. Performance
app.post('/api/reviews', async (req, res) => {
  const newReview = new PerformanceReview(req.body);
  const saved = await newReview.save();
  res.json({ ...saved._doc, id: saved._id.toString() });
});

// 6. Attendance
app.post('/api/attendance/checkin', async (req, res) => {
  const record = new AttendanceRecord(req.body);
  const saved = await record.save();
  res.json({ ...saved._doc, id: saved._id.toString() });
});

app.put('/api/attendance/checkout/:id', async (req, res) => {
  const updated = await AttendanceRecord.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ ...updated._doc, id: updated._id.toString() });
});

// 7. Budgets
app.put('/api/budgets/:department', async (req, res) => {
  // Find by department and update, or create if not exists
  const updated = await DepartmentBudget.findOneAndUpdate(
    { department: req.params.department }, 
    req.body, 
    { new: true, upsert: true }
  );
  res.json({ ...updated._doc, id: updated._id.toString() });
});

// 8. Notifications
app.post('/api/notifications', async (req, res) => {
  const notif = new Notification(req.body);
  const saved = await notif.save();
  res.json({ ...saved._doc, id: saved._id.toString() });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));