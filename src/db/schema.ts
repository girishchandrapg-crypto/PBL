import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Users table (for Auth & User Management)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID or system UID
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: text('role').notNull().default('student'), // 'admin' | 'teacher' | 'student'
  avatar: text('avatar'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Departments
export const departments = pgTable('departments', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  description: text('description'),
  hod: text('hod'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Courses
export const courses = pgTable('courses', {
  id: serial('id').primaryKey(),
  departmentId: integer('department_id').references(() => departments.id),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  duration: text('duration').notNull().default('4 Years'),
  description: text('description'),
  totalSemesters: integer('total_semesters').notNull().default(8),
  createdAt: timestamp('created_at').defaultNow(),
});

// Teachers
export const teachers = pgTable('teachers', {
  id: serial('id').primaryKey(),
  teacherId: text('teacher_id').notNull().unique(),
  userId: integer('user_id').references(() => users.id),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  departmentId: integer('department_id').references(() => departments.id),
  qualification: text('qualification'),
  joiningDate: text('joining_date'),
  status: text('status').notNull().default('Active'),
  avatar: text('avatar'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Students
export const students = pgTable('students', {
  id: serial('id').primaryKey(),
  studentId: text('student_id').notNull().unique(),
  userId: integer('user_id').references(() => users.id),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  dateOfBirth: text('date_of_birth').notNull(),
  gender: text('gender').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone').notNull(),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  pincode: text('pincode'),
  profilePhoto: text('profile_photo'),
  admissionDate: text('admission_date').notNull(),
  courseId: integer('course_id').references(() => courses.id),
  departmentId: integer('department_id').references(() => departments.id),
  year: integer('year').notNull().default(1),
  semester: integer('semester').notNull().default(1),
  section: text('section').notNull().default('A'),
  rollNumber: text('roll_number').notNull(),
  parentName: text('parent_name'),
  parentPhone: text('parent_phone'),
  emergencyContact: text('emergency_contact'),
  status: text('status').notNull().default('Active'), // 'Active' | 'Graduated' | 'Suspended' | 'Inactive'
  createdAt: timestamp('created_at').defaultNow(),
});

// Subjects
export const subjects = pgTable('subjects', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  courseId: integer('course_id').references(() => courses.id),
  semester: integer('semester').notNull().default(1),
  teacherId: integer('teacher_id').references(() => teachers.id),
  credits: integer('credits').notNull().default(3),
  createdAt: timestamp('created_at').defaultNow(),
});

// Attendance
export const attendance = pgTable('attendance', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => students.id).notNull(),
  subjectId: integer('subject_id').references(() => subjects.id).notNull(),
  date: text('date').notNull(), // YYYY-MM-DD
  status: text('status').notNull(), // 'Present' | 'Absent' | 'Late' | 'Excused'
  markedBy: integer('marked_by').references(() => users.id),
  remarks: text('remarks'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Marks
export const marks = pgTable('marks', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => students.id).notNull(),
  subjectId: integer('subject_id').references(() => subjects.id).notNull(),
  internalMarks: integer('internal_marks').notNull().default(0),
  assignmentMarks: integer('assignment_marks').notNull().default(0),
  practicalMarks: integer('practical_marks').notNull().default(0),
  midtermMarks: integer('midterm_marks').notNull().default(0),
  finalMarks: integer('final_marks').notNull().default(0),
  totalMarks: integer('total_marks').notNull().default(0),
  maxMarks: integer('max_marks').notNull().default(100),
  percentage: integer('percentage').notNull().default(0),
  grade: text('grade').notNull().default('F'),
  status: text('status').notNull().default('Pass'), // 'Pass' | 'Fail'
  semester: integer('semester').notNull().default(1),
  academicYear: text('academic_year').notNull().default('2024-2025'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Fees
export const fees = pgTable('fees', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => students.id).notNull(),
  title: text('title').notNull(),
  totalAmount: integer('total_amount').notNull(),
  paidAmount: integer('paid_amount').notNull().default(0),
  pendingAmount: integer('pending_amount').notNull().default(0),
  dueDate: text('due_date').notNull(),
  paidDate: text('paid_date'),
  status: text('status').notNull().default('Pending'), // 'Paid' | 'Partially Paid' | 'Pending'
  receiptNumber: text('receipt_number'),
  paymentMethod: text('payment_method'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Timetables
export const timetables = pgTable('timetables', {
  id: serial('id').primaryKey(),
  courseId: integer('course_id').references(() => courses.id).notNull(),
  semester: integer('semester').notNull().default(1),
  section: text('section').notNull().default('A'),
  day: text('day').notNull(), // 'Monday', 'Tuesday', etc.
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  subjectId: integer('subject_id').references(() => subjects.id).notNull(),
  teacherId: integer('teacher_id').references(() => teachers.id).notNull(),
  classroom: text('classroom').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Assignments
export const assignments = pgTable('assignments', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  subjectId: integer('subject_id').references(() => subjects.id).notNull(),
  courseId: integer('course_id').references(() => courses.id).notNull(),
  semester: integer('semester').notNull().default(1),
  teacherId: integer('teacher_id').references(() => teachers.id).notNull(),
  dueDate: text('due_date').notNull(),
  maxScore: integer('max_score').notNull().default(100),
  attachmentName: text('attachment_name'),
  attachmentUrl: text('attachment_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Assignment Submissions
export const assignmentSubmissions = pgTable('assignment_submissions', {
  id: serial('id').primaryKey(),
  assignmentId: integer('assignment_id').references(() => assignments.id).notNull(),
  studentId: integer('student_id').references(() => students.id).notNull(),
  content: text('content'),
  fileUrl: text('file_url'),
  fileName: text('file_name'),
  status: text('status').notNull().default('Submitted'), // 'Submitted' | 'Graded'
  score: integer('score'),
  feedback: text('feedback'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Announcements
export const announcements = pgTable('announcements', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  category: text('category').notNull().default('General'), // 'Academic' | 'Exam' | 'Event' | 'General' | 'Fees'
  targetAudience: text('target_audience').notNull().default('All'), // 'All' | 'Students' | 'Teachers'
  authorName: text('author_name').notNull(),
  publishedDate: text('published_date').notNull(),
  priority: text('priority').notNull().default('Normal'), // 'High' | 'Normal' | 'Low'
  createdAt: timestamp('created_at').defaultNow(),
});

// Grade Settings
export const gradeSettings = pgTable('grade_settings', {
  id: serial('id').primaryKey(),
  grade: text('grade').notNull().unique(),
  minScore: integer('min_score').notNull(),
  maxScore: integer('max_score').notNull(),
  description: text('description'),
  isPass: integer('is_pass').notNull().default(1),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  student: one(students, {
    fields: [users.id],
    references: [students.userId],
  }),
  teacher: one(teachers, {
    fields: [users.id],
    references: [teachers.userId],
  }),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(users, {
    fields: [students.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [students.courseId],
    references: [courses.id],
  }),
  department: one(departments, {
    fields: [students.departmentId],
    references: [departments.id],
  }),
  attendanceRecords: many(attendance),
  marksRecords: many(marks),
  feeRecords: many(fees),
  submissions: many(assignmentSubmissions),
}));

export const teachersRelations = relations(teachers, ({ one, many }) => ({
  user: one(users, {
    fields: [teachers.userId],
    references: [users.id],
  }),
  department: one(departments, {
    fields: [teachers.departmentId],
    references: [departments.id],
  }),
  subjects: many(subjects),
  timetables: many(timetables),
  assignments: many(assignments),
}));

export const departmentsRelations = relations(departments, ({ many }) => ({
  courses: many(courses),
  teachers: many(teachers),
  students: many(students),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  department: one(departments, {
    fields: [courses.departmentId],
    references: [departments.id],
  }),
  subjects: many(subjects),
  students: many(students),
  timetables: many(timetables),
  assignments: many(assignments),
}));

export const subjectsRelations = relations(subjects, ({ one, many }) => ({
  course: one(courses, {
    fields: [subjects.courseId],
    references: [courses.id],
  }),
  teacher: one(teachers, {
    fields: [subjects.teacherId],
    references: [teachers.id],
  }),
  attendanceRecords: many(attendance),
  marksRecords: many(marks),
  assignments: many(assignments),
}));
