export type Role = 'admin' | 'teacher' | 'student';

export interface User {
  id: number;
  uid: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string | null;
  studentProfile?: Student | null;
  teacherProfile?: Teacher | null;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  hod?: string | null;
  createdAt?: string;
}

export interface Course {
  id: number;
  departmentId: number;
  name: string;
  code: string;
  duration: string;
  description?: string | null;
  totalSemesters: number;
  departmentName?: string;
  departmentCode?: string;
}

export interface Teacher {
  id: number;
  teacherId: string;
  userId?: number | null;
  name: string;
  email: string;
  phone?: string | null;
  departmentId: number;
  qualification?: string | null;
  joiningDate?: string | null;
  status: 'Active' | 'On Leave' | 'Inactive';
  avatar?: string | null;
  departmentName?: string;
  departmentCode?: string;
}

export interface Student {
  id: number;
  studentId: string;
  userId?: number | null;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  profilePhoto?: string | null;
  admissionDate: string;
  courseId: number;
  departmentId: number;
  year: number;
  semester: number;
  section: string;
  rollNumber: string;
  parentName?: string | null;
  parentPhone?: string | null;
  emergencyContact?: string | null;
  status: 'Active' | 'Graduated' | 'Suspended' | 'Inactive';
  createdAt?: string;
  courseName?: string;
  courseCode?: string;
  departmentName?: string;
  departmentCode?: string;
}

export interface Subject {
  id: number;
  code: string;
  name: string;
  courseId: number;
  semester: number;
  teacherId?: number | null;
  credits: number;
  courseName?: string;
  teacherName?: string;
}

export interface AttendanceRecord {
  id: number;
  studentId: number;
  subjectId: number;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  remarks?: string | null;
  studentName?: string;
  studentCode?: string;
  rollNumber?: string;
  subjectName?: string;
  subjectCode?: string;
}

export interface MarkRecord {
  id: number;
  studentId: number;
  subjectId: number;
  internalMarks: number;
  assignmentMarks: number;
  practicalMarks: number;
  midtermMarks: number;
  finalMarks: number;
  totalMarks: number;
  maxMarks: number;
  percentage: number;
  grade: string;
  status: 'Pass' | 'Fail';
  semester: number;
  academicYear: string;
  studentName?: string;
  studentCode?: string;
  rollNumber?: string;
  subjectName?: string;
  subjectCode?: string;
  credits?: number;
}

export interface FeeRecord {
  id: number;
  studentId: number;
  title: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  dueDate: string;
  paidDate?: string | null;
  status: 'Paid' | 'Partially Paid' | 'Pending';
  receiptNumber?: string | null;
  paymentMethod?: string | null;
  studentName?: string;
  studentCode?: string;
  rollNumber?: string;
  courseCode?: string;
}

export interface TimetableSlot {
  id: number;
  courseId: number;
  semester: number;
  section: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string;
  endTime: string;
  subjectId: number;
  teacherId: number;
  classroom: string;
  subjectName?: string;
  subjectCode?: string;
  teacherName?: string;
  courseName?: string;
  courseCode?: string;
}

export interface Assignment {
  id: number;
  title: string;
  description: string;
  subjectId: number;
  courseId: number;
  semester: number;
  teacherId: number;
  dueDate: string;
  maxScore: number;
  attachmentName?: string | null;
  attachmentUrl?: string | null;
  subjectName?: string;
  subjectCode?: string;
  teacherName?: string;
}

export interface AssignmentSubmission {
  id: number;
  assignmentId: number;
  studentId: number;
  submittedAt: string;
  content?: string | null;
  fileName?: string | null;
  fileUrl?: string | null;
  status: 'Submitted' | 'Graded';
  score?: number | null;
  feedback?: string | null;
  studentName?: string;
  studentCode?: string;
  rollNumber?: string;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  category: 'Academic' | 'Exam' | 'Event' | 'General' | 'Fees';
  targetAudience: 'All' | 'Students' | 'Teachers';
  authorName: string;
  publishedDate: string;
  priority: 'High' | 'Normal' | 'Low';
}

export interface GradeSetting {
  id: number;
  grade: string;
  minScore: number;
  maxScore: number;
  description?: string | null;
  isPass: number;
}
