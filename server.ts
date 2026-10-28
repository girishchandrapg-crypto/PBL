import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import * as dbQueries from './src/db/queries.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// CORS headers for development flexibility
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// ================= AUTH API =================
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, role } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    let user = await dbQueries.getUserByEmail(email);
    if (!user) {
      // Create guest/demo profile
      user = await dbQueries.upsertUser({
        uid: `usr_${Date.now()}`,
        email,
        name: email.split('@')[0].replace('.', ' ').toUpperCase(),
        role: role || 'student',
      });
    }

    // Find linked student or teacher record if applicable
    let linkedStudent = null;
    let linkedTeacher = null;

    if (user.role === 'student' || user.id) {
      const studentData = await dbQueries.getStudents({ search: user.email, limit: 1 });
      if (studentData?.students?.length) {
        linkedStudent = studentData.students[0];
      }
    }
    if (user.role === 'teacher' || user.id) {
      const teachers = await dbQueries.getTeachers();
      linkedTeacher = teachers?.find((t) => t.email.toLowerCase() === user.email.toLowerCase()) || null;
    }

    res.json({
      token: `campuscore_jwt_${user.id}_${Date.now()}`,
      user: {
        id: user.id,
        uid: user.uid,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        studentProfile: linkedStudent,
        teacherProfile: linkedTeacher,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message || 'Authentication failed' });
  }
});

// Demo account selector
app.post('/api/auth/demo-switch', async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    let targetEmail = 'admin@campuscore.edu';
    if (role === 'teacher') targetEmail = 'alan.vance@campuscore.edu';
    if (role === 'student') targetEmail = 'alex.turner@student.campuscore.edu';

    let user = await dbQueries.getUserByEmail(targetEmail);
    if (!user) {
      user = await dbQueries.upsertUser({
        uid: `usr_${role}_demo`,
        email: targetEmail,
        name: role === 'admin' ? 'Administrator Eleanor Davis' : role === 'teacher' ? 'Dr. Alan Vance' : 'Alex Turner',
        role,
      });
    }

    let linkedStudent = null;
    let linkedTeacher = null;

    if (role === 'student') {
      const studentData = await dbQueries.getStudents({ search: 'Alex Turner', limit: 1 });
      if (studentData?.students?.length) linkedStudent = studentData.students[0];
    } else if (role === 'teacher') {
      const teachers = await dbQueries.getTeachers();
      linkedTeacher = teachers?.find((t) => t.email.toLowerCase() === targetEmail.toLowerCase()) || null;
    }

    res.json({
      token: `campuscore_jwt_${user.id}_${Date.now()}`,
      user: {
        id: user.id,
        uid: user.uid,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        studentProfile: linkedStudent,
        teacherProfile: linkedTeacher,
      },
    });
  } catch (err: any) {
    console.error('Demo switch error:', err);
    res.status(500).json({ error: err.message || 'Failed to switch demo account' });
  }
});

// ================= DASHBOARD =================
app.get('/api/dashboard/stats', async (_req: Request, res: Response) => {
  try {
    const stats = await dbQueries.getDashboardStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to load dashboard metrics' });
  }
});

// ================= STUDENTS =================
app.get('/api/students', async (req: Request, res: Response) => {
  try {
    const { search, departmentId, courseId, year, semester, section, status, limit, offset } = req.query;
    const result = await dbQueries.getStudents({
      search: search as string,
      departmentId: departmentId ? parseInt(departmentId as string, 10) : undefined,
      courseId: courseId ? parseInt(courseId as string, 10) : undefined,
      year: year ? parseInt(year as string, 10) : undefined,
      semester: semester ? parseInt(semester as string, 10) : undefined,
      section: section as string,
      status: status as string,
      limit: limit ? parseInt(limit as string, 10) : 50,
      offset: offset ? parseInt(offset as string, 10) : 0,
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch students' });
  }
});

app.get('/api/students/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const student = await dbQueries.getStudentById(id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch student details' });
  }
});

app.post('/api/students', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    // Auto-generate studentId and roll number if not provided
    if (!data.studentId) {
      data.studentId = `STU-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    }
    if (!data.rollNumber) {
      data.rollNumber = `ROLL-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    if (!data.admissionDate) {
      data.admissionDate = new Date().toISOString().split('T')[0];
    }
    const created = await dbQueries.createStudent(data);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create student' });
  }
});

app.put('/api/students/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updated = await dbQueries.updateStudent(id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update student' });
  }
});

app.delete('/api/students/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = await dbQueries.deleteStudent(id);
    res.json({ success: true, deleted });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to delete student' });
  }
});

// ================= TEACHERS =================
app.get('/api/teachers', async (_req: Request, res: Response) => {
  try {
    const list = await dbQueries.getTeachers();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch teachers' });
  }
});

app.post('/api/teachers', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (!data.teacherId) {
      data.teacherId = `TCH-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    }
    const created = await dbQueries.createTeacher(data);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create teacher' });
  }
});

app.put('/api/teachers/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updated = await dbQueries.updateTeacher(id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update teacher' });
  }
});

app.delete('/api/teachers/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = await dbQueries.deleteTeacher(id);
    res.json({ success: true, deleted });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to delete teacher' });
  }
});

// ================= DEPARTMENTS & COURSES & SUBJECTS =================
app.get('/api/departments', async (_req: Request, res: Response) => {
  try {
    const list = await dbQueries.getDepartments();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch departments' });
  }
});

app.post('/api/departments', async (req: Request, res: Response) => {
  try {
    const created = await dbQueries.createDepartment(req.body);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create department' });
  }
});

app.get('/api/courses', async (_req: Request, res: Response) => {
  try {
    const list = await dbQueries.getCourses();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch courses' });
  }
});

app.post('/api/courses', async (req: Request, res: Response) => {
  try {
    const created = await dbQueries.createCourse(req.body);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create course' });
  }
});

app.get('/api/subjects', async (_req: Request, res: Response) => {
  try {
    const list = await dbQueries.getSubjects();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch subjects' });
  }
});

app.post('/api/subjects', async (req: Request, res: Response) => {
  try {
    const created = await dbQueries.createSubject(req.body);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create subject' });
  }
});

// ================= ATTENDANCE =================
app.get('/api/attendance', async (req: Request, res: Response) => {
  try {
    const { subjectId, date, courseId, studentId } = req.query;
    const records = await dbQueries.getAttendanceRecords({
      subjectId: subjectId ? parseInt(subjectId as string, 10) : undefined,
      date: date as string,
      courseId: courseId ? parseInt(courseId as string, 10) : undefined,
      studentId: studentId ? parseInt(studentId as string, 10) : undefined,
    });
    res.json(records);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch attendance' });
  }
});

app.post('/api/attendance', async (req: Request, res: Response) => {
  try {
    const { records } = req.body;
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: 'Records array is required' });
    }
    const saved = await dbQueries.recordAttendance(records);
    res.status(201).json(saved);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to record attendance' });
  }
});

// ================= MARKS & GRADES =================
app.get('/api/marks', async (req: Request, res: Response) => {
  try {
    const { studentId, subjectId, semester } = req.query;
    const list = await dbQueries.getMarks({
      studentId: studentId ? parseInt(studentId as string, 10) : undefined,
      subjectId: subjectId ? parseInt(subjectId as string, 10) : undefined,
      semester: semester ? parseInt(semester as string, 10) : undefined,
    });
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch marks' });
  }
});

app.post('/api/marks', async (req: Request, res: Response) => {
  try {
    const result = await dbQueries.upsertMarks(req.body);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to record marks' });
  }
});

app.get('/api/grades/settings', async (_req: Request, res: Response) => {
  try {
    const list = await dbQueries.getGradeSettings();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch grade settings' });
  }
});

app.put('/api/grades/settings/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updated = await dbQueries.updateGradeSetting(id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update grade setting' });
  }
});

// ================= FEES =================
app.get('/api/fees', async (req: Request, res: Response) => {
  try {
    const { studentId, status } = req.query;
    const list = await dbQueries.getFees({
      studentId: studentId ? parseInt(studentId as string, 10) : undefined,
      status: status as string,
    });
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch fees' });
  }
});

app.post('/api/fees', async (req: Request, res: Response) => {
  try {
    const created = await dbQueries.createFee(req.body);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create fee' });
  }
});

app.put('/api/fees/:id/pay', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { amount, paymentMethod } = req.body;
    const updated = await dbQueries.recordPayment(id, Number(amount), paymentMethod || 'Online');
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to record payment' });
  }
});

// ================= TIMETABLE =================
app.get('/api/timetables', async (req: Request, res: Response) => {
  try {
    const { courseId, semester, section, teacherId } = req.query;
    const list = await dbQueries.getTimetables({
      courseId: courseId ? parseInt(courseId as string, 10) : undefined,
      semester: semester ? parseInt(semester as string, 10) : undefined,
      section: section as string,
      teacherId: teacherId ? parseInt(teacherId as string, 10) : undefined,
    });
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch timetable' });
  }
});

app.post('/api/timetables', async (req: Request, res: Response) => {
  try {
    const created = await dbQueries.createTimetableEntry(req.body);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create timetable slot' });
  }
});

app.delete('/api/timetables/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = await dbQueries.deleteTimetableEntry(id);
    res.json({ success: true, deleted });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to delete timetable entry' });
  }
});

// ================= ASSIGNMENTS =================
app.get('/api/assignments', async (req: Request, res: Response) => {
  try {
    const { courseId, semester, teacherId } = req.query;
    const list = await dbQueries.getAssignments({
      courseId: courseId ? parseInt(courseId as string, 10) : undefined,
      semester: semester ? parseInt(semester as string, 10) : undefined,
      teacherId: teacherId ? parseInt(teacherId as string, 10) : undefined,
    });
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch assignments' });
  }
});

app.post('/api/assignments', async (req: Request, res: Response) => {
  try {
    const created = await dbQueries.createAssignment(req.body);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create assignment' });
  }
});

app.post('/api/assignments/:id/submit', async (req: Request, res: Response) => {
  try {
    const assignmentId = parseInt(req.params.id, 10);
    const { studentId, content, fileName, fileUrl } = req.body;
    const submission = await dbQueries.submitAssignment({
      assignmentId,
      studentId: parseInt(studentId, 10),
      content,
      fileName: fileName || 'Submission_Document.pdf',
      fileUrl: fileUrl || '#',
    });
    res.status(201).json(submission);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to submit assignment' });
  }
});

app.get('/api/assignments/:id/submissions', async (req: Request, res: Response) => {
  try {
    const assignmentId = parseInt(req.params.id, 10);
    const submissions = await dbQueries.getSubmissions(assignmentId);
    res.json(submissions);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch submissions' });
  }
});

// ================= ANNOUNCEMENTS =================
app.get('/api/announcements', async (_req: Request, res: Response) => {
  try {
    const list = await dbQueries.getAnnouncements();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch announcements' });
  }
});

app.post('/api/announcements', async (req: Request, res: Response) => {
  try {
    const created = await dbQueries.createAnnouncement(req.body);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create announcement' });
  }
});

app.delete('/api/announcements/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = await dbQueries.deleteAnnouncement(id);
    res.json({ success: true, deleted });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to delete announcement' });
  }
});

// ================= VITE DEV / PRODUCTION INTEGRATION =================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CampusCore Student Management System API & Web Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
